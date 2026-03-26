import asyncio
import httpx
import logging
from typing import Annotated

from fastapi import Path, HTTPException

logger = logging.getLogger(__name__)

from config.settings import Settings
from modules.ai_generator import AIDescriptionGenerator
from modules.contributions_fetcher import GitHubContributionsFetcher
from modules.github_fetcher import GitHubProfileFetcher
from modules.linkedin_fetcher import LinkedInProfileFetcher


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
    """Validate GitHub username format and existence"""
    if not await GitHubProfileFetcher.validate_github_username(username):
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
    """Validate LinkedIn username format"""
    if not LinkedInProfileFetcher._validate_linkedin_username(username):
        raise HTTPException(
            status_code=400,
            detail="Invalid LinkedIn username. Username can only contain letters, numbers, and hyphens."
        )
    return username


async def get_user_data(username: str, force: bool = True) -> dict:
    """Get complete user data (profile + contributions + AI summary)"""
    if not force:
        logger.debug("Fetching user data from cache for: %s", username)
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{Settings.API_URL}/user/{username}")
        if res.status_code == 200:
            return res.json()

    # Parallel fetch profile + contributions
    profile_data, contributions_data = await asyncio.gather(
        GitHubProfileFetcher.fetch_user_profile(username),
        asyncio.to_thread(
            GitHubContributionsFetcher.fetch_recent_contributions,
            username,
            Settings.CONTRIBUTION_DAYS
        )
    )

    # Early return if GitHub fetch failed
    if "error" in profile_data:
        return profile_data

    ai_generator = AIDescriptionGenerator()

    # Parallel AI summary generation
    try:
        profile_summary, activity_summary = await asyncio.gather(
            asyncio.to_thread(ai_generator.generate_profile_summary, profile_data),
            asyncio.to_thread(ai_generator.generate_activity_summary, contributions_data) if contributions_data else None,
            return_exceptions=True
        )
    except Exception as e:
        logger.exception("Failed to generate AI summaries for user %s", username)
        profile_summary = None
        activity_summary = None

    if contributions_data:
        profile_data['activity_summary'] = activity_summary if activity_summary else {}

    profile_data['profile_summary'] = profile_summary
    return profile_data
