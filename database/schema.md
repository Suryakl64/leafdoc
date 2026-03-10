# MongoDB Database Schema for Plant Disease Detection System

## Database: plant_disease_db

### Collections:

## 1. predictions
Stores all disease predictions made by the system
```javascript
{
  _id: ObjectId("..."),
  disease: String,              // Name of predicted disease
  confidence: Number,           // Confidence score (0-100)
  timestamp: ISODate,           // Prediction timestamp
  filename: String,             // Original filename
  process_time: Number,         // Processing time in seconds
  image_hash: String,           // Optional: hash of image for deduplication
  user_id: String,              // Optional: user identifier
  feedback: {                   // Optional: user feedback
    correct: Boolean,
    actual_disease: String,
    comments: String
  }
}
```

**Indexes:**
- timestamp (descending) - for recent predictions
- disease - for filtering by disease type
- user_id - for user-specific queries

## 2. training_data
Stores uploaded training images for model improvement
```javascript
{
  _id: ObjectId("..."),
  filename: String,             // Original filename
  disease_type: String,         // Labeled disease type
  upload_date: ISODate,         // Upload timestamp
  processed: Boolean,           // Whether included in training
  file_path: String,            // Storage path
  uploader: String,             // Admin who uploaded
  image_metadata: {
    width: Number,
    height: Number,
    format: String,
    size_bytes: Number
  },
  validation_set: Boolean       // Whether used for validation
}
```

**Indexes:**
- disease_type - for dataset statistics
- processed - for finding unprocessed images
- upload_date (descending) - for recent uploads

## 3. model_versions
Tracks different model versions and their performance
```javascript
{
  _id: ObjectId("..."),
  version: String,              // Model version (e.g., "1.0.0")
  created_at: ISODate,          // Creation timestamp
  training_params: {
    epochs: Number,
    batch_size: Number,
    learning_rate: Number,
    optimizer: String,
    architecture: String
  },
  performance: {
    accuracy: Number,
    precision: Number,
    recall: Number,
    f1_score: Number,
    val_accuracy: Number
  },
  dataset_info: {
    total_images: Number,
    disease_counts: Object,     // Count per disease
    train_split: Number,
    val_split: Number,
    test_split: Number
  },
  model_path: String,           // Path to saved model
  active: Boolean,              // Currently deployed
  notes: String                 // Additional notes
}
```

**Indexes:**
- version (unique) - for version lookups
- created_at (descending) - for version history
- active - for finding current model

## 4. diseases
Master list of disease types with detailed information
```javascript
{
  _id: ObjectId("..."),
  name: String,                 // Disease name
  scientific_name: String,      // Scientific name
  description: String,          // Detailed description
  symptoms: [String],           // List of symptoms
  causes: String,               // Cause of disease
  treatment: String,            // Treatment recommendations
  prevention: String,           // Prevention methods
  severity: String,             // low/moderate/high/critical
  affected_plants: [String],    // Types of plants affected
  image_examples: [String],     // URLs to example images
  references: [String],         // Research references
  last_updated: ISODate
}
```

**Indexes:**
- name (unique) - for lookups
- severity - for filtering by severity

## 5. users (Optional - if implementing authentication)
```javascript
{
  _id: ObjectId("..."),
  email: String,
  password_hash: String,
  role: String,                 // "user" or "admin"
  created_at: ISODate,
  last_login: ISODate,
  prediction_count: Number,
  preferences: {
    notifications: Boolean,
    language: String
  }
}
```

**Indexes:**
- email (unique) - for authentication
- role - for role-based access

## 6. system_logs
Tracks system events and errors
```javascript
{
  _id: ObjectId("..."),
  timestamp: ISODate,
  level: String,                // info/warning/error/critical
  component: String,            // backend/model/database
  message: String,
  details: Object,
  stack_trace: String           // For errors
}
```

**Indexes:**
- timestamp (descending) - for recent logs
- level - for filtering by severity

---

## Initialization Script

Use this MongoDB shell script to initialize the database:

