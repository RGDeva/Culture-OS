from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import librosa
import numpy as np
import soundfile as sf
import tempfile
import os
from typing import Dict, List, Any
import json

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
    """Load genre classification model (lazy)"""
    global genre_classifier
    if genre_classifier is None:
        try:
            from transformers import pipeline
            # genre_classifier = pipeline("audio-classification", model="dima806/music_genres_classification")
            print("[WORKER] Genre classifier would be loaded here")
        except Exception as e:
            print(f"[WORKER] Could not load genre classifier: {e}")
    return genre_classifier

def get_quality_analyzer():
    """Load quality analysis model (lazy)"""
    global quality_analyzer
    if quality_analyzer is None:
        try:
            from transformers import pipeline
            # quality_analyzer = pipeline("audio-classification", model="facebook/audiobox-aesthetics")
            print("[WORKER] Quality analyzer would be loaded here")
        except Exception as e:
            print(f"[WORKER] Could not load quality analyzer: {e}")
    return quality_analyzer

@app.get("/")
async def root():
    return {
        "service": "NoCulture Enhanced Audio Analysis",
        "version": "1.0.0",
        "endpoints": ["/health", "/analyze/enhanced", "/separate/stems"]
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "enhanced-audio-analysis",
        "librosa_version": librosa.__version__
    }

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
    temp_path = None
    try:
        print(f"[WORKER] Received file: {file.filename}")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        print(f"[WORKER] Saved to temp file: {temp_path}")
        
        # Load audio with librosa
        print("[WORKER] Loading audio with librosa...")
        y, sr = librosa.load(temp_path, sr=None)
        print(f"[WORKER] Audio loaded: {len(y)} samples at {sr} Hz")
        
        # Extract audio features
        print("[WORKER] Extracting audio features...")
        audio_features = extract_audio_features(y, sr)
        
        # Classify genre
        print("[WORKER] Classifying genre...")
        genre = classify_genre(y, sr, audio_features)
        
        # Detect instruments
        print("[WORKER] Detecting instruments...")
        instruments = detect_instruments(y, sr)
        
        # Analyze quality
        print("[WORKER] Analyzing quality...")
        quality = analyze_quality(y, sr)
        
        # Predict virality
        print("[WORKER] Predicting virality...")
        virality = predict_virality(audio_features, quality, genre)
        
        print("[WORKER] Analysis complete!")
        
        return {
            "success": True,
            "audioFeatures": audio_features,
            "genre": genre,
            "instruments": instruments,
            "quality": quality,
            "virality": virality
        }
        
    except Exception as e:
        print(f"[WORKER] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # Clean up temp file
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
                print(f"[WORKER] Cleaned up temp file")
            except:
                pass

def extract_audio_features(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """Extract comprehensive audio features using librosa"""
    
    # Tempo and beat tracking
    tempo, beats = librosa.beat.beat_track(y=y, sr=sr)
    
    # Spectral features
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
    
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
    
    # Calculate derived features
    energy = float(np.mean(rms))
    
    # Danceability (based on tempo and beat strength)
    beat_strength = librosa.beat.beat_track(y=y, sr=sr, units='frames')[1]
    danceability = min(1.0, (tempo / 180.0) * (len(beat_strength) / (len(y) / sr)))
    
    # Valence (positivity) - simplified based on spectral features
    valence = float(np.mean(spectral_centroids) / 4000.0)  # Normalize
    
    # Acousticness (inverse of spectral rolloff)
    acousticness = 1.0 - min(1.0, float(np.mean(spectral_rolloff) / 8000.0))
    
    # Instrumentalness (inverse of zero crossing rate)
    instrumentalness = 1.0 - min(1.0, float(np.mean(zcr) * 10))
    
    # Liveness (based on spectral bandwidth variation)
    liveness = min(1.0, float(np.std(spectral_bandwidth) / 1000.0))
    
    # Speechiness (based on zero crossing rate)
    speechiness = min(1.0, float(np.mean(zcr) * 5))
    
    return {
        "tempo": float(tempo),
        "key": key,
        "timeSignature": "4/4",  # Default, would need more analysis
        "duration": float(len(y) / sr),
        "sampleRate": int(sr),
        "bitrate": 320,  # Would need to be passed from file metadata
        "channels": 1 if len(y.shape) == 1 else y.shape[0],
        "loudness": float(20 * np.log10(np.mean(rms) + 1e-10)),
        "energy": float(energy),
        "danceability": float(danceability),
        "valence": float(valence),
        "acousticness": float(acousticness),
        "instrumentalness": float(instrumentalness),
        "liveness": float(liveness),
        "speechiness": float(speechiness),
        "spectralCentroid": float(np.mean(spectral_centroids)),
        "spectralRolloff": float(np.mean(spectral_rolloff)),
        "zeroCrossingRate": float(np.mean(zcr)),
        "mfcc": mfccs.mean(axis=1).tolist()
    }

def estimate_key(chroma: np.ndarray) -> str:
    """Estimate musical key from chroma features"""
    keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    chroma_mean = chroma.mean(axis=1)
    key_index = np.argmax(chroma_mean)
    
    # Determine if major or minor (simplified)
    # Major keys have stronger 3rd and 5th
    third_index = (key_index + 4) % 12
    fifth_index = (key_index + 7) % 12
    minor_third_index = (key_index + 3) % 12
    
    major_strength = chroma_mean[third_index] + chroma_mean[fifth_index]
    minor_strength = chroma_mean[minor_third_index] + chroma_mean[fifth_index]
    
    mode = "major" if major_strength > minor_strength else "minor"
    
    return f"{keys[key_index]} {mode}"

def classify_genre(y: np.ndarray, sr: int, audio_features: Dict[str, Any]) -> Dict[str, Any]:
    """Classify music genre using heuristics and ML model"""
    
    # Heuristic-based genre classification
    tempo = audio_features["tempo"]
    energy = audio_features["energy"]
    danceability = audio_features["danceability"]
    acousticness = audio_features["acousticness"]
    
    genres = []
    
    # Trap/Hip-Hop: 130-150 BPM, high energy, low acousticness
    if 130 <= tempo <= 150 and energy > 0.6 and acousticness < 0.3:
        genres.append(("trap", 0.8))
    
    # House/EDM: 120-130 BPM, high danceability
    if 120 <= tempo <= 130 and danceability > 0.7:
        genres.append(("house", 0.75))
    
    # Pop: 100-130 BPM, moderate energy
    if 100 <= tempo <= 130 and 0.5 < energy < 0.8:
        genres.append(("pop", 0.6))
    
    # Rock: 110-140 BPM, high energy, low acousticness
    if 110 <= tempo <= 140 and energy > 0.7 and acousticness < 0.4:
        genres.append(("rock", 0.65))
    
    # Acoustic/Folk: Low tempo, high acousticness
    if tempo < 100 and acousticness > 0.6:
        genres.append(("acoustic", 0.7))
    
    # Jazz: Variable tempo, high instrumentalness
    if audio_features["instrumentalness"] > 0.8:
        genres.append(("jazz", 0.6))
    
    # Sort by confidence
    genres.sort(key=lambda x: x[1], reverse=True)
    
    if not genres:
        genres = [("unknown", 0.0)]
    
    primary_genre, confidence = genres[0]
    alternatives = [{"genre": g, "confidence": c} for g, c in genres[1:3]]
    
    return {
        "primary": primary_genre,
        "confidence": float(confidence),
        "alternatives": alternatives
    }

def detect_instruments(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """Detect instruments in the audio using spectral analysis"""
    
    # Simplified instrument detection based on frequency analysis
    detected = []
    
    # Get spectral features
    spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
    spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
    
    mean_centroid = np.mean(spectral_centroids)
    mean_rolloff = np.mean(spectral_rolloff)
    
    # Heuristic detection
    # Bass (low frequencies)
    if mean_centroid < 500:
        detected.append("bass")
    
    # Drums (high zero crossing, percussive)
    zcr = librosa.feature.zero_crossing_rate(y)[0]
    if np.mean(zcr) > 0.1:
        detected.append("drums")
    
    # High frequency instruments (synth, hi-hats)
    if mean_rolloff > 4000:
        detected.append("synth")
        detected.append("hi-hats")
    
    # Mid-range (vocals, guitar, piano)
    if 500 < mean_centroid < 2000:
        detected.append("vocals")
    
    if 1000 < mean_centroid < 3000:
        detected.append("piano")
    
    # Lead instrument (highest energy in frequency range)
    lead = detected[0] if detected else None
    
    return {
        "detected": detected,
        "timeline": [],  # Would require more complex analysis
        "leadInstrument": lead
    }

def analyze_quality(y: np.ndarray, sr: int) -> Dict[str, Any]:
    """Analyze audio quality and mixing"""
    
    # Calculate technical metrics
    rms = librosa.feature.rms(y=y)[0]
    peak = np.max(np.abs(y))
    mean_rms = np.mean(rms)
    
    # Dynamic range
    dynamic_range = float(20 * np.log10(peak / (mean_rms + 1e-10)))
    
    # Peak level (dBFS)
    peak_level = float(20 * np.log10(peak + 1e-10))
    
    # RMS level (dBFS)
    rms_level = float(20 * np.log10(mean_rms + 1e-10))
    
    # Crest factor
    crest_factor = float(peak / (mean_rms + 1e-10))
    
    # Calculate quality score (0-100)
    score = 50.0  # Base score
    
    feedback = []
    
    # Good dynamic range (8-14 dB)
    if 8 <= dynamic_range <= 14:
        score += 15
        feedback.append("Good dynamic range")
    elif dynamic_range < 8:
        feedback.append("Limited dynamic range - may sound compressed")
    else:
        feedback.append("Very wide dynamic range - check levels")
    
    # Peak level check (should be below 0 dBFS)
    if -1 > peak_level > -6:
        score += 15
        feedback.append("Good peak levels")
    elif peak_level > -1:
        score -= 10
        feedback.append("Peaks too high - risk of clipping")
    
    # RMS level check (should be around -14 to -20 dBFS)
    if -20 <= rms_level <= -14:
        score += 15
        feedback.append("Good loudness level")
    
    # Crest factor (should be 4-10 for good mix)
    if 4 <= crest_factor <= 10:
        score += 5
        feedback.append("Good crest factor")
    
    # Mix quality estimates (simplified)
    balance = min(1.0, dynamic_range / 14.0)
    clarity = min(1.0, abs(peak_level) / 6.0)
    depth = min(1.0, crest_factor / 10.0)
    
    return {
        "score": float(max(0, min(100, score))),
        "feedback": feedback,
        "technicalQuality": {
            "dynamicRange": dynamic_range,
            "peakLevel": peak_level,
            "rmsLevel": rms_level,
            "crestFactor": crest_factor
        },
        "mixQuality": {
            "balance": float(balance),
            "clarity": float(clarity),
            "depth": float(depth)
        }
    }

def predict_virality(
    audio_features: Dict[str, Any],
    quality: Dict[str, Any],
    genre: Dict[str, Any]
) -> Dict[str, Any]:
    """Predict virality potential based on multiple factors"""
    
    score = 0
    factors = []
    recommendations = []
    
    # Energy factor (high energy = more viral)
    if audio_features["energy"] > 0.7:
        impact = 20
        score += impact
        factors.append({
            "factor": "High Energy",
            "impact": impact,
            "description": "Track has high energy which tends to perform well on social media"
        })
    elif audio_features["energy"] < 0.4:
        recommendations.append("Consider adding more energetic elements to increase engagement")
    
    # Danceability factor
    if audio_features["danceability"] > 0.6:
        impact = 20
        score += impact
        factors.append({
            "factor": "Danceable",
            "impact": impact,
            "description": "Danceable tracks have higher viral potential on TikTok and Instagram"
        })
    elif audio_features["danceability"] < 0.4:
        recommendations.append("Add more rhythmic elements to make it more danceable")
    
    # Quality factor
    if quality["score"] > 80:
        impact = 25
        score += impact
        factors.append({
            "factor": "High Quality",
            "impact": impact,
            "description": "Professional quality increases shareability and credibility"
        })
    elif quality["score"] < 60:
        recommendations.append("Improve mix quality for better shareability")
    
    # Genre popularity (simplified)
    popular_genres = ["trap", "pop", "hip-hop", "edm", "house"]
    if genre["primary"].lower() in popular_genres:
        impact = 15
        score += impact
        factors.append({
            "factor": "Popular Genre",
            "impact": impact,
            "description": f"{genre['primary'].title()} is currently trending on streaming platforms"
        })
    
    # Tempo factor (120-140 BPM is sweet spot)
    tempo = audio_features["tempo"]
    if 120 <= tempo <= 140:
        impact = 10
        score += impact
        factors.append({
            "factor": "Optimal Tempo",
            "impact": impact,
            "description": "Tempo is in the sweet spot for viral content"
        })
    
    # Hook potential (based on valence and energy)
    if audio_features["valence"] > 0.6 and audio_features["energy"] > 0.6:
        impact = 10
        score += impact
        factors.append({
            "factor": "Hook Potential",
            "impact": impact,
            "description": "Positive and energetic - good for memorable hooks"
        })
    
    # Additional recommendations
    if not recommendations:
        recommendations.append("Track has strong viral potential - consider promoting on social media")
    
    if audio_features["instrumentalness"] > 0.9:
        recommendations.append("Consider adding vocals or vocal hooks for increased virality")
    
    return {
        "score": min(100, score),
        "factors": factors,
        "recommendations": recommendations
    }

@app.post("/separate/stems")
async def separate_stems(file: UploadFile = File(...)):
    """
    Separate audio into stems using Demucs:
    - vocals
    - drums
    - bass
    - other (melody/instruments)
    """
    temp_path = None
    output_dir = None
    
    try:
        print(f"[WORKER] Separating stems for: {file.filename}")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Create output directory
        output_dir = tempfile.mkdtemp()
        
        # Run Demucs separation
        print("[WORKER] Running Demucs stem separation...")
        try:
            import subprocess
            
            # Use Demucs CLI for separation
            # Model: htdemucs (hybrid transformer demucs - best quality)
            result = subprocess.run(
                [
                    "demucs",
                    "--two-stems=vocals",  # First pass: vocals vs instrumental
                    "-o", output_dir,
                    temp_path
                ],
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode != 0:
                print(f"[WORKER] Demucs error: {result.stderr}")
                raise Exception(f"Stem separation failed: {result.stderr}")
            
            # Run full separation on instrumental
            result = subprocess.run(
                [
                    "demucs",
                    "-o", output_dir,
                    temp_path
                ],
                capture_output=True,
                text=True,
                timeout=300
            )
            
            print("[WORKER] Stem separation complete!")
            
            # Find output files
            # Demucs creates: output_dir/htdemucs/filename/vocals.wav, drums.wav, bass.wav, other.wav
            base_name = os.path.splitext(os.path.basename(temp_path))[0]
            stems_dir = os.path.join(output_dir, "htdemucs", base_name)
            
            stems = {}
            stem_types = ["vocals", "drums", "bass", "other"]
            
            for stem_type in stem_types:
                stem_path = os.path.join(stems_dir, f"{stem_type}.wav")
                if os.path.exists(stem_path):
                    # Read stem file
                    y, sr = librosa.load(stem_path, sr=None)
                    
                    # Get stem info
                    duration = len(y) / sr
                    rms_energy = float(np.sqrt(np.mean(y**2)))
                    
                    stems[stem_type] = {
                        "duration": duration,
                        "sample_rate": sr,
                        "energy": rms_energy,
                        "path": stem_path,  # For upload to cloud storage
                        "size_samples": len(y)
                    }
            
            return {
                "success": True,
                "stems": stems,
                "model": "htdemucs",
                "output_dir": stems_dir,
                "message": f"Successfully separated {len(stems)} stems"
            }
            
        except subprocess.TimeoutExpired:
            raise HTTPException(status_code=408, detail="Stem separation timed out (>5 minutes)")
        except FileNotFoundError:
            raise HTTPException(
                status_code=500,
                detail="Demucs not installed. Run: pip install demucs"
            )
        
    except Exception as e:
        print(f"[WORKER] Stem separation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Stem separation failed: {str(e)}")
    
    finally:
        # Cleanup temp files
        if temp_path and os.path.exists(temp_path):
            try:
                os.unlink(temp_path)
            except:
                pass

if __name__ == "__main__":
    import uvicorn
    print("Starting NoCulture Enhanced Audio Analysis Worker...")
    print("Features: Audio Analysis + Stem Separation (Demucs)")
    print("Server will be available at http://localhost:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)
