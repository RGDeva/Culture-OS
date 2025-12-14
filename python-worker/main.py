"""
Mansuba AI Music Analysis Worker
FastAPI service that analyzes audio files using Mansuba's AI-Powered Music Analysis
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import tempfile
import os
from gradio_client import Client, handle_file
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="NoCulture Music Analysis Worker")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    audioUrl: str
    assetId: str

class AnalysisResponse(BaseModel):
    mansuba: dict
    cyanite: dict = {}  # Cyanite is handled by Node.js

@app.get("/")
async def root():
    return {
        "service": "NoCulture Music Analysis Worker",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_audio(request: AnalysisRequest):
    """
    Analyze audio file using Mansuba AI
    
    Args:
        request: Contains audioUrl and assetId
        
    Returns:
        Analysis results including instruments, summary, insights, and plots
    """
    temp_file_path = None
    
    try:
        logger.info(f"Starting analysis for asset: {request.assetId}")
        logger.info(f"Audio URL: {request.audioUrl}")
        
        # Step 1: Download audio file
        logger.info("Downloading audio file...")
        response = requests.get(request.audioUrl, timeout=60)
        response.raise_for_status()
        
        # Determine file extension from URL or content-type
        file_ext = ".mp3"  # Default
        if request.audioUrl.endswith(('.wav', '.WAV')):
            file_ext = ".wav"
        elif request.audioUrl.endswith(('.flac', '.FLAC')):
            file_ext = ".flac"
        elif request.audioUrl.endswith(('.m4a', '.M4A')):
            file_ext = ".m4a"
        
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            temp_file.write(response.content)
            temp_file_path = temp_file.name
        
        logger.info(f"Audio file downloaded to: {temp_file_path}")
        logger.info(f"File size: {os.path.getsize(temp_file_path)} bytes")
        
        # Step 2: Initialize Mansuba client
        logger.info("Initializing Mansuba AI client...")
        try:
            client = Client("Mansuba/AI-Powered-Music-Analysis")
            logger.info("Mansuba client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Mansuba client: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize Mansuba client: {str(e)}"
            )
        
        # Step 3: Run Mansuba analysis
        logger.info("Running Mansuba analysis...")
        try:
            result = client.predict(
                audio_path=handle_file(temp_file_path),
                llm_provider="groq",  # Use Groq for fast inference
                api_name="/process_audio"
            )
            logger.info("Mansuba analysis complete")
            logger.info(f"Result type: {type(result)}")
            logger.info(f"Result: {result}")
        except Exception as e:
            logger.error(f"Mansuba analysis failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Mansuba analysis failed: {str(e)}"
            )
        
        # Step 4: Parse Mansuba results
        # Mansuba returns a tuple with multiple outputs
        # Format: (instruments_raw, instrument_plot, audio_summary, ai_insight, virality_plot)
        mansuba_data = {}
        
        if isinstance(result, (list, tuple)) and len(result) >= 5:
            mansuba_data = {
                "instruments_raw": result[0] if result[0] else None,
                "instrument_plot": result[1] if result[1] else None,
                "audio_summary": result[2] if result[2] else None,
                "ai_insight": result[3] if result[3] else None,
                "virality_plot": result[4] if result[4] else None,
            }
            
            # Extract instruments list from raw output
            if result[0]:
                try:
                    # Parse instruments from raw text
                    instruments = []
                    lines = result[0].split('\n')
                    for line in lines:
                        if ':' in line:
                            instrument = line.split(':')[0].strip()
                            if instrument and instrument not in instruments:
                                instruments.append(instrument)
                    mansuba_data["instruments"] = instruments
                except Exception as e:
                    logger.warning(f"Failed to parse instruments: {str(e)}")
                    mansuba_data["instruments"] = []
        else:
            logger.warning(f"Unexpected result format from Mansuba: {type(result)}")
            mansuba_data = {
                "instruments_raw": str(result),
                "instruments": [],
                "instrument_plot": None,
                "audio_summary": None,
                "ai_insight": None,
                "virality_plot": None,
            }
        
        logger.info(f"Parsed Mansuba data: {mansuba_data.keys()}")
        
        return AnalysisResponse(
            mansuba=mansuba_data,
            cyanite={}  # Cyanite is handled by Node.js
        )
        
    except requests.RequestException as e:
        logger.error(f"Failed to download audio file: {str(e)}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to download audio file: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )
    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
                logger.info(f"Cleaned up temporary file: {temp_file_path}")
            except Exception as e:
                logger.warning(f"Failed to delete temporary file: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
