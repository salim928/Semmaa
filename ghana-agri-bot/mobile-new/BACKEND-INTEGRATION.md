# Backend API Integration Guide

This guide explains how to set up the backend API endpoints required for the new features.

## Required API Endpoints

### 1. Image Analysis Endpoints

#### POST `/api/analyze-image`
General crop health analysis.

**Request:**
```json
{
  "image": "base64_encoded_image_string",
  "analysis_type": "crop_health"
}
```

**Response:**
```json
{
  "health_status": "Healthy" | "Needs Attention" | "Unhealthy",
  "confidence": 0.95,
  "description": "The crop appears to be in good health...",
  "recommendations": [
    "Continue current watering schedule",
    "Monitor for pests regularly"
  ]
}
```

#### POST `/api/detect-disease`
Crop disease detection.

**Request:**
```json
{
  "image": "base64_encoded_image_string"
}
```

**Response:**
```json
{
  "disease_name": "Tomato Late Blight",
  "confidence": 0.89,
  "description": "Late blight is caused by the fungus...",
  "treatment_recommendations": [
    "Remove affected leaves immediately",
    "Apply copper-based fungicide",
    "Improve air circulation around plants"
  ]
}
```

#### POST `/api/detect-pest`
Pest identification.

**Request:**
```json
{
  "image": "base64_encoded_image_string"
}
```

**Response:**
```json
{
  "pest_name": "Aphids",
  "confidence": 0.92,
  "description": "Aphids are small sap-sucking insects...",
  "control_measures": [
    "Spray with neem oil solution",
    "Introduce ladybugs as natural predators",
    "Use insecticidal soap"
  ]
}
```

---

## Python Backend Example

### Dependencies
```bash
pip install fastapi uvicorn pillow tensorflow opencv-python
```

### Basic FastAPI Implementation

```python
# api_app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
from io import BytesIO
from PIL import Image
import tensorflow as tf
import numpy as np

app = FastAPI()

# Load your trained models
disease_model = None  # Load your disease detection model
pest_model = None     # Load your pest detection model

class ImageAnalysisRequest(BaseModel):
    image: str
    analysis_type: str = "crop_health"

class DiseaseDetectionRequest(BaseModel):
    image: str

class PestDetectionRequest(BaseModel):
    image: str

def decode_base64_image(base64_string: str) -> Image.Image:
    """Convert base64 string to PIL Image."""
    image_data = base64.b64decode(base64_string)
    return Image.open(BytesIO(image_data))

def preprocess_image(image: Image.Image, target_size=(224, 224)):
    """Preprocess image for model input."""
    image = image.resize(target_size)
    image_array = np.array(image) / 255.0
    return np.expand_dims(image_array, axis=0)

@app.post("/api/analyze-image")
async def analyze_image(request: ImageAnalysisRequest):
    """General crop health analysis."""
    try:
        # Decode image
        image = decode_base64_image(request.image)
        
        # Placeholder analysis logic
        # Replace with your actual model prediction
        
        return {
            "health_status": "Healthy",
            "confidence": 0.95,
            "description": "The crop appears to be in good health based on leaf color and structure.",
            "recommendations": [
                "Continue current care routine",
                "Monitor soil moisture levels",
                "Check for early signs of pests"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/detect-disease")
async def detect_disease(request: DiseaseDetectionRequest):
    """Detect crop diseases from image."""
    try:
        # Decode and preprocess image
        image = decode_base64_image(request.image)
        processed_image = preprocess_image(image)
        
        # Placeholder disease detection
        # Replace with your actual model prediction
        # prediction = disease_model.predict(processed_image)
        
        diseases = [
            "Early Blight",
            "Late Blight",
            "Leaf Spot",
            "Powdery Mildew",
            "Healthy"
        ]
        
        # Mock prediction
        predicted_class = 0
        confidence = 0.89
        
        disease_name = diseases[predicted_class]
        
        # Get treatment recommendations based on disease
        treatments = {
            "Early Blight": [
                "Remove and destroy infected leaves",
                "Apply fungicide containing chlorothalonil",
                "Practice crop rotation",
                "Improve air circulation"
            ],
            "Late Blight": [
                "Remove affected leaves immediately",
                "Apply copper-based fungicide",
                "Avoid overhead watering",
                "Ensure proper spacing between plants"
            ],
            # Add more diseases...
        }
        
        return {
            "disease_name": disease_name,
            "confidence": confidence,
            "description": f"{disease_name} is a common fungal disease affecting crops.",
            "treatment_recommendations": treatments.get(disease_name, ["Consult agricultural extension officer"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/detect-pest")
async def detect_pest(request: PestDetectionRequest):
    """Detect pests from image."""
    try:
        # Decode and preprocess image
        image = decode_base64_image(request.image)
        processed_image = preprocess_image(image)
        
        # Placeholder pest detection
        # Replace with your actual model prediction
        
        pests = [
            "Aphids",
            "Whiteflies",
            "Caterpillars",
            "Spider Mites",
            "None"
        ]
        
        # Mock prediction
        predicted_class = 0
        confidence = 0.92
        
        pest_name = pests[predicted_class]
        
        # Get control measures based on pest
        controls = {
            "Aphids": [
                "Spray with neem oil solution",
                "Introduce ladybugs as natural predators",
                "Use insecticidal soap",
                "Wash off with strong water stream"
            ],
            "Whiteflies": [
                "Use yellow sticky traps",
                "Apply neem oil spray",
                "Introduce parasitic wasps",
                "Remove heavily infested leaves"
            ],
            # Add more pests...
        }
        
        return {
            "pest_name": pest_name,
            "confidence": confidence,
            "description": f"{pest_name} are common pests that can damage crops by feeding on plant sap.",
            "control_measures": controls.get(pest_name, ["Consult agricultural extension officer"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### Running the Backend

```bash
# Development
uvicorn api_app:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn api_app:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Integration with Existing Backend

