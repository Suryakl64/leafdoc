# LeafDoc: AI-Powered Plant Disease Detection

LeafDoc is an intelligent agricultural tool designed to help farmers and gardeners identify plant diseases in real-time. The system uses a **Flask-based backend** with a Deep Learning model (CNN) to analyze leaf images, and a mobile-friendly **frontend** to display diagnoses and treatment plans.

## 📂 Project Structure

* **frontend/**
    * Contains the user-facing mobile application interface (React Native/Flutter).
    * Handles camera access and image uploading to the backend API.

* **backend/**
    * Contains the Flask server logic and AI processing.
    * **Includes:**
        * `app.py`: The main Flask application entry point.
        * `Dockerfile`: Configuration to containerize the application.
        * `requirements.txt`: List of Python dependencies (Flask, etc.).
        * `model/`: (Future) Directory for the trained CNN model weights.

* **docs/**
    * Contains documentation assets.
    * **Includes:**
        * Architecture diagrams, user story maps, and proof-of-work screenshots.

---

## 🚀 Features

* **Real-Time Diagnosis:** Instantly identifies diseases like Tomato Blight or Potato Rot from a photo.
* **Treatment Guide:** Provides organic and chemical solutions for identified issues.
* **Dockerized Setup:** Fully containerized for easy local development and deployment.
* **REST API:** Simple API endpoints for image processing.

---

## 🛠️ Tech Stack

* **Frontend:** React Native / Flutter
* **Backend:** Python (Flask)
* **Containerization:** Docker Desktop
* **Database:** PostgreSQL (Planned)

---

## 📸 Vision Document & Deliverables

### **1. Problem Statement**
Farmers lose significant crop yields due to delayed disease identification. LeafDoc acts as a "pocket agronomist," providing expert-level diagnosis instantly to prevent spread.

### **2. Target Users**
* **Small-scale Farmers:** Need quick checks during daily field rounds.
* **Home Gardeners:** Hobbyists needing advice for backyard plants.

### **3. Success Metrics**
* **Accuracy:** >95% detection rate on test images.
* **Speed:** <2 seconds processing time per image.

---

## ⚙️ Quick Start – Local Development

Follow these steps to run **LeafDoc** locally using Docker.

**1. Clone the Repository**
```bash
git clone [https://github.com/Suryakl64/leafdoc.git](https://github.com/Suryakl64/leafdoc.git)
cd leafdoc
