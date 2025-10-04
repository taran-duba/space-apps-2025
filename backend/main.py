from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import datetime as dt
import os
import numpy as np
import xarray as xr
import cartopy.crs as ccrs
import cartopy.feature as cfeature
import matplotlib.pyplot as plt
from cartopy.mpl.gridliner import LONGITUDE_FORMATTER, LATITUDE_FORMATTER
from xarray.plot.utils import label_from_attrs

import dotenv

dotenv.load_dotenv()

from harmony import BBox, Client, Collection, Request
from harmony.config import Environment

harmony_client = Client(env=Environment.PROD, auth=(os.getenv("NASA_EARTHDATA_USERNAME"), os.getenv("NASA_EARTHDATA_PASSWORD")))

# ✅ Use MODIS Terra AOD 500nm collection
request = Request(
    collection=Collection(id="C1617947590-LAADS"),  # Terra MODIS AOD 500nm L2
    granule_name=["MOD04_L2.A2025279.1755.061.2025279223027.hdf"],  # Example granule
)

# Validate request
request.is_valid()

# Submit Harmony request
job_id = harmony_client.submit(request)
print(f"jobID = {job_id}")

# Wait for processing
harmony_client.wait_for_processing(job_id, show_progress=True)

# Download results
results = harmony_client.download_all(job_id, directory="/tmp")
all_results_stored = [f.result() for f in results]

print(f"Number of result files: {len(all_results_stored)}")

# Open the downloaded granule
datatree = xr.open_dataset(all_results_stored[0])
print(datatree)




# app = FastAPI(
#     title="Space Apps 2025 API",
#     description="Backend API for Space Apps 2025 project",
#     version="0.1.0"
# )

# # Configure CORS
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # In production, replace with your frontend URL
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.get("/")
# async def read_root():
#     return {"message": "Welcome to Space Apps 2025 API"}

# @app.get("/health")
# async def health_check():
#     return {"status": "healthy"}
