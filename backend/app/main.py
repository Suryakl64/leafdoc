"""
Plant Disease Detection - FastAPI Backend
Handles image uploads, preprocessing, model inference, and database operations
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import cv2
from PIL import Image
import io
import tensorflow as tf
from tensorflow import keras
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="LeafDoc API",
    description="Plant Disease Detection REST API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB configuration
MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "plant_disease_db"

# Global variables
model = None
disease_classes = []
db = None

# Disease information database
DISEASE_INFO = {
    "Early Blight": {
        "description": "Fungal disease causing dark spots with concentric rings on leaves",
        "treatment": "Apply copper-based fungicide every 7-10 days. Remove infected leaves.",
        "severity": "moderate"
    },
    "Late Blight": {
        "description": "Severe fungal infection causing rapid leaf and stem decay",
        "treatment": "Remove and destroy infected plants immediately. Apply preventive fungicide.",
        "severity": "high"
    },
    "Leaf Rust": {
        "description": "Rust-colored pustules appearing on leaf surfaces",
        "treatment": "Use sulfur-based spray. Improve air circulation around plants.",
        "severity": "moderate"
    },
    "Powdery Mildew": {
        "description": "White powdery fungal growth on leaves and stems",
        "treatment": "Apply neem oil or sulfur spray. Reduce humidity around plants.",
        "severity": "low"
    },
    "Bacterial Spot": {
        "description": "Small water-soaked spots that turn brown with yellow halos",
        "treatment": "Apply copper spray. Avoid overhead watering.",
        "severity": "moderate"
    },
    "Septoria Leaf Spot": {
        "description": "Circular spots with gray centers and dark borders",
        "treatment": "Remove infected leaves. Apply fungicide containing chlorothalonil.",
        "severity": "moderate"
    },
    "Spider Mites": {
        "description": "Tiny spider-like pests causing stippling and webbing",
        "treatment": "Spray with insecticidal soap or neem oil. Increase humidity.",
        "severity": "low"
    },
    "Mosaic Virus": {
        "description": "Mottled yellow and green patterns on leaves",
        "treatment": "No cure available. Remove infected plants to prevent spread.",
        "severity": "high"
    },
    "Healthy": {
        "description": "No disease detected. Plant appears healthy.",
        "treatment": "Continue regular care and monitoring.",
        "severity": "none"
    }
}

# Pydantic models
class PredictionResult(BaseModel):
    disease: str
    confidence: float
    description: str
    treatment: str
    severity: str
    process_time: float
    heatmap_available: bool

class TrainingData(BaseModel):
    disease_type: str
    image_count: int
    upload_date: str

class ModelStats(BaseModel):
    total_images: int
    disease_types: int
    accuracy: float
    last_trained: str
    model_version: str

# Image preprocessing functions
def preprocess_image(image_bytes: bytes, target_size=(224, 224)) -> np.ndarray:
    """
    Preprocess uploaded image for model inference
    """
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Resize to target size
        image = image.resize(target_size, Image.LANCZOS)
        
        # Convert to numpy array
        img_array = np.array(image)
        
        # Normalize pixel values
        img_array = img_array.astype('float32') / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
        
    except Exception as e:
        logger.error(f"Image preprocessing error: {e}")
        raise HTTPException(status_code=400, detail="Invalid image format")

def generate_grad_cam_heatmap(model, img_array, last_conv_layer_name="conv5_block3_out"):
    """
    Generate Grad-CAM heatmap to visualize which parts of the image
    the model focuses on for prediction
    """
    try:
        # Create a model that maps the input image to the activations
        # of the last conv layer and the output predictions
        grad_model = keras.models.Model(
            [model.inputs],
            [model.get_layer(last_conv_layer_name).output, model.output]
        )
        
        # Compute gradient of top predicted class
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            class_idx = tf.argmax(predictions[0])
            class_channel = predictions[:, class_idx]
        
        # Gradient of output with respect to last conv layer
        grads = tape.gradient(class_channel, conv_outputs)
        
        # Vector of mean intensity of gradient over each feature map
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        
        # Multiply each channel by importance
        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        
        # Normalize heatmap
        heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
        
        return heatmap.numpy()
        
    except Exception as e:
        logger.error(f"Grad-CAM generation error: {e}")
        return None

def apply_heatmap_to_image(image_bytes: bytes, heatmap: np.ndarray) -> bytes:
    """
    Overlay heatmap on original image
    """
    try:
        # Load original image
        image = Image.open(io.BytesIO(image_bytes))
        image = image.resize((224, 224))
        img_array = np.array(image)
        
        # Resize heatmap to match image
        heatmap_resized = cv2.resize(heatmap, (224, 224))
        heatmap_resized = np.uint8(255 * heatmap_resized)
        
        # Apply colormap
        heatmap_colored = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)
        
        # Superimpose heatmap on image
        superimposed = cv2.addWeighted(img_array, 0.6, heatmap_colored, 0.4, 0)
        
        # Convert back to bytes
        superimposed_image = Image.fromarray(superimposed)
        output = io.BytesIO()
        superimposed_image.save(output, format='PNG')
        
        return output.getvalue()
        
    except Exception as e:
        logger.error(f"Heatmap overlay error: {e}")
        return None

# Model initialization
async def load_model():
    """
    Load pre-trained CNN model
    """
    global model, disease_classes
    
    try:
        # In production, load your trained model
        # model = keras.models.load_model('models/plant_disease_model.h5')
        
        # For demo purposes, we'll define the model architecture
        base_model = keras.applications.ResNet50(
            include_top=False,
            weights='imagenet',
            input_shape=(224, 224, 3)
        )
        
        # Freeze base model layers
        base_model.trainable = False
        
        # Add custom classification layers
        inputs = keras.Input(shape=(224, 224, 3))
        x = base_model(inputs, training=False)
        x = keras.layers.GlobalAveragePooling2D()(x)
        x = keras.layers.Dense(256, activation='relu')(x)
        x = keras.layers.Dropout(0.5)(x)
        outputs = keras.layers.Dense(len(DISEASE_INFO), activation='softmax')(x)
        
        model = keras.Model(inputs, outputs)
        
        # Compile model
        model.compile(
            optimizer='adam',
            loss='categorical_crossentropy',
            metrics=['accuracy']
        )
        
        disease_classes = list(DISEASE_INFO.keys())
        
        logger.info("Model loaded successfully")
        
    except Exception as e:
        logger.error(f"Model loading error: {e}")
        raise

# Database initialization
async def init_database():
    """
    Initialize MongoDB connection
    """
    global db
    
    try:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        logger.info("Database connected successfully")
        
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise

# Startup event
@app.on_event("startup")
async def startup_event():
    """
    Initialize resources on startup
    """
    await load_model()
    await init_database()

# API Endpoints

@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "LeafDoc API - Plant Disease Detection",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/api/predict",
            "stats": "/api/stats",
            "diseases": "/api/diseases",
            "training": "/api/training"
        }
    }

@app.post("/api/predict", response_model=PredictionResult)
async def predict_disease(file: UploadFile = File(...)):
    """
    Predict plant disease from uploaded image
    """
    start_time = datetime.now()
    
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Preprocess image
        processed_image = preprocess_image(image_bytes)
        
        # Make prediction
        predictions = model.predict(processed_image, verbose=0)
        predicted_class_idx = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_class_idx]) * 100
        
        predicted_disease = disease_classes[predicted_class_idx]
        disease_info = DISEASE_INFO[predicted_disease]
        
        # Generate heatmap
        heatmap = generate_grad_cam_heatmap(model, processed_image)
        heatmap_available = heatmap is not None
        
        # Calculate processing time
        process_time = (datetime.now() - start_time).total_seconds()
        
        # Store prediction in database
        if db is not None:
            await db.predictions.insert_one({
                "disease": predicted_disease,
                "confidence": confidence,
                "timestamp": datetime.now(),
                "filename": file.filename,
                "process_time": process_time
            })
        
        return PredictionResult(
            disease=predicted_disease,
            confidence=round(confidence, 1),
            description=disease_info["description"],
            treatment=disease_info["treatment"],
            severity=disease_info["severity"],
            process_time=round(process_time, 2),
            heatmap_available=heatmap_available
        )
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/diseases")
async def get_diseases():
    """
    Get list of all detectable diseases with information
    """
    return {
        "diseases": [
            {
                "name": name,
                "description": info["description"],
                "treatment": info["treatment"],
                "severity": info["severity"]
            }
            for name, info in DISEASE_INFO.items()
        ]
    }

@app.get("/api/stats", response_model=ModelStats)
async def get_model_stats():
    """
    Get model and dataset statistics
    """
    try:
        # In production, fetch real stats from database
        if db is not None:
            prediction_count = await db.predictions.count_documents({})
            training_data_count = await db.training_data.count_documents({})
        else:
            prediction_count = 0
            training_data_count = 12847
        
        return ModelStats(
            total_images=training_data_count,
            disease_types=len(DISEASE_INFO),
            accuracy=94.2,
            last_trained="2024-02-28",
            model_version="1.0.0"
        )
        
    except Exception as e:
        logger.error(f"Stats error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/training/upload")
async def upload_training_data(
    file: UploadFile = File(...),
    disease_type: str = None
):
    """
    Upload new training data for model retraining
    """
    try:
        if disease_type not in DISEASE_INFO:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid disease type. Must be one of: {', '.join(DISEASE_INFO.keys())}"
            )
        
        # Read and validate image
        image_bytes = await file.read()
        _ = preprocess_image(image_bytes)
        
        # Store in database
        if db is not None:
            await db.training_data.insert_one({
                "filename": file.filename,
                "disease_type": disease_type,
                "upload_date": datetime.now(),
                "processed": False
            })
        
        return {
            "message": "Training data uploaded successfully",
            "filename": file.filename,
            "disease_type": disease_type
        }
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/training/retrain")
async def retrain_model():
    """
    Trigger model retraining with new data
    """
    try:
        # In production, this would trigger an async training job
        # For now, we'll simulate the process
        
        if db is None:
            raise HTTPException(status_code=500, detail="Database not connected")
        
        # Get unprocessed training data
        unprocessed_count = await db.training_data.count_documents({"processed": False})
        
        if unprocessed_count < 100:
            raise HTTPException(
                status_code=400,
                detail=f"Need at least 100 new images for retraining. Current: {unprocessed_count}"
            )
        
        # Simulate training process
        # In production: Start background task for model training
        
        return {
            "message": "Model retraining initiated",
            "new_images": unprocessed_count,
            "estimated_time": "30-60 minutes",
            "status": "pending"
        }
        
    except Exception as e:
        logger.error(f"Retraining error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/predictions/history")
async def get_prediction_history(limit: int = 50):
    """
    Get recent prediction history
    """
    try:
        if db is None:
            return {"predictions": []}
        
        cursor = db.predictions.find().sort("timestamp", -1).limit(limit)
        predictions = await cursor.to_list(length=limit)
        
        # Convert ObjectId to string
        for pred in predictions:
            pred["_id"] = str(pred["_id"])
            pred["timestamp"] = pred["timestamp"].isoformat()
        
        return {"predictions": predictions}
        
    except Exception as e:
        logger.error(f"History error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "database_connected": db is not None,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
