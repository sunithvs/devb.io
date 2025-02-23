import requests
from typing import Annotated
from fastapi import Path, HTTPException

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
    """
    Validate GitHub username format and existence
    """
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
    """
    Validate LinkedIn username format
    """
    if not LinkedInProfileFetcher._validate_linkedin_username(username):
        raise HTTPException(
            status_code=400,
            detail="Invalid LinkedIn username. Username can only contain letters, numbers, and hyphens."
        )
    return username


def get_user_data(username, force=True):
    if not force:
        print("Fetching user data from cache")
        res = requests.get(f"{Settings.API_URL}/user/{username}")
        if res.status_code == 200:
            return res.json()
    profile_data = GitHubProfileFetcher.fetch_user_profile(username)
    # Fetch contributions
    contributions_data = GitHubContributionsFetcher.fetch_recent_contributions(
        username,
        Settings.CONTRIBUTION_DAYS
    )

    # Generate AI descriptions
    ai_generator = AIDescriptionGenerator()
    try:
        profile_summary = ai_generator.generate_profile_summary(profile_data)
    except Exception as e:
        profile_summary = None
    if contributions_data:
        activity_summary = ai_generator.generate_activity_summary(contributions_data)
        profile_data['activity_summary'] = activity_summary if activity_summary else {}

    # Add summaries to profile data
    profile_data['profile_summary'] = profile_summary

    return profile_data
