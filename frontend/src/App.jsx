import React, { useState, useRef, useEffect } from 'react';
import { Upload, Leaf, Activity, AlertCircle, CheckCircle, X, RefreshCw, Database, Settings } from 'lucide-react';

// Admin Dashboard Component
const AdminDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('dataset');
  const [stats, setStats] = useState({
    totalImages: 12847,
    diseaseTypes: 38,
    accuracy: 94.2,
    lastTrained: '2024-02-28'
  });
  const [retraining, setRetraining] = useState(false);

  const handleRetrain = async () => {
    setRetraining(true);
    // Simulate retraining
    setTimeout(() => {
      setRetraining(false);
      setStats(prev => ({ ...prev, accuracy: 95.1, lastTrained: new Date().toISOString().split('T')[0] }));
    }, 3000);
  };

  return (
    <div className="admin-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <h2>Admin Dashboard</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="admin-tabs">
          <button 
            className={activeTab === 'dataset' ? 'active' : ''} 
            onClick={() => setActiveTab('dataset')}
          >
            <Database size={18} />
            Dataset
          </button>
          <button 
            className={activeTab === 'model' ? 'active' : ''} 
            onClick={() => setActiveTab('model')}
          >
            <Activity size={18} />
            Model
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'dataset' && (
            <div className="dataset-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{stats.totalImages.toLocaleString()}</div>
                  <div className="stat-label">Total Images</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{stats.diseaseTypes}</div>
                  <div className="stat-label">Disease Types</div>
                </div>
              </div>

              <div className="upload-section">
                <h3>Upload New Training Data</h3>
                <input type="file" multiple accept="image/*" className="file-input" />
                <select className="disease-select">
                  <option>Select Disease Type</option>
                  <option>Early Blight</option>
                  <option>Late Blight</option>
                  <option>Leaf Rust</option>
                  <option>Powdery Mildew</option>
                  <option>Healthy</option>
                </select>
                <button className="upload-btn">Add to Dataset</button>
              </div>
            </div>
          )}

          {activeTab === 'model' && (
            <div className="model-section">
              <div className="model-stats">
                <div className="accuracy-display">
                  <div className="accuracy-circle">
                    <svg viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(76, 175, 80, 0.1)" strokeWidth="8"/>
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#4CAF50" strokeWidth="8" 
                        strokeDasharray={`${stats.accuracy * 2.827} 282.7`} 
                        strokeLinecap="round" 
                        transform="rotate(-90 50 50)"/>
                    </svg>
                    <div className="accuracy-text">{stats.accuracy}%</div>
                  </div>
                  <div className="accuracy-label">Model Accuracy</div>
                </div>

                <div className="training-info">
                  <p><strong>Last Trained:</strong> {stats.lastTrained}</p>
                  <p><strong>Model:</strong> CNN (ResNet50 Transfer Learning)</p>
                  <p><strong>Framework:</strong> TensorFlow/Keras</p>
                </div>
              </div>

              <button 
                className="retrain-btn" 
                onClick={handleRetrain}
                disabled={retraining}
              >
                {retraining ? (
                  <>
                    <RefreshCw size={20} className="spinning" />
                    Retraining Model...
                  </>
                ) : (
                  <>
                    <RefreshCw size={20} />
                    Retrain Model
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Heatmap Visualization Component
const HeatmapVisualization = ({ image, heatmapData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && heatmapData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Draw heatmap overlay
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const intensity = heatmapData[Math.floor(i / 4)] || 0;
        imageData.data[i] = 255;
        imageData.data[i + 1] = Math.floor(255 * (1 - intensity));
        imageData.data[i + 2] = 0;
        imageData.data[i + 3] = Math.floor(intensity * 180);
      }
      ctx.putImageData(imageData, 0, 0);
    }
  }, [heatmapData]);

  return (
    <div className="heatmap-container">
      <img src={image} alt="Plant leaf" className="base-image" />
      <canvas ref={canvasRef} className="heatmap-overlay" width="400" height="400" />
    </div>
  );
};

// Main App Component
export default function PlantDiseaseDetection() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setResult(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setResult(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    
    // Simulate API call to backend
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Mock prediction result
      setTimeout(() => {
        const mockResults = [
          { disease: 'Early Blight', confidence: 92.4, description: 'Fungal disease affecting leaves', treatment: 'Apply copper-based fungicide' },
          { disease: 'Late Blight', confidence: 78.1, description: 'Severe fungal infection', treatment: 'Remove infected plants immediately' },
          { disease: 'Leaf Rust', confidence: 88.7, description: 'Rust-colored pustules on leaves', treatment: 'Use sulfur-based spray' },
          { disease: 'Healthy', confidence: 96.2, description: 'No disease detected', treatment: 'Continue regular care' }
        ];
        
        const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
        
        // Generate mock heatmap data
        const heatmapData = new Array(160000).fill(0).map(() => Math.random() * 0.8);
        
        setResult({
          ...randomResult,
          heatmapData,
          processTime: (Math.random() * 2 + 1).toFixed(2)
        });
        setAnalyzing(false);
      }, 2000);

      // Real API call would look like:
      // const response = await fetch('http://localhost:8000/api/predict', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // setResult(data);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      setAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="app-container">
      {/* Animated Background */}
      <div className="bg-pattern">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="leaf-float" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${15 + Math.random() * 10}s`
          }}>
            <Leaf size={20 + Math.random() * 20} />
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="header">
        <div className="logo">
          <Leaf size={32} />
          <h1>LeafDoc</h1>
        </div>
        <button className="admin-btn" onClick={() => setShowAdmin(true)}>
          <Settings size={20} />
          Admin
        </button>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="intro-section">
          <h2>AI Plant Disease Detection</h2>
          <p className="tagline">
            Upload a photo of your plant leaf and let our AI identify diseases with precision
          </p>
        </div>

        <div className="analysis-container">
          {!preview ? (
            <div 
              className="upload-zone"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-content">
                <div className="upload-icon">
                  <Upload size={48} />
                </div>
                <h3>Drop your leaf image here</h3>
                <p>or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          ) : (
            <div className="preview-section">
              <div className="image-preview">
                {!result ? (
                  <img src={preview} alt="Selected leaf" />
                ) : (
                  <HeatmapVisualization image={preview} heatmapData={result.heatmapData} />
                )}
              </div>

              {result && (
                <div className="result-panel">
                  <div className="result-header">
                    <div className="result-icon">
                      {result.disease === 'Healthy' ? (
                        <CheckCircle size={32} color="#4CAF50" />
                      ) : (
                        <AlertCircle size={32} color="#FF6B35" />
                      )}
                    </div>
                    <div className="result-title">
                      <h3>{result.disease}</h3>
                      <p className="confidence">Confidence: {result.confidence}%</p>
                    </div>
                  </div>

                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>

                  <div className="result-details">
                    <div className="detail-item">
                      <strong>Description:</strong>
                      <p>{result.description}</p>
                    </div>
                    <div className="detail-item">
                      <strong>Recommended Treatment:</strong>
                      <p>{result.treatment}</p>
                    </div>
                    <div className="detail-item">
                      <strong>Processing Time:</strong>
                      <p>{result.processTime}s</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="action-buttons">
                {!result ? (
                  <>
                    <button className="btn-secondary" onClick={resetAnalysis}>
                      Cancel
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={analyzeImage}
                      disabled={analyzing}
                    >
                      {analyzing ? (
                        <>
                          <Activity size={20} className="spinning" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Activity size={20} />
                          Analyze Image
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button className="btn-secondary" onClick={resetAnalysis}>
                    <RefreshCw size={20} />
                    Analyze Another Image
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="info-cards">
          <div className="info-card">
            <div className="card-icon">🌱</div>
            <h4>38+ Diseases</h4>
            <p>Trained on thousands of plant disease images</p>
          </div>
          <div className="info-card">
            <div className="card-icon">🎯</div>
            <h4>94% Accuracy</h4>
            <p>State-of-the-art CNN model performance</p>
          </div>
          <div className="info-card">
            <div className="card-icon">⚡</div>
            <h4>Real-time Analysis</h4>
            <p>Get results in under 2 seconds</p>
          </div>
        </div>
      </main>

      {/* Admin Dashboard */}
      {showAdmin && <AdminDashboard onClose={() => setShowAdmin(false)} />}

      {/* Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;600;700&family=Crimson+Pro:wght@300;400&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Crimson Pro', serif;
          overflow-x: hidden;
        }

        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a3d2e 0%, #1a5c45 50%, #2d7a5f 100%);
          position: relative;
          color: #f5f5dc;
        }

        /* Background Animation */
        .bg-pattern {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .leaf-float {
          position: absolute;
          color: rgba(245, 245, 220, 0.1);
          animation: float linear infinite;
        }

        @keyframes float {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(110vh) rotate(360deg);
            opacity: 0;
          }
        }

        /* Header */
        .header {
          position: relative;
          z-index: 10;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 4rem;
          backdrop-filter: blur(10px);
          background: rgba(10, 61, 46, 0.5);
          border-bottom: 1px solid rgba(245, 245, 220, 0.1);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo h1 {
          font-family: 'Fraunces', serif;
          font-size: 2rem;
          font-weight: 700;
          color: #f5f5dc;
          letter-spacing: 1px;
        }

        .admin-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(245, 245, 220, 0.1);
          border: 1px solid rgba(245, 245, 220, 0.3);
          border-radius: 8px;
          color: #f5f5dc;
          font-family: 'Crimson Pro', serif;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .admin-btn:hover {
          background: rgba(245, 245, 220, 0.2);
          transform: translateY(-2px);
        }

        /* Main Content */
        .main-content {
          position: relative;
          z-index: 10;
          max-width: 1400px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .intro-section {
          text-align: center;
          margin-bottom: 3rem;
          animation: fadeInDown 1s ease;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .intro-section h2 {
          font-family: 'Fraunces', serif;
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: #f5f5dc;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .tagline {
          font-size: 1.3rem;
          color: rgba(245, 245, 220, 0.8);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Analysis Container */
        .analysis-container {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 3rem;
          margin-bottom: 3rem;
          border: 1px solid rgba(245, 245, 220, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: fadeIn 1s ease 0.3s both;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Upload Zone */
        .upload-zone {
          border: 3px dashed rgba(245, 245, 220, 0.3);
          border-radius: 16px;
          padding: 4rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.02);
        }

        .upload-zone:hover {
          border-color: rgba(245, 245, 220, 0.5);
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-4px);
        }

        .upload-content {
          pointer-events: none;
        }

        .upload-icon {
          color: rgba(245, 245, 220, 0.6);
          margin-bottom: 1.5rem;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .upload-zone h3 {
          font-family: 'Fraunces', serif;
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          color: #f5f5dc;
        }

        .upload-zone p {
          color: rgba(245, 245, 220, 0.6);
          font-size: 1.1rem;
        }

        /* Preview Section */
        .preview-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        @media (max-width: 968px) {
          .preview-section {
            grid-template-columns: 1fr;
          }
        }

        .image-preview {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }

        .image-preview img {
          width: 100%;
          height: auto;
          display: block;
        }

        /* Heatmap */
        .heatmap-container {
          position: relative;
          width: 100%;
        }

        .base-image {
          width: 100%;
          height: auto;
          display: block;
        }

        .heatmap-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          mix-blend-mode: multiply;
          opacity: 0.7;
        }

        /* Result Panel */
        .result-panel {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid rgba(245, 245, 220, 0.1);
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .result-icon {
          animation: scaleIn 0.5s ease;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .result-title h3 {
          font-family: 'Fraunces', serif;
          font-size: 2rem;
          color: #f5f5dc;
          margin-bottom: 0.5rem;
        }

        .confidence {
          color: rgba(245, 245, 220, 0.7);
          font-size: 1rem;
        }

        .confidence-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #8BC34A);
          border-radius: 4px;
          animation: fillBar 1s ease;
        }

        @keyframes fillBar {
          from { width: 0; }
        }

        .result-details {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .detail-item strong {
          display: block;
          font-family: 'Fraunces', serif;
          color: #f5f5dc;
          margin-bottom: 0.5rem;
          font-size: 1.1rem;
        }

        .detail-item p {
          color: rgba(245, 245, 220, 0.8);
          line-height: 1.6;
          font-size: 1rem;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
          grid-column: 1 / -1;
        }

        .btn-primary, .btn-secondary {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-family: 'Crimson Pro', serif;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4CAF50, #8BC34A);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: rgba(245, 245, 220, 0.1);
          color: #f5f5dc;
          border: 1px solid rgba(245, 245, 220, 0.3);
        }

        .btn-secondary:hover {
          background: rgba(245, 245, 220, 0.2);
          transform: translateY(-2px);
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Info Cards */
        .info-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          animation: fadeIn 1s ease 0.6s both;
        }

        .info-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          padding: 2rem;
          border-radius: 16px;
          text-align: center;
          border: 1px solid rgba(245, 245, 220, 0.1);
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
          border-color: rgba(245, 245, 220, 0.3);
        }

        .card-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .info-card h4 {
          font-family: 'Fraunces', serif;
          font-size: 1.5rem;
          color: #f5f5dc;
          margin-bottom: 0.75rem;
        }

        .info-card p {
          color: rgba(245, 245, 220, 0.7);
          line-height: 1.5;
        }

        /* Admin Dashboard */
        .admin-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .admin-panel {
          background: #1a5c45;
          border-radius: 24px;
          width: 90%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(245, 245, 220, 0.2);
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 1px solid rgba(245, 245, 220, 0.1);
        }

        .admin-header h2 {
          font-family: 'Fraunces', serif;
          font-size: 2rem;
          color: #f5f5dc;
        }

        .close-btn {
          background: rgba(245, 245, 220, 0.1);
          border: 1px solid rgba(245, 245, 220, 0.3);
          border-radius: 8px;
          color: #f5f5dc;
          padding: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(245, 245, 220, 0.2);
        }

        .admin-tabs {
          display: flex;
          padding: 1rem 2rem 0;
          gap: 1rem;
        }

        .admin-tabs button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: rgba(245, 245, 220, 0.6);
          font-family: 'Crimson Pro', serif;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .admin-tabs button.active {
          color: #f5f5dc;
          border-bottom-color: #4CAF50;
        }

        .admin-tabs button:hover {
          color: #f5f5dc;
        }

        .admin-content {
          padding: 2rem;
        }

        /* Dataset Section */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(245, 245, 220, 0.1);
        }

        .stat-value {
          font-family: 'Fraunces', serif;
          font-size: 2.5rem;
          color: #4CAF50;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: rgba(245, 245, 220, 0.7);
          font-size: 0.95rem;
        }

        .upload-section {
          background: rgba(255, 255, 255, 0.05);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid rgba(245, 245, 220, 0.1);
        }

        .upload-section h3 {
          font-family: 'Fraunces', serif;
          color: #f5f5dc;
          margin-bottom: 1.5rem;
          font-size: 1.3rem;
        }

        .file-input, .disease-select {
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(245, 245, 220, 0.3);
          border-radius: 8px;
          color: #f5f5dc;
          font-family: 'Crimson Pro', serif;
          font-size: 1rem;
        }

        .upload-btn {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #4CAF50, #8BC34A);
          border: none;
          border-radius: 8px;
          color: white;
          font-family: 'Crimson Pro', serif;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .upload-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
        }

        /* Model Section */
        .model-section {
          text-align: center;
        }

        .model-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4rem;
          margin-bottom: 3rem;
        }

        @media (max-width: 768px) {
          .model-stats {
            flex-direction: column;
            gap: 2rem;
          }
        }

        .accuracy-display {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .accuracy-circle {
          position: relative;
          width: 180px;
          height: 180px;
          margin-bottom: 1rem;
        }

        .accuracy-circle svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .accuracy-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-family: 'Fraunces', serif;
          font-size: 2.5rem;
          color: #4CAF50;
          font-weight: 700;
        }

        .accuracy-label {
          color: rgba(245, 245, 220, 0.7);
          font-size: 1rem;
        }

        .training-info {
          text-align: left;
          background: rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 12px;
          border: 1px solid rgba(245, 245, 220, 0.1);
        }

        .training-info p {
          color: rgba(245, 245, 220, 0.8);
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }

        .training-info p:last-child {
          margin-bottom: 0;
        }

        .retrain-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #4CAF50, #8BC34A);
          border: none;
          border-radius: 12px;
          color: white;
          font-family: 'Crimson Pro', serif;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          margin: 0 auto;
        }

        .retrain-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(76, 175, 80, 0.3);
        }

        .retrain-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
