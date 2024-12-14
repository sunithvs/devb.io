import json
import re
from contextlib import asynccontextmanager
from typing import Annotated, Dict, Any

import httpx
import redis.asyncio as redis
import uvicorn
from fastapi import FastAPI, HTTPException, Path, Depends
from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi.middleware.cors import CORSMiddleware  # Add this import

# Import your existing modules
from config.settings import Settings
from utils.user import get_user_data

redis_client = redis.from_url(
    Settings.REDIS_HOST,
    encoding="utf8",
    decode_responses=True
)


async def validate_github_username(username: str) -> bool:
    """
    Validate GitHub username:
    - Must be 1-39 characters long
    - Can only contain alphanumeric characters and hyphens
    - Cannot start or end with a hyphen
    - Cannot have consecutive hyphens
    """
    # Basic pattern without look-ahead
    pattern = r'^[a-zA-Z0-9][-a-zA-Z0-9]*[a-zA-Z0-9]$'
    if not (re.match(pattern, username) and len(username) <= 39 and '--' not in username):
        return False

    # Optional: Verify user exists on GitHub
    async with httpx.AsyncClient() as client:
        try:
            response = await client.head(f'https://github.com/{username}')
            return response.status_code == 200
        except httpx.HTTPError:
            # If check fails, fall back to pattern validation
            return True


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
    if not await validate_github_username(username):
        raise HTTPException(
            status_code=400,
            detail="Invalid GitHub username. Usernames must be 1-39 characters long and can only contain alphanumeric characters and single hyphens."
        )
    return username


@app.get("/user/{username}", response_model=Dict[str, Any])
async def fetch_user_profile(username: Annotated[str, Depends(verify_username)]):
    """
    Fetch GitHub user profile information with Redis caching.
    """
    try:
        cache_key = f"github_profile:{username}"
        # Await Redis GET operation
        cached_response = await redis_client.get(cache_key)
        if cached_response:
            return json.loads(cached_response)

        # Fetch user data if not in cache
        user_data = get_user_data(username)
        # Await Redis SETEX operation
        await redis_client.setex(name=cache_key, value=json.dumps(user_data), time=3600)
        return user_data

    except Exception as e:
        raise HTTPException(
            status_code=404,
            detail=f"User {username} not found: {str(e)}"
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
