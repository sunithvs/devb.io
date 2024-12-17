import requests

from config.settings import Settings
from modules.ai_generator import AIDescriptionGenerator
from modules.contributions_fetcher import GitHubContributionsFetcher
from modules.github_fetcher import GitHubProfileFetcher


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
