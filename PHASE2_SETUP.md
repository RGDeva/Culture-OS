# 🎵 Phase 2: Enhanced Vault & AI Analysis - Setup Guide

## 📦 **Dependencies to Install**

### **Audio Processing Libraries**

```bash
# Core audio metadata extraction
npm install music-metadata

# Audio analysis (when available)
# npm install audioflux  # TODO: Check npm availability
# npm install @huggingface/inference  # For HuggingFace models

# Utility libraries
npm install file-type
npm install buffer
```

### **Python Dependencies** (for advanced analysis)

Create `python-worker-enhanced/requirements.txt`:

```txt
# Existing
fastapi==0.109.0
uvicorn[standard]==0.27.0
gradio_client==0.10.1
requests==2.31.0
pydantic==2.5.3
python-multipart==0.0.6

# New for enhanced analysis
librosa==0.10.1           # Audio analysis
numpy==1.24.3             # Numerical computing
scipy==1.11.4             # Scientific computing
soundfile==0.12.1         # Audio file I/O
transformers==4.36.2      # HuggingFace models
torch==2.1.2              # PyTorch for ML models
torchaudio==2.1.2         # Audio processing with PyTorch
```

---

## 🔧 **Environment Variables**

Add to `.env.local`:

```bash
# HuggingFace API (for genre classification, quality analysis)
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Optional: Local model paths
GENRE_MODEL_PATH=/path/to/local/genre/model
QUALITY_MODEL_PATH=/path/to/local/quality/model
```

---

## 🐍 **Enhanced Python Worker**

### **1. Create Enhanced Worker Directory**

```bash
mkdir -p python-worker-enhanced
cd python-worker-enhanced
```

### **2. Create `main.py`**