If you already have a backend (e.g., the Ghana AgriBOT backend), add these endpoints to your existing FastAPI app:

### Option 1: Add to Existing `api_app.py`

```python
# In your existing ghana-agri-bot/src/api_app.py

from fastapi import HTTPException
from pydantic import BaseModel
import base64
from io import BytesIO
from PIL import Image

# Add these models
class ImageAnalysisRequest(BaseModel):
    image: str
    analysis_type: str = "crop_health"

# Add the endpoints
@app.post("/api/analyze-image")
async def analyze_image(request: ImageAnalysisRequest):
    # Implementation here
    pass

@app.post("/api/detect-disease")
async def detect_disease(request: dict):
    # Implementation here
    pass

@app.post("/api/detect-pest")
async def detect_pest(request: dict):
    # Implementation here
    pass
```

### Option 2: Create Separate Module

```python
# ghana-agri-bot/src/image_analyzer.py

from PIL import Image
import base64
from io import BytesIO
from typing import Dict, List

class ImageAnalyzer:
    def __init__(self, model_path: str = None):
        # Load your trained models
        self.disease_model = None
        self.pest_model = None
        
    def analyze_health(self, image: Image.Image) -> Dict:
        """Analyze overall crop health."""
        # Your implementation
        return {
            "health_status": "Healthy",
            "confidence": 0.95,
            "description": "Crop appears healthy",
            "recommendations": []
        }
    
    def detect_disease(self, image: Image.Image) -> Dict:
        """Detect crop diseases."""
        # Your implementation
        return {
            "disease_name": "Healthy",
            "confidence": 1.0,
            "description": "",
            "treatment_recommendations": []
        }
    
    def detect_pest(self, image: Image.Image) -> Dict:
        """Detect pests."""
        # Your implementation
        return {
            "pest_name": "None",
            "confidence": 1.0,
            "description": "",
            "control_measures": []
        }
```

---

## Model Training (Optional)

If you want to train custom models:

### 1. Using TensorFlow/Keras

```python
import tensorflow as tf
from tensorflow.keras import layers, models

def create_disease_model(num_classes: int):
    """Create CNN model for disease classification."""
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(224, 224, 3)),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Conv2D(128, (3, 3), activation='relu'),
        layers.MaxPooling2D((2, 2)),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer='adam',
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

# Train model
model = create_disease_model(num_classes=5)
# model.fit(train_data, train_labels, epochs=50, validation_data=(val_data, val_labels))
# model.save('disease_model.h5')
```

### 2. Using Pre-trained Models

```python
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models

def create_transfer_learning_model(num_classes: int):
    """Use transfer learning with MobileNetV2."""
    base_model = MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False
    
    model = models.Sequential([
        base_model,
        layers.GlobalAveragePooling2D(),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.5),
        layers.Dense(num_classes, activation='softmax')
    ])
    
    return model
```

---

## Testing the API

### Using cURL

```bash
# Test health check
curl http://localhost:8000/health

# Test disease detection
curl -X POST http://localhost:8000/api/detect-disease \
  -H "Content-Type: application/json" \
  -d '{
    "image": "base64_encoded_image_here"
  }'
```

### Using Python Requests

```python
import requests
import base64

# Read and encode image
with open('crop_image.jpg', 'rb') as f:
    image_data = base64.b64encode(f.read()).decode('utf-8')

# Call API
response = requests.post(
    'http://localhost:8000/api/detect-disease',
    json={'image': image_data}
)

print(response.json())
```

---

## Production Deployment

### Docker

```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "api_app:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=/models
    volumes:
      - ./models:/models
```

---

## Environment Configuration

Create `.env` file:

```env
# Backend API
API_HOST=0.0.0.0
API_PORT=8000
MODEL_PATH=/path/to/models

# Cloud Storage (optional)
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET=crop-images

# Database (optional for logging)
DATABASE_URL=postgresql://user:pass@localhost/agribot
```

---

## Monitoring & Logging

```python
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.post("/api/detect-disease")
async def detect_disease(request: DiseaseDetectionRequest):
    start_time = datetime.now()
    
    try:
        # ... processing ...
        
        duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"Disease detection completed in {duration}s")
        
        return result
    except Exception as e:
        logger.error(f"Disease detection failed: {str(e)}")
        raise
```

---

## Next Steps

1. **Implement actual ML models** for disease and pest detection
2. **Set up model versioning** for easy updates
3. **Add caching** for frequently analyzed images
4. **Implement rate limiting** to prevent abuse
5. **Add authentication** using JWT tokens
6. **Monitor performance** and optimize as needed
7. **Create admin dashboard** for model management

---

## Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [TensorFlow Guides](https://www.tensorflow.org/tutorials)
- [PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease)
- [Transfer Learning Guide](https://www.tensorflow.org/tutorials/images/transfer_learning)

---

**Status:** Ready for Integration  
**Last Updated:** December 19, 2025
