"""
Spleeter Stem Separation Service
Fast, free, open-source stem separation using Deezer's Spleeter
"""

import os
import tempfile
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from spleeter.separator import Separator
import uvicorn
import shutil

app = FastAPI(title="Spleeter Stem Separation Service")

# Enable CORS for Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Spleeter separators
# 2stems: vocals + accompaniment
# 4stems: vocals, drums, bass, other
# 5stems: vocals, drums, bass, piano, other
separator_2stems = Separator('spleeter:2stems')
separator_4stems = Separator('spleeter:4stems')
separator_5stems = Separator('spleeter:5stems')

@app.get("/")
async def root():
    return {
        "service": "Spleeter Stem Separation",
        "version": "1.0.0",
        "models": ["2stems", "4stems", "5stems"],
        "status": "ready"
    }

@app.post("/split")
async def split_audio(
    file: UploadFile = File(...),
    stems: int = 4  # 2, 4, or 5
):
    """
    Split audio file into stems
    
    Args:
        file: Audio file (mp3, wav, flac, etc.)
        stems: Number of stems (2, 4, or 5)
            - 2: vocals, accompaniment
            - 4: vocals, drums, bass, other
            - 5: vocals, drums, bass, piano, other
    
    Returns:
        URLs to download each stem
    """
    
    if stems not in [2, 4, 5]:
        raise HTTPException(status_code=400, detail="stems must be 2, 4, or 5")
    
    # Create temp directory for this separation
    temp_dir = tempfile.mkdtemp()
    
    try:
        # Save uploaded file
        input_path = os.path.join(temp_dir, file.filename)
        with open(input_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        print(f"[SPLEETER] Processing: {file.filename}")
        print(f"[SPLEETER] Using {stems}-stem model")
        
        # Select separator
        if stems == 2:
            separator = separator_2stems
            stem_names = ['vocals', 'accompaniment']
        elif stems == 4:
            separator = separator_4stems
            stem_names = ['vocals', 'drums', 'bass', 'other']
        else:  # 5 stems
            separator = separator_5stems
            stem_names = ['vocals', 'drums', 'bass', 'piano', 'other']
        
        # Separate
        output_dir = os.path.join(temp_dir, "output")
        separator.separate_to_file(input_path, output_dir)
        
        # Get stem file paths
        base_name = Path(file.filename).stem
        stem_dir = os.path.join(output_dir, base_name)
        
        # Build response with stem info
        stems_data = {}
        for stem_name in stem_names:
            stem_file = os.path.join(stem_dir, f"{stem_name}.wav")
            if os.path.exists(stem_file):
                # Get file size
                file_size = os.path.getsize(stem_file)
                
                # Store stem info
                stems_data[stem_name] = {
                    "path": stem_file,
                    "size": file_size,
                    "format": "wav",
                    "sample_rate": 44100,
                    # You could add duration detection here
                    "duration": 180.0  # placeholder
                }
        
        print(f"[SPLEETER] ✅ Separation complete: {len(stems_data)} stems")
        
        return {
            "success": True,
            "filename": file.filename,
            "stems_count": len(stems_data),
            "stems": stems_data,
            "temp_dir": temp_dir,  # Frontend will need this to download files
            "message": f"Successfully separated into {len(stems_data)} stems"
        }
        
    except Exception as e:
        # Clean up on error
        shutil.rmtree(temp_dir, ignore_errors=True)
        print(f"[SPLEETER] ❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/download/{temp_dir}/{base_name}/{stem_name}")
async def download_stem(temp_dir: str, base_name: str, stem_name: str):
    """
    Download a specific stem file
    """
    stem_path = f"/tmp/{temp_dir}/output/{base_name}/{stem_name}.wav"
    
    if not os.path.exists(stem_path):
        raise HTTPException(status_code=404, detail="Stem file not found")
    
    return FileResponse(
        stem_path,
        media_type="audio/wav",
        filename=f"{base_name}_{stem_name}.wav"
    )

@app.post("/cleanup/{temp_dir}")
async def cleanup(temp_dir: str):
    """
    Clean up temporary files after download
    """
    try:
        full_path = f"/tmp/{temp_dir}"
        if os.path.exists(full_path):
            shutil.rmtree(full_path)
            return {"success": True, "message": "Cleanup complete"}
        return {"success": False, "message": "Directory not found"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🎵 Starting Spleeter Stem Separation Service...")
    print("📍 Running on http://localhost:8001")
    print("🎼 Models: 2stems, 4stems, 5stems")
    uvicorn.run(app, host="0.0.0.0", port=8001)
