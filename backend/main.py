from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import feedparser
import dotenv
from google import genai
import os

dotenv.load_dotenv()

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
    return {"message": "Welcome to Space Apps 2025 API"}

@app.get("/aqi-info")
async def aqi_info():
    rss_urls = {
        "https://feeds.airnowapi.org/rss/forecast/21.xml",
        "https://feeds.airnowapi.org/rss/actionday/21.xml",
        "https://feeds.airnowapi.org/rss/realtime/21.xml",
    }

    for url in rss_urls:
        feed = feedparser.parse(url)
        # Check if the feed was parsed successfully
        if feed.bozo == 0:  # bozo == 0 indicates a well-formed feed
            print(f"--- Articles from: {feed.feed.title} ---")
            for entry in feed.entries:
                print(f"Title: {entry.title}")
                print(f"Link: {entry.link}")
                if hasattr(entry, 'summary'):
                    print(f"Summary: {entry.summary}")
                print("-" * 20)
        else:
            print(f"Failed to parse feed from: {url} - Error: {feed.bozo_exception}")

    api_key = "AIzaSyA0wWEZ1ixhgv9T-7Rq1ljr3kSRP6sxj34"
    if not api_key:
        raise ValueError("Missing GOOGLE_API_KEY environment variable.")

    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents= entry.summary + "Parse the following HTML. There are 3 AQI Values. Format them as an array of numbers and DO NOT PREPEND OR APPEND ANYTHING ELSE TO YOUR MESSAGE.",
    )

    return response.text