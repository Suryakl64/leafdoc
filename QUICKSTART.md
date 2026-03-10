# LeafDoc - Quick Start Guide

This guide will get you up and running with the Plant Disease Detection system in under 10 minutes.

## 🚀 Quick Start (Development)

### Option 1: Using Docker (Recommended)

**Prerequisites:**
- Docker Desktop installed
- 8GB RAM available

**Steps:**

```bash
# 1. Clone repository
git clone https://github.com/yourusername/plant-disease-detection.git
cd plant-disease-detection

# 2. Start all services with Docker Compose
docker-compose up -d

# 3. Wait for services to start (30-60 seconds)
docker-compose logs -f

# 4. Access the application
# Frontend: http://localhost:80
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

That's it! The system is now running.

### Option 2: Manual Setup

**Prerequisites:**
- Python 3.8+ installed
- Node.js 16+ installed
- MongoDB 5.0+ installed and running

**Steps:**

```bash
# 1. Clone repository
git clone https://github.com/yourusername/plant-disease-detection.git
cd plant-disease-detection

# 2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Start MongoDB
# Make sure MongoDB is running on localhost:27017

# 4. Start Backend (in backend directory)
python main.py
# Backend runs on http://localhost:8000

# 5. Frontend Setup (in new terminal)
cd ../frontend
npm install

# 6. Start Frontend
npm run dev
# Frontend runs on http://localhost:5173
```

## 📱 Using the Application

### Basic Workflow

1. **Open Application**: Navigate to http://localhost:5173 (or http://localhost:80 if using Docker)

2. **Upload Image**: 
   - Click the upload zone or drag & drop a plant leaf image
   - Supported formats: JPG, PNG, WEBP
   - Max size: 10MB

3. **Analyze**: 
   - Click "Analyze Image" button
   - Wait 1-2 seconds for prediction

4. **View Results**:
   - Disease name with confidence score
   - Heatmap showing affected areas
   - Treatment recommendations
   - Prevention guidelines

5. **Analyze Another**: Click "Analyze Another Image" to start over

### Admin Functions

1. **Access Admin Dashboard**: Click "Admin" button in top-right

2. **View Statistics**:
   - Dataset tab shows total images and disease types
   - Model tab shows accuracy and training info

3. **Upload Training Data**:
   - Select image file
   - Choose disease type from dropdown
   - Click "Add to Dataset"

4. **Retrain Model**:
   - Go to Model tab
   - Click "Retrain Model" button
   - Wait 30-60 minutes for completion

## 🧪 Testing the System

### Test with Sample Images

```bash
# Download sample plant disease images
cd test-images
wget https://example.com/sample-images.zip
unzip sample-images.zip

# Or use your own plant images
```

### Test API Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Get diseases list
curl http://localhost:8000/api/diseases

# Test prediction (replace with your image path)
curl -X POST \
  http://localhost:8000/api/predict \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/leaf-image.jpg"

# Get model stats
curl http://localhost:8000/api/stats
```

### Interactive API Documentation

Visit http://localhost:8000/docs to:
- Browse all API endpoints
- Test endpoints directly in browser
- View request/response schemas
- Download OpenAPI spec

## 🎯 Common Tasks

### Add a New Disease Type

1. Update `DISEASE_INFO` in `backend/main.py`:
```python
DISEASE_INFO = {
    # ... existing diseases
    "New Disease Name": {
        "description": "Disease description",
        "treatment": "Treatment guidelines",
        "severity": "low/moderate/high"
    }
}
```

2. Add training images to dataset:
```
data/plant_disease_dataset/
├── train/New_Disease_Name/
├── val/New_Disease_Name/
└── test/New_Disease_Name/
```

3. Retrain model:
```bash
cd models
python train_model.py
```

### Update Model

1. Place new model file in `models/` directory:
```bash
cp new_model.h5 models/plant_disease_model.h5
```

2. Update metadata:
```bash
# Edit models/model_metadata.json
```

3. Restart backend:
```bash
# If using Docker
docker-compose restart backend

# If running manually
# Stop backend (Ctrl+C) and restart
python main.py
```

### Export Predictions

```bash
# Connect to MongoDB
mongosh plant_disease_db

# Export predictions to JSON
db.predictions.find().forEach(function(doc) {
    print(JSON.stringify(doc));
});

# Or export to CSV using mongoexport
mongoexport --db=plant_disease_db --collection=predictions --type=csv --fields=disease,confidence,timestamp,filename --out=predictions.csv
```

## 🐛 Troubleshooting

### Backend won't start

**Error: ModuleNotFoundError**
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

**Error: MongoDB connection failed**
```bash
# Solution: Check if MongoDB is running
# Windows:
net start MongoDB

# macOS:
brew services start mongodb-community

# Linux:
sudo systemctl start mongod
```

### Frontend won't start

**Error: Cannot find module**
```bash
# Solution: Reinstall node modules
rm -rf node_modules package-lock.json
npm install
```

**Error: Port 5173 already in use**
```bash
# Solution: Change port in vite.config.js
# Or kill process using port 5173
lsof -ti:5173 | xargs kill
```

### Prediction errors

**Error: Invalid image format**
- Ensure image is JPG, PNG, or WEBP
- Check image is not corrupted
- Try resizing large images

**Error: Low confidence scores**
- Image may be too dark/bright
- Try uploading clearer image
- Ensure leaf is clearly visible

### Docker issues

**Error: Container won't start**
```bash
# Check logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb

# Restart services
docker-compose restart

# Rebuild if needed
docker-compose up -d --build
```

## 📊 Performance Optimization

### GPU Acceleration

If you have an NVIDIA GPU:

```bash
# Install CUDA toolkit
# Download from: https://developer.nvidia.com/cuda-downloads

# Install GPU version of TensorFlow
pip uninstall tensorflow
pip install tensorflow-gpu

# Verify GPU is detected
python -c "import tensorflow as tf; print(tf.config.list_physical_devices('GPU'))"
```

### Model Optimization

```python
# Convert model to TensorFlow Lite for faster inference
import tensorflow as tf

# Load model
model = tf.keras.models.load_model('models/plant_disease_model.h5')

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

# Save
with open('models/plant_disease_model.tflite', 'wb') as f:
    f.write(tflite_model)
```

### Database Indexing

```javascript
// In MongoDB shell
use plant_disease_db;

// Create indexes for faster queries
db.predictions.createIndex({ timestamp: -1 });
db.predictions.createIndex({ disease: 1 });
db.training_data.createIndex({ disease_type: 1 });
db.training_data.createIndex({ processed: 1 });
```

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Use environment variables for sensitive data
3. **CORS**: Configure allowed origins in production
4. **File Upload**: Validate file types and sizes
5. **Rate Limiting**: Implement in production

## 📚 Next Steps

1. **Customize UI**: Edit `frontend/App.jsx` to match your branding
2. **Add Authentication**: Implement user login/signup
3. **Enhance Model**: Add more disease types
4. **Deploy**: Follow production deployment guide
5. **Monitor**: Set up logging and analytics

## 💡 Tips

- Use GPU for faster training (10x speedup)
- Start with small dataset to test pipeline
- Monitor model performance regularly
- Keep training data balanced across classes
- Update model monthly with new data
- Cache predictions for frequently analyzed images

## 📞 Getting Help

- **Documentation**: See [README.md](README.md) for full docs
- **Issues**: Check [GitHub Issues](https://github.com/yourusername/plant-disease-detection/issues)
- **API Docs**: http://localhost:8000/docs
- **Community**: Join our Discord/Slack

---

**Happy coding! 🌱**