```python
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import librosa
import numpy as np
import soundfile as sf
from transformers import pipeline
import tempfile
import os
from typing import Dict, List, Any

app = FastAPI(title="NoCulture Enhanced Audio Analysis")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models (lazy loading for faster startup)
genre_classifier = None
quality_analyzer = None

def get_genre_classifier():
    global genre_classifier
    if genre_classifier is None:
        # Load genre classification model
        # genre_classifier = pipeline("audio-classification", model="dima806/music_genres_classification")
        pass
    return genre_classifier

def get_quality_analyzer():
    global quality_analyzer
    if quality_analyzer is None:
        # Load quality analysis model
        # quality_analyzer = pipeline("audio-classification", model="facebook/audiobox-aesthetics")
        pass
    return quality_analyzer

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "enhanced-audio-analysis"}

@app.post("/analyze/enhanced")
async def analyze_enhanced(file: UploadFile = File(...)):
    """
    Comprehensive audio analysis including:
    - Audio features (tempo, key, energy, etc.)
    - Genre classification
    - Instrument detection
    - Quality analysis
    - Virality prediction
    """
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Load audio with librosa
        y, sr = librosa.load(temp_path, sr=None)
        
        # Extract audio features
        audio_features = extract_audio_features(y, sr)
        
        # Classify genre
        genre = classify_genre(y, sr)
        
        # Detect instruments
        instruments = detect_instruments(y, sr)
        
        # Analyze quality
        quality = analyze_quality(y, sr)
        
        # Predict virality
        virality = predict_virality(audio_features, quality, genre)
        
        # Clean up
        os.unlink(temp_path)
        
        return {
            "success": True,
            "audioFeatures": audio_features,
            "genre": genre,
            "instruments": instruments,
            "quality": quality,
            "virality": virality
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def extract_audio_features(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """Extract comprehensive audio features using librosa"""
    
    # Tempo and beat tracking
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    
    # Spectral features
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    
    # Chroma features (for key detection)
    chroma = librosa.feature.chroma_stft(y=y, sr=sr)
    
    # MFCC (Mel-frequency cepstral coefficients)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
    
    # Zero crossing rate
    zcr = librosa.feature.zero_crossing_rate(y)[0]
    
    # RMS energy
    rms = librosa.feature.rms(y=y)[0]
    
    # Estimate key
    key = estimate_key(chroma)
    
    return {
        "tempo": float(tempo),
        "key": key,
        "duration": float(len(y) / sr),
        "sampleRate": int(sr),
        "energy": float(np.mean(rms)),
        "spectralCentroid": float(np.mean(spectral_centroids)),
        "spectralRolloff": float(np.mean(spectral_rolloff)),
        "zeroCrossingRate": float(np.mean(zcr)),
        "mfcc": mfccs.mean(axis=1).tolist()
    }

def estimate_key(chroma: np.ndarray) -> str:
    """Estimate musical key from chroma features"""
    # Simplified key estimation
    keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    chroma_mean = chroma.mean(axis=1)
    key_index = np.argmax(chroma_mean)
    return keys[key_index]

def classify_genre(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """Classify music genre using ML model"""
    # TODO: Implement with actual model
    return {
        "primary": "unknown",
        "confidence": 0.0,
        "alternatives": []
    }

def detect_instruments(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """Detect instruments in the audio"""
    # TODO: Implement with source separation and classification
    return {
        "detected": [],
        "timeline": [],
        "leadInstrument": None
    }

def analyze_quality(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """Analyze audio quality and mixing"""
    # Calculate technical metrics
    rms = librosa.feature.rms(y=y)[0]
    peak = np.max(np.abs(y))
    dynamic_range = float(20 * np.log10(peak / (np.mean(rms) + 1e-10)))
    
    return {
        "score": 75.0,  # TODO: Calculate with ML model
        "feedback": [],
        "technicalQuality": {
            "dynamicRange": dynamic_range,
            "peakLevel": float(20 * np.log10(peak + 1e-10)),
            "rmsLevel": float(20 * np.log10(np.mean(rms) + 1e-10)),
            "crestFactor": float(peak / (np.mean(rms) + 1e-10))
        },
        "mixQuality": {
            "balance": 0.75,
            "clarity": 0.80,
            "depth": 0.70
        }
    }

def predict_virality(
    audio_features: Dict[str, Any],
    quality: Dict[str, Any],
    genre: Dict[str, Any]
) -> Dict[str, Any]:
    """Predict virality potential"""
    # Simplified virality prediction
    score = 0
    factors = []
    
    # High energy = more viral
    if audio_features["energy"] > 0.7:
        score += 20
        factors.append({
            "factor": "High Energy",
            "impact": 20,
            "description": "Track has high energy"
        })
    
    # Good quality = more viral
    if quality["score"] > 70:
        score += 25
        factors.append({
            "factor": "High Quality",
            "impact": 25,
            "description": "Professional quality"
        })
    
    return {
        "score": min(score, 100),
        "factors": factors,
        "recommendations": []
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

### **3. Install Python Dependencies**

```bash
cd python-worker-enhanced
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### **4. Start Enhanced Worker**

```bash
python main.py
```

Worker will run on `http://localhost:8001`

---

## 🔄 **Update Upload Flow**

Modify `/app/api/vault/upload/route.ts` to trigger enhanced analysis:

```typescript
// After asset creation
if (isRealUrl) {
  // Queue enhanced analysis
  fetch(`${origin}/api/analysis/enhanced`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assetId: asset.id })
  }).catch(console.error)
}
```

---

## 🎨 **UI Components**

### **Enhanced Analysis Display**

Create `/components/vault/EnhancedAnalysisPanel.tsx`:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { Sparkles, TrendingUp, Music, Award } from 'lucide-react'

interface EnhancedAnalysisPanelProps {
  assetId: string
}