```javascript
// Connect to database
use plant_disease_db;

// Create collections with validation
db.createCollection("predictions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["disease", "confidence", "timestamp", "filename"],
      properties: {
        disease: { bsonType: "string" },
        confidence: { bsonType: "number", minimum: 0, maximum: 100 },
        timestamp: { bsonType: "date" },
        filename: { bsonType: "string" },
        process_time: { bsonType: "number" }
      }
    }
  }
});

// Create indexes for predictions
db.predictions.createIndex({ timestamp: -1 });
db.predictions.createIndex({ disease: 1 });

// Create training_data collection
db.createCollection("training_data");
db.training_data.createIndex({ disease_type: 1 });
db.training_data.createIndex({ processed: 1 });
db.training_data.createIndex({ upload_date: -1 });

// Create model_versions collection
db.createCollection("model_versions");
db.model_versions.createIndex({ version: 1 }, { unique: true });
db.model_versions.createIndex({ created_at: -1 });
db.model_versions.createIndex({ active: 1 });

// Create diseases collection
db.createCollection("diseases");
db.diseases.createIndex({ name: 1 }, { unique: true });

// Insert initial disease data
db.diseases.insertMany([
  {
    name: "Early Blight",
    scientific_name: "Alternaria solani",
    description: "Fungal disease affecting leaves with dark spots featuring concentric rings",
    symptoms: ["Dark spots with concentric rings", "Yellowing around spots", "Premature leaf drop"],
    causes: "Fungal pathogen that thrives in warm, humid conditions",
    treatment: "Apply copper-based fungicide every 7-10 days. Remove infected leaves.",
    prevention: "Practice crop rotation, improve air circulation, avoid overhead watering",
    severity: "moderate",
    affected_plants: ["Tomato", "Potato", "Eggplant"],
    last_updated: new Date()
  },
  {
    name: "Late Blight",
    scientific_name: "Phytophthora infestans",
    description: "Severe fungal infection causing rapid leaf and stem decay",
    symptoms: ["Water-soaked lesions", "White fungal growth", "Rapid tissue decay"],
    causes: "Oomycete pathogen favored by cool, wet weather",
    treatment: "Remove and destroy infected plants immediately. Apply preventive fungicide.",
    prevention: "Use resistant varieties, ensure good drainage, apply preventive fungicides",
    severity: "high",
    affected_plants: ["Tomato", "Potato"],
    last_updated: new Date()
  },
  {
    name: "Leaf Rust",
    scientific_name: "Puccinia spp.",
    description: "Rust-colored pustules appearing on leaf surfaces",
    symptoms: ["Orange-red pustules", "Yellowing leaves", "Reduced vigor"],
    causes: "Fungal pathogen spread by wind and water",
    treatment: "Use sulfur-based spray. Improve air circulation around plants.",
    prevention: "Remove infected debris, apply fungicides early in season",
    severity: "moderate",
    affected_plants: ["Various crops"],
    last_updated: new Date()
  },
  {
    name: "Healthy",
    scientific_name: "N/A",
    description: "No disease detected. Plant appears healthy.",
    symptoms: [],
    causes: "N/A",
    treatment: "Continue regular care and monitoring.",
    prevention: "Maintain good cultural practices",
    severity: "none",
    affected_plants: ["All"],
    last_updated: new Date()
  }
]);

// Insert initial model version
db.model_versions.insertOne({
  version: "1.0.0",
  created_at: new Date("2024-02-28"),
  training_params: {
    epochs: 50,
    batch_size: 32,
    learning_rate: 0.001,
    optimizer: "Adam",
    architecture: "ResNet50 Transfer Learning"
  },
  performance: {
    accuracy: 94.2,
    precision: 93.8,
    recall: 94.5,
    f1_score: 94.1,
    val_accuracy: 92.7
  },
  dataset_info: {
    total_images: 12847,
    disease_counts: {
      "Early Blight": 2847,
      "Late Blight": 2456,
      "Leaf Rust": 2134,
      "Powdery Mildew": 1876,
      "Bacterial Spot": 1654,
      "Healthy": 1880
    },
    train_split: 0.7,
    val_split: 0.15,
    test_split: 0.15
  },
  model_path: "/models/plant_disease_model_v1.0.0.h5",
  active: true,
  notes: "Initial production model with ResNet50 backbone"
});

print("Database initialized successfully!");
```

## Query Examples

### Get prediction statistics
```javascript
db.predictions.aggregate([
  {
    $group: {
      _id: "$disease",
      count: { $sum: 1 },
      avg_confidence: { $avg: "$confidence" }
    }
  },
  { $sort: { count: -1 } }
]);
```

### Get training data distribution
```javascript
db.training_data.aggregate([
  {
    $group: {
      _id: "$disease_type",
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } }
]);
```

### Get recent predictions
```javascript
db.predictions.find()
  .sort({ timestamp: -1 })
  .limit(10)
  .pretty();
```

### Get model performance history
```javascript
db.model_versions.find(
  {},
  { version: 1, "performance.accuracy": 1, created_at: 1 }
).sort({ created_at: -1 });
```
