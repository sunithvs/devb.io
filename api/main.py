import json
import re
from contextlib import asynccontextmanager

from typing import Annotated, Dict, Any, List

import httpx
import redis.asyncio as redis
import requests
import uvicorn
from fastapi import FastAPI, HTTPException, Path, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware  
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend

from modules.ai_generator import AIDescriptionGenerator
from modules.github_projects import GitHubProjectRanker

DEBUG = True
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


async def background_manage_users_list(username: str) -> None:
    """
    Background task to manage the list of users in Redis.
    - Retrieve existing users
    - Add new user if not already in the list
    - Update the list in Redis
    """
    try:
        # Get existing users list (or initialize if not exists)
        existing_users_json = await redis_client.get(USERS_LIST_KEY)

        if existing_users_json:
            existing_users = json.loads(existing_users_json)
        else:
            existing_users = []

        # Add user if not already in the list
        if username not in existing_users:
            existing_users.append(username)

            # Store updated list back in Redis
            await redis_client.set(
                USERS_LIST_KEY,
                json.dumps(existing_users)
            )
    except Exception as e:
        # Log the error or handle it as appropriate for your application
        print(f"Background task error managing users list: {e}")


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
    if cached_response and not DEBUG:
        return json.loads(cached_response)

    basic_profile = GitHubProfileFetcher.fetch_user_profile(username)
    ai_generator = AIDescriptionGenerator()
    about_data = ai_generator.generate_profile_summary(basic_profile)
    basic_profile['about'] = about_data

    await redis_client.setex(name=cache_key, value=json.dumps(basic_profile), time=3600)

    return basic_profile


@app.get("/user/{username}/profile", response_model=Dict[str, Any])
async def fetch_basic_profile(username: Annotated[str, Depends(verify_username)], background_tasks: BackgroundTasks):
    """
    Fetch basic GitHub user profile information (name, bio, stats, etc.)
    """
    username = username.strip().lower()
    print(f"Fetching profile for {username}")
    return await get_cached_github_profile(username)


@app.get("/user/{username}/projects", response_model=Dict[str, Any])
async def fetch_projects_data(username: Annotated[str, Depends(verify_username)]):
    """
    Fetch GitHub user's projects and languages data
    """
    username = username.strip().lower()
    try:
        cache_key = f"github_profile_projects:{username}"
        # Check cache
        cached_response = await redis_client.get(cache_key)
        if cached_response and not DEBUG:
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
async def fetch_about_data(username: Annotated[str, Depends(verify_username)]):
    """
    Fetch GitHub user's README content
    """
    username = username.strip().lower()
    try:
        cache_key = f"github_profile_about:{username}"
        # Check cache
        cached_response = await redis_client.get(cache_key)
        if cached_response and not DEBUG:
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


@app.get("/users", response_model=List[str])
async def get_users_list():
    """
    Retrieve the list of users from external API and compare with Redis.
    Returns only new users.
    """
    try:
        # Fetch users from external API
        response = requests.get("https://devb.io/data/processed_users.json")
        try:
            response.raise_for_status()
            external_users_dict = response.json()
        except requests.HTTPError:
            external_users_dict = {}

        # Get existing users from Redis
        existing_users_json = await redis_client.get(USERS_LIST_KEY)
        existing_users = json.loads(existing_users_json) if existing_users_json else []
        # make case insensitive
        existing_users = [user.lower() for user in existing_users]
        external_users_dict = [user.lower() for user in external_users_dict.keys()]

        new_users = set(existing_users) - set(external_users_dict)

        if new_users:
            await redis_client.set(
                USERS_LIST_KEY,
                json.dumps(list(new_users))
            )

        return new_users

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing users list: {str(e)}"
        )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