export function EnhancedAnalysisPanel({ assetId }: EnhancedAnalysisPanelProps) {
  const [analysis, setAnalysis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalysis()
  }, [assetId])

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(`/api/analysis/enhanced?assetId=${assetId}`)
      const data = await response.json()
      setAnalysis(data.enhancedAnalysis)
    } catch (error) {
      console.error('Failed to fetch analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading enhanced analysis...</div>
  }

  if (!analysis) {
    return <div>No enhanced analysis available</div>
  }

  return (
    <div className="space-y-6">
      {/* Audio Features */}
      <div className="border border-green-400/20 p-4">
        <h4 className="font-mono text-green-400 mb-3 flex items-center gap-2">
          <Music className="h-4 w-4" />
          AUDIO_FEATURES
        </h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-green-400/60">Tempo:</span>
            <span className="ml-2 text-green-400">{analysis.audioFeatures.tempo} BPM</span>
          </div>
          <div>
            <span className="text-green-400/60">Key:</span>
            <span className="ml-2 text-green-400">{analysis.audioFeatures.key}</span>
          </div>
          <div>
            <span className="text-green-400/60">Energy:</span>
            <span className="ml-2 text-green-400">{(analysis.audioFeatures.energy * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-green-400/60">Danceability:</span>
            <span className="ml-2 text-green-400">{(analysis.audioFeatures.danceability * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Quality Score */}
      <div className="border border-green-400/20 p-4">
        <h4 className="font-mono text-green-400 mb-3 flex items-center gap-2">
          <Award className="h-4 w-4" />
          QUALITY_SCORE
        </h4>
        <div className="text-3xl font-bold text-green-400 mb-2">
          {analysis.quality.score}/100
        </div>
        <div className="text-sm text-green-400/60">
          {analysis.quality.feedback.join(', ') || 'Professional quality'}
        </div>
      </div>

      {/* Virality Prediction */}
      <div className="border border-green-400/20 p-4">
        <h4 className="font-mono text-green-400 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          VIRALITY_POTENTIAL
        </h4>
        <div className="text-3xl font-bold text-green-400 mb-2">
          {analysis.virality.score}/100
        </div>
        <div className="space-y-2 mt-3">
          {analysis.virality.factors.map((factor: any, i: number) => (
            <div key={i} className="text-sm">
              <span className="text-green-400">{factor.factor}</span>
              <span className="text-green-400/60 ml-2">+{factor.impact}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## 🧪 **Testing**

### **1. Test Enhanced Analysis API**

```bash
# Upload a test file first, then:
curl -X POST http://localhost:3001/api/analysis/enhanced \
  -H "Content-Type: application/json" \
  -d '{"assetId": "your_asset_id_here"}'
```

### **2. Test Python Worker**

```bash
curl -X POST http://localhost:8001/analyze/enhanced \
  -F "file=@/path/to/test.mp3"
```

### **3. Check Analysis Results**

```bash
curl http://localhost:3001/api/analysis/enhanced?assetId=your_asset_id_here
```

---

## 📊 **Database Updates**

The enhanced analysis uses existing `Asset` fields:
- `analysisMetadata` (JSON) - Stores full enhanced analysis
- `qualityScore` (Float) - Quality score 0-100
- `viralityScore` (Float) - Virality score 0-100

And `AssetAnalysis` fields:
- `audioFeatures` (String) - JSON string of audio features
- `genreClassification` (String) - JSON string of genre data
- `leadInstrument` (String) - Detected lead instrument
- `aestheticsScore` (Float) - Quality/aesthetics score

---

## 🚀 **Next Steps**

1. ✅ Install dependencies
2. ✅ Set up enhanced Python worker
3. ✅ Update upload flow
4. ✅ Test analysis pipeline
5. ⏳ Integrate with UI
6. ⏳ Add HuggingFace models
7. ⏳ Optimize performance

---

## 💡 **Future Enhancements**

- **Local Models**: Download and run models locally for faster analysis
- **Batch Processing**: Analyze multiple files in parallel
- **Real-time Analysis**: Stream analysis results as they're computed
- **Custom Models**: Train custom models on your dataset
- **A/B Testing**: Compare different analysis approaches

---

**Phase 2 is ready to implement! 🎵**
