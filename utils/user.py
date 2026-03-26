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
        raise HTTPException(status_code=400, detail="Invalid GitHub username.")
    return username


async def verify_linkedin_username(
    username: Annotated[
        str,
        Path(min_length=1, pattern=r'^[\w\-]+$')
    ]
) -> str:
    """Validate LinkedIn username format"""
    if not LinkedInProfileFetcher._validate_linkedin_username(username):
        raise HTTPException(status_code=400, detail="Invalid LinkedIn username.")
    return username


async def get_user_data(username: str, force: bool = True) -> dict:
    """Get complete user data (profile + contributions + AI summary)"""
    if not force:
        logger.debug("Fetching user data from cache for: %s", username)
        async with httpx.AsyncClient() as client:
            res = await client.get(f"{Settings.API_URL}/user/{username}")
        if res.status_code == 200:
            return res.json()

    profile_data, contributions_data = await asyncio.gather(
        GitHubProfileFetcher.fetch_user_profile(username),
        asyncio.to_thread(GitHubContributionsFetcher.fetch_recent_contributions, username, Settings.CONTRIBUTION_DAYS)
    )

    if "error" in profile_data:
        return profile_data

    ai_generator = AIDescriptionGenerator()
    ai_tasks = [asyncio.to_thread(ai_generator.generate_profile_summary, profile_data)]
    if contributions_data:
        ai_tasks.append(asyncio.to_thread(ai_generator.generate_activity_summary, contributions_data))

    results = await asyncio.gather(*ai_tasks, return_exceptions=True)

    profile_summary = results[0] if not isinstance(results[0], BaseException) else None
    activity_summary = results[1] if len(results) > 1 and not isinstance(results[1], BaseException) else None

    if contributions_data:
        profile_data['activity_summary'] = activity_summary if activity_summary else {}

    profile_data['profile_summary'] = profile_summary
    return profile_data
