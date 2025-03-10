import json
from typing import Dict, Any, Annotated

import redis.asyncio as redis
import uvicorn
from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from config.settings import Settings
from modules.ai_generator import AIDescriptionGenerator
from modules.github_fetcher import GitHubProfileFetcher
from modules.github_projects import GitHubProjectRanker
from modules.linkedin_fetcher import LinkedInProfileFetcher
from utils.user import verify_username, verify_linkedin_username, get_user_data

# Initialize FastAPI app
app = FastAPI(
    title="Devb Profile API",
    version="2.0.0",
)

# Initialize Redis client
if Settings.CACHE_ENABLED:
    redis_client = redis.Redis(host='redis', port=6379, db=0)


class APIKeyMiddleware(BaseHTTPMiddleware):
    """Middleware for API key authentication"""
    EXCLUDED_PATHS = {"/docs", "/redoc", "/openapi.json"}

    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.EXCLUDED_PATHS or Settings.DEBUG:
            return await call_next(request)

        api_key = request.headers.get("X-API-Key")
        if not api_key:
            return JSONResponse(
                status_code=401,
                content={"detail": "API Key header is missing"}
            )
        
        if api_key not in Settings.API_KEYS:
            return JSONResponse(
                status_code=403,
                content={"detail": "Invalid API Key"}
            )

        return await call_next(request)

async def get_cached_github_profile(username: str) -> Dict[str, Any]:
    """Fetch and cache GitHub profile data"""

    cache_key = f"github_profile_basic:{username}"
    if  Settings.CACHE_ENABLED:
        cached_response = await redis_client.get(cache_key)
        if cached_response:
            return json.loads(cached_response)

    basic_profile = GitHubProfileFetcher.fetch_user_profile(username)
    basic_profile['cached'] = False

    try:
        ai_generator = AIDescriptionGenerator()
        about_data = ai_generator.generate_profile_summary(basic_profile)
        basic_profile['about'] = about_data
    except Exception as e:
        print(f"Failed to generate AI description: {str(e)}")
        basic_profile['about'] = None
    if Settings.CACHE_ENABLED:
        basic_profile['cached'] = True
        await redis_client.setex(name=cache_key, value=json.dumps(basic_profile), time=Settings.DEFAULT_CACHE_TTL)
    return basic_profile

# API Endpoints
@app.get("/user/{username}/profile", response_model=Dict[str, Any])
async def fetch_basic_profile(
    username: Annotated[str, Depends(verify_username)], 
    background_tasks: BackgroundTasks
):
    """Fetch basic GitHub user profile information"""
    username = username.strip().lower()
    return await get_cached_github_profile(username)

@app.get("/user/{username}/projects", response_model=Dict[str, Any])
async def fetch_projects_data(username: Annotated[str, Depends(verify_username)]):
    """Fetch GitHub user's projects and languages data"""
    try:
        username = username.strip().lower()
        cache_key = f"github_profile_projects:{username}"
        if Settings.CACHE_ENABLED:
            cached_response = await redis_client.get(cache_key)

            if cached_response and not Settings.DEBUG:
                return json.loads(cached_response)

        project_data = GitHubProjectRanker().get_featured(username)
        if Settings.CACHE_ENABLED:
            await redis_client.setex(name=cache_key, value=json.dumps(project_data), time=Settings.DEFAULT_CACHE_TTL)
        return project_data

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"User {username} not found: {str(e)}")

@app.get("/user/{username}/about", response_model=Dict[str, Any])
async def fetch_about_data(username: Annotated[str, Depends(verify_username)]):
    """Fetch GitHub user's README content"""
    try:
        username = username.strip().lower()
        cache_key = f"github_profile_about:{username}"
        if Settings.CACHE_ENABLED:
            cached_response = await redis_client.get(cache_key)

            if cached_response and not Settings.DEBUG:
                return json.loads(cached_response)

        user_data = await get_cached_github_profile(username)
        data = {
            "about": user_data['about']
        }
        if Settings.CACHE_ENABLED:
            await redis_client.setex(name=cache_key, value=json.dumps(data), time=Settings.DEFAULT_CACHE_TTL)
        return data

    except Exception as e:
        raise HTTPException(status_code=404, detail=f"User {username} not found: {str(e)}")

@app.get("/user/{username}/linkedin", response_model=Dict[str, Any])
async def fetch_linkedin_profile(username: Annotated[str, Depends(verify_linkedin_username)]):
    """Fetch LinkedIn profile data"""
    try:
        cache_key = f"linkedin_profile:{username}"
        if Settings.CACHE_ENABLED:
            cached_response = await redis_client.get(cache_key)
        
            if cached_response and not Settings.DEBUG:
                return json.loads(cached_response)

        fetcher = LinkedInProfileFetcher()
        profile_data = await fetcher.fetch_profile_async(username)
        
        if "error" in profile_data:
            raise HTTPException(status_code=400, detail=profile_data["error"])
        if Settings.CACHE_ENABLED:
            await redis_client.setex(name=cache_key, value=json.dumps(profile_data), time=Settings.DEFAULT_CACHE_TTL)
        return profile_data

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch LinkedIn profile: {str(e)}")



ALLOWED_ORIGINS = [
    "https://devb.io",
    "https://beta.devb.io",
    "http://localhost:3000",  # For local development
    "http://localhost:8080"
]

# Add CORS middleware with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Use the whitelist instead of "*"
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],  # Specify allowed methods
    allow_headers=["Authorization", "Content-Type", "X-API-Key"],  # Specify allowed headers
    expose_headers=[],  # Headers that can be exposed to the browser
    max_age=600,  # How long the results of a preflight request can be cached (in seconds)

)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
