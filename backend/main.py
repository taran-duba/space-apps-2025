from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI(
    title="Space Apps 2025 API",
    description="Backend API for Space Apps 2025 project",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Environauts' API"}

@app.get("/status")
async def health_check():
    return {"status": "200 OK"}

@app.get("/aqi/{city}")
async def get_aqi(city: str):
    # Get coordinates for the city using Open-Meteo Geocoding API (free, no API key required)
    geo_url = "https://geocoding-api.open-meteo.com/v1/search"
    geo_params = {
        "name": city,
        "count": 1,
        "language": "en",
        "format": "json"
    }
    
    try:
        geo_response = requests.get(geo_url, params=geo_params)
        geo_response.raise_for_status()
        location_data = geo_response.json()
        
        if not location_data:
            return {"error": "City not found"}, 404
            
        if not location_data.get('results'):
            return {"error": "City not found"}, 404
            
        lat = location_data['results'][0]['latitude']
        lon = location_data['results'][0]['longitude']
        
        # Get AQI data using the coordinates
        aqi_url = "https://air-quality-api.open-meteo.com/v1/air-quality"
        aqi_params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": "pm10,pm2_5"
        }
        
        aqi_response = requests.get(aqi_url, params=aqi_params)
        aqi_response.raise_for_status()
        aqi_data = aqi_response.json()
        
        # Add location info to the response
        aqi_data["location"] = {
            "city": city,
            "latitude": lat,
            "longitude": lon
        }
        
        return aqi_data
        
    except requests.exceptions.RequestException as e:
        return {"error": f"Error fetching data: {str(e)}"}, 500
    
