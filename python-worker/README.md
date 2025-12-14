# NoCulture Music Analysis Worker

Python FastAPI service for AI-powered music analysis using Mansuba.

## Setup

1. **Install Python 3.9+**

2. **Create virtual environment:**
```bash
cd python-worker
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Set environment variables (optional):**
```bash
export GROQ_API_KEY="your_groq_api_key"  # For faster LLM inference
```

## Running the Worker

**Development:**
```bash
python main.py
```

**Production:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

The worker will be available at `http://localhost:8000`

## API Endpoints

### POST /analyze
Analyze an audio file using Mansuba AI.

**Request:**
```json
{
  "audioUrl": "https://example.com/audio.mp3",
  "assetId": "asset_123"
}
```

**Response:**
```json
{
  "mansuba": {
    "instruments": ["Piano", "Drums", "Bass"],
    "instruments_raw": "Piano: 0.95\nDrums: 0.87\nBass: 0.82",
    "instrument_plot": "base64_image_data",
    "audio_summary": "This track features...",
    "ai_insight": "The production quality is...",
    "virality_plot": "base64_image_data"
  },
  "cyanite": {}
}
```

### GET /health
Health check endpoint.

## Environment Variables

- `GROQ_API_KEY` - Optional, for faster LLM inference with Groq
- `PORT` - Server port (default: 8000)

## Docker Deployment (Optional)

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t noculture-worker .
docker run -p 8000:8000 noculture-worker
```

## Integration with Next.js

Add to `.env.local`:
```
PYTHON_WORKER_URL=http://localhost:8000
```

The Next.js app will automatically call this worker when analyzing assets.
