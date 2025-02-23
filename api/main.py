import json
import re
from contextlib import asynccontextmanager

from typing import Annotated, Dict, Any, List

import httpx
import redis.asyncio as redis
import requests
import uvicorn
from fastapi import FastAPI, HTTPException, Path, Depends, BackgroundTasks, Security
from fastapi.middleware.cors import CORSMiddleware  
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi.security.api_key import APIKeyHeader, APIKey
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from modules.ai_generator import AIDescriptionGenerator
from modules.github_projects import GitHubProjectRanker
from modules.linkedin_fetcher import LinkedInProfileFetcher

# Import your existing modules
from config.settings import Settings
from utils.user import get_user_data
from modules.github_fetcher import GitHubProfileFetcher

redis_client = redis.from_url(
    Settings.REDIS_HOST,
    encoding="utf8",
    decode_responses=True
)
USERS_LIST_KEY = "github_users_list"


async def validate_github_username_handler(username: str) -> bool:
    """
    Handler function that calls the GitHub username validation from the github_fetcher module
    """
    return await GitHubProfileFetcher.validate_github_username(username)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Redis cache
    redis_client = redis.from_url(
        Settings.REDIS_HOST,
        encoding="utf8",
        decode_responses=True
    )
    FastAPICache.init(RedisBackend(redis_client), prefix="github-profile-cache:")

    yield

    # Cleanup (if needed)
    await redis_client.close()


app = FastAPI(
    title="GitHub Profile API",
    version="2.0.0",
    lifespan=lifespan
)


async def verify_username(
        username: Annotated[
            str,
            Path(
                min_length=1,
                max_length=39,
                pattern=r'^[a-zA-Z0-9][-a-zA-Z0-9]*[a-zA-Z0-9]$'
            )
        ]
) -> str:
    if not await validate_github_username_handler(username):
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub username. Usernames must be 1-39 characters long and can only contain alphanumeric characters and single hyphens."
        )
    return username


async def verify_linkedin_username(
        username: Annotated[
            str,
            Path(
                min_length=1,
                pattern=r'^[\w\-]+$'
            )
        ]
) -> str:
    """Verify LinkedIn username format"""
    if not LinkedInProfileFetcher._validate_linkedin_username(username):
        raise HTTPException(
            status_code=400,
            detail="Invalid LinkedIn username. Username can only contain letters, numbers, and hyphens."
        )
    return username


async def get_cached_github_profile(username: str, ) -> Dict[str, Any]:
    """
    Get GitHub profile data with caching support.
    Can be used by both API endpoints and AI generator.
    
    Args:
        username: GitHub username

    Returns:
        Dict containing GitHub profile data
    """
    username = username.strip().lower()
    cache_key = f"github_profile_basic:{username}"
    # Check cache
    cached_response = await redis_client.get(cache_key)
    if cached_response and not Settings.DEBUG:
        return json.loads(cached_response)

    basic_profile = GitHubProfileFetcher.fetch_user_profile(username)
    ai_generator = AIDescriptionGenerator()
    about_data = ai_generator.generate_profile_summary(basic_profile)
    basic_profile['about'] = about_data

    await redis_client.setex(name=cache_key, value=json.dumps(basic_profile), time=3600)

    return basic_profile


class APIKeyMiddleware(BaseHTTPMiddleware):
    EXCLUDED_PATHS = {"/docs", "/redoc", "/openapi.json"}  # Add paths to exclude from auth

    async def dispatch(self, request: Request, call_next):
        # Skip authentication for excluded paths or in debug mode
        if request.url.path in self.EXCLUDED_PATHS or Settings.DEBUG:
            return await call_next(request)

        # Get API key from header
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

# Add middleware for authentication



@app.get("/user/{username}/profile", response_model=Dict[str, Any])
async def fetch_basic_profile(
    username: Annotated[str, Depends(verify_username)], 
    background_tasks: BackgroundTasks
):
    """
    Fetch basic GitHub user profile information (name, bio, stats, etc.)
    """
    username = username.strip().lower()
    print(f"Fetching profile for {username}")
    return await get_cached_github_profile(username)


@app.get("/user/{username}/projects", response_model=Dict[str, Any])
async def fetch_projects_data(
    username: Annotated[str, Depends(verify_username)]
):
    """
    Fetch GitHub user's projects and languages data
    """
    try:
        username = username.strip().lower()
        cache_key = f"github_profile_projects:{username}"
        # Check cache
        cached_response = await redis_client.get(cache_key)
        if cached_response and not Settings.DEBUG:
            return json.loads(cached_response)

        # Fetch user data
        project_data = GitHubProjectRanker().get_featured(username)

        await redis_client.setex(name=cache_key, value=json.dumps(project_data), time=3600)
        return project_data

    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"User {username} not found: {str(e)}"
        )


@app.get("/user/{username}/about", response_model=Dict[str, Any])
async def fetch_about_data(
    username: Annotated[str, Depends(verify_username)]
):
    """
    Fetch GitHub user's README content
    """
    try:
        username = username.strip().lower()
        cache_key = f"github_profile_about:{username}"
        # Check cache
        cached_response = await redis_client.get(cache_key)
        if cached_response and not Settings.DEBUG:
            return json.loads(cached_response)

        # Fetch user data
        user_data = await get_cached_github_profile(username)
        print(f"Fetching about data for {username}",user_data)

        ai_generator = AIDescriptionGenerator()
        about_data = ai_generator.generate_profile_summary(user_data)
        print(f"About data for {username}",about_data)
        data = {
            "about": about_data
        }
        await redis_client.setex(name=cache_key, value=json.dumps(data), time=3600)
        return data

    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"User {username} not found: {str(e)}"
        )


@app.get("/user/{username}/linkedin", response_model=Dict[str, Any])
async def fetch_linkedin_profile(
    username: Annotated[str, Depends(verify_linkedin_username)]
):
    """
    Fetch LinkedIn profile data
    
    Args:
        username: LinkedIn username (e.g., john-doe)
    
    Returns:
        Dict containing processed LinkedIn profile data
    """
    try:
        cache_key = f"linkedin_profile:{username}"
        
        # Check cache
        cached_response = await redis_client.get(cache_key)
        if cached_response and not Settings.DEBUG:
            return json.loads(cached_response)

        # Fetch fresh data
        fetcher = LinkedInProfileFetcher()
        profile_data = await fetcher.fetch_profile_async(username)
        
        if "error" in profile_data:
            raise HTTPException(
                status_code=400,
                detail=profile_data["error"]
            )
            
        # Cache the result
        await redis_client.setex(name=cache_key, value=json.dumps(profile_data), time=3600)
        return profile_data

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch LinkedIn profile: {str(e)}"
        )

app.add_middleware(APIKeyMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
