import json
import os
from datetime import datetime

from config.settings import Settings
from modules.ai_generator import AIDescriptionGenerator
from modules.contributions_fetcher import GitHubContributionsFetcher
from modules.github_fetcher import GitHubProfileFetcher
from modules.html_generator import HTMLProfileGenerator
from utils.logger import ErrorLogger


def process_user(username):
    """
    Comprehensive user profile generation process

    Args:
        username (str): GitHub username to process
    """
    try:
        # Fetch GitHub profile
        if username in Settings.BLACKLISTED_USERS:
            print(f"Skipping blacklisted user: {username}")
            return False
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
        profile_data['contributions_data'] = contributions_data

        # Save raw profile data
        os.makedirs(os.path.join(Settings.DATA_DIR, 'raw_profiles'), exist_ok=True)
        with open(os.path.join(Settings.DATA_DIR, 'raw_profiles', f'{username}_profile.json'), 'w') as f:
            json.dump(profile_data, f, indent=4)

        # Generate HTML profile
        html_generator = HTMLProfileGenerator()
        html_generator.generate_profile_html(
            profile_data,
            Settings.HTML_OUTPUT_DIR
        )
        processed_users = {}
        with open(Settings.PROCESSED_USERS_FILE, 'r') as f:
            processed_users = json.load(f)
        if username not in processed_users:
            processed_users[username] = {
                'created': datetime.now().isoformat(),
                'profile_summary': profile_summary,
                'username': username,
                'avatar_url': profile_data.get('avatar_url', ''),
                'updated': datetime.now().isoformat(),
                'name': profile_data.get('name', ''),
            }
        else:
            processed_users[username]['updated'] = datetime.now().isoformat()

        with open(Settings.PROCESSED_USERS_FILE, 'w') as f:
            json.dump(processed_users, f, indent=4)

        print(f"Successfully processed {username}")

        return True
    except Exception as e:
        # Log any errors
        ErrorLogger.log_error(
            username,
            str(e),
        )
        print(f"Error processing {username}: {e}")
        return False


def main():
    """Main execution function"""
    # Load users from JSON
    with open(Settings.DATA_TO_PROCESS, 'r') as f:
        users = json.load(f)
    if not users:
        print("No users to process")
        return
    print(f"Processing {min(Settings.MAX_USERS_PER_RUN, len(users))} users from {len(users)} users")
    for username in users[:Settings.MAX_USERS_PER_RUN]:
        status = process_user(username)
        if username in users and status:
            users.remove(username)
    with open(Settings.DATA_TO_PROCESS, 'w') as f:
        json.dump(users, f, indent=4)


if __name__ == "__main__":
    main()
