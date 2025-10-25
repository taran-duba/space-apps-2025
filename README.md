# Environauts / Clairify

Modern full‑stack app to explore local air quality, visualize data, and surface AI‑assisted insights.

## Overview

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind v4, Leaflet for maps, Gemini client for AI UX.
- **Backend**: FastAPI (Python) exposing endpoints to fetch AQI by city, parse AirNow RSS, and (optionally) summarize via Gemini.
- **Goal**: Provide an interactive dashboard that blends real‑time AQI data with helpful context.

## Tech Stack

- **Frontend**: `next`, `react`, `tailwindcss`, `leaflet`, `@google/generative-ai`
- **Backend**: `fastapi`, `uvicorn`, `feedparser`, `requests`, `python-dotenv`, `google-generativeai`

## Repository Structure

```
.
├─ backend/
│  ├─ main.py            # FastAPI app and endpoints
│  ├─ requirements.txt   # Python dependencies
│  └─ .env.example       # Example backend env vars
├─ frontend/
│  ├─ package.json       # Next.js app dependencies and scripts
│  ├─ README.md          # Frontend-specific instructions
│  └─ src/ …             # App source
└─ README.md             # You are here
```

## Prerequisites

- **Node.js**: v20+ recommended
- **Python**: 3.10+ (3.11 preferred)
- **Package managers**: `npm` (or `pnpm`, `yarn`) and `pip`

## Setup

### 1) Backend (FastAPI)

1. Create the backend environment file from the example:

   ```bash
   cp backend/.env.example backend/.env
   ```

   Relevant variables in `backend/.env`:

   - `ENVIRONMENT` (default: `development`)
   - `PORT` (default: `8000`)
   - `CORS_ORIGINS` (default allows `http://localhost:3000`)
   - Optional: `NASA_EARTHDATA_USERNAME`, `NASA_EARTHDATA_PASSWORD`
   - If you plan to use Gemini in the backend, add: `GOOGLE_API_KEY=your_gemini_api_key`

2. Install dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

3. Run the API locally:

   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`.

### 2) Frontend (Next.js)

1. Create `frontend/.env.local`:

   ```ini
   NEXT_PUBLIC_RAPIDAPI_KEY=your_rapidapi_key
   NEXT_PUBLIC_RAPIDAPI_HOST=air-quality.p.rapidapi.com
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

   Notes:
   - Keys are exposed to the client. For production, proxy sensitive calls via the backend.
   - Geolocation features require HTTPS or `localhost`.

2. Install dependencies and run:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   The app will be available at `http://localhost:3000`.

## Running the project

Open two terminals:

- Terminal A (backend):
  ```bash
  uvicorn backend.main:app --reload --port 8000
  ```

- Terminal B (frontend):
  ```bash
  cd frontend && npm run dev
  ```

Ensure CORS allows the frontend origin. Default config in `backend/main.py` currently allows all origins for development via `CORSMiddleware`.

## API Reference (Backend)

Base URL: `http://localhost:8000`

- **GET** `/` — Health welcome
  - Response: `{ "message": "Welcome to the Environauts' API" }`

- **GET** `/status` — Health check
  - Response: `{ "status": "200 OK" }`

- **GET** `/aqi/{city}` — AQI by city name
  - Fetches coordinates via Open‑Meteo Geocoding API, then AQ metrics via Open‑Meteo Air Quality.
  - Sample:
    ```bash
    curl http://localhost:8000/aqi/Boston
    ```

- **GET** `/aqi-info` — Experimental RSS + Gemini parse
  - Parses AirNow RSS feeds (`forecast`, `actionday`, `realtime`) and attempts to extract AQI values using Gemini.
  - Requires a valid Google `GOOGLE_API_KEY` configured for the backend if you enable server‑side Gemini usage.
  - Note: The current code in `backend/main.py` includes a placeholder/hardcoded key. Replace this with `os.getenv("GOOGLE_API_KEY")` and set it in `backend/.env` for security.

### OpenAPI Docs

Once running, explore interactive docs at:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Frontend Notes

- Start page lives in `frontend/src/app/`.
- Map/visualizations use `leaflet` and `leaflet.heat`.
- UI components leverage Radix and shadcn.

## Development Tips

- Prefer server‑side environment variables for secrets; avoid exposing API keys in `NEXT_PUBLIC_*` for production.
- Keep backend CORS restricted in production (set `CORS_ORIGINS` appropriately).
- Pin Python/Node versions in your environment tooling to avoid drift.

## Troubleshooting

- **Backend won’t start**: Verify Python 3.10+ and `pip install -r backend/requirements.txt` succeeded.
- **CORS errors**: Confirm `CORS_ORIGINS` includes the frontend origin, or adjust `allow_origins` in `backend/main.py`.
- **Gemini errors**: Ensure `GOOGLE_API_KEY` (backend) or `NEXT_PUBLIC_GEMINI_API_KEY` (frontend) is set and not rate‑limited.
- **Geolocation blocked**: Use HTTPS or `localhost` and allow browser location permission.

## License

This project is licensed under the terms in `LICENSE`.

