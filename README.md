# LeafDoc: AI-Powered Plant Disease Detection

## 1. Vision Document

### **Project Overview**
LeafDoc is an intelligent agricultural tool designed to bridge the gap between plant pathology and everyday farming. By leveraging Deep Learning models, the application allows users to upload or capture photos of crop leaves to receive instant, accurate diagnoses of potential diseases and actionable treatment plans.

### **Problem it Solves**
Farmers often face significant crop losses because they cannot identify plant diseases early or accurately. Access to agricultural experts is often expensive or physically inaccessible in rural areas. LeafDoc provides an immediate, low-cost "digital expert" to prevent spread and improve yields.

### **Target Users (Personas)**
* **Farmer Frank:** Needs a quick way to check if his wheat or cassava crops are healthy during daily rounds.
* **Home Gardener Sarah:** Wants to know why her tomato plants have spots and how to treat them organically.
* **Agricultural Extension Officers:** Professionals who use the tool to document disease outbreaks in remote regions.

### **Vision Statement**
To empower global food security by putting expert plant pathology tools in the hands of every farmer through their smartphone.

### **Key Features / Goals**
* **Real-time Diagnosis:** Analyze leaf images via a CNN model to identify disease.
* **Treatment Recommendations:** Provide organic and chemical solutions.
* **Offline Support:** Allow users to capture photos in remote areas and process them when back online.
* **Scan History:** A log of past scans to monitor plant health over time.

### **Success Metrics**
* Achieve 95% classification accuracy on test datasets.
* Process images in under 2 seconds.
* User retention rate of 40% over a growing season.

### **Assumptions & Constraints**
* **Assumption:** Users have access to a smartphone with a working camera.
* **Constraint:** The model currently supports a limited set of crops (Tomato, Potato, Pepper) and requires good lighting conditions.

---

## 2. Architecture & Design

### **System Architecture**
The application follows a standard 3-tier architecture:
* **Frontend:** Mobile Application (React Native/Flutter)
* **Backend:** Python API (Flask/FastAPI)
* **AI Engine:** Convolutional Neural Network (TensorFlow/PyTorch)
* **Database:** PostgreSQL & Cloud Storage

![Insert Your Architecture Diagram Here](docs/architecture_diagram.png)

### **User Interface (Wireframes)**
We have designed the core user journey including Splash, Home, Camera, Analysis, and Results screens.

![Insert Your Figma Screenshot Here](docs/wireframes.png)

---

## 3. Development Setup

### **Branching Strategy**
We follow the **GitHub Flow** strategy:
1.  The `main` branch contains production-ready code.
2.  Developers create **feature branches** (e.g., `feature/camera-setup`) for new work.
3.  Pull Requests (PRs) are used to merge features back into `main`.

### **Local Development Tools**
* **VS Code:** Primary Code Editor
* **Docker Desktop:** For containerization
* **Git:** Version Control
* **Python 3.9:** Backend Language

### **Quick Start – Local Development**
Follow these steps to run LeafDoc locally using Docker.

**1. Clone the Repository**
```bash
git clone [https://github.com/Suryakl64/leafdoc.git](https://github.com/Suryakl64/leafdoc.git)
cd leafdoc
