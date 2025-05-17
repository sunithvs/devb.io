from datetime import datetime, timedelta

import requests

from config.settings import Settings


class GitHubContributionsFetcher:
    """Fetch and process GitHub user contributions"""

    @staticmethod
    def fetch_recent_contributions(username, days=120):
        """
        Fetch recent contributions for a GitHub user

        Args:
            username (str): GitHub username
            days (int, optional): Days to look back. Defaults to 30.

        Returns:
            dict: Recent contributions
        """
        try:
            events_url = f"https://api.github.com/users/{username}/events"

            response = requests.get(
                events_url,
                headers={
                    "Accept": "application/vnd.github.v3+json",
                    "Authorization": f"token {Settings.get_github_token()}",
                }
            )
            response.raise_for_status()
            events = response.json()

            # Filter and process events
            cutoff_date = datetime.now() - timedelta(days=days)
            contributions = {}

            for event in events:
                event_date = datetime.strptime(event['created_at'], "%Y-%m-%dT%H:%M:%SZ")
                if event_date < cutoff_date:
                    continue

                repo = event['repo']['name']
                if repo not in contributions:
                    contributions[repo] = []

                contribution = {
                    'type': event['type'],
                    'date': event_date.isoformat(),
                    'messages': []
                }
                if event['type'] == 'PushEvent':
                    # Extract commit messages
                    commits = event.get('payload', {}).get('commits', [])
                    contribution['messages'] = [
                        commit.get('message', '')[:100]
                        for commit in commits
                    ]
                    contributions[repo].append(contribution)

                elif event['type'] == 'PullRequestEvent':
                    # Extract pull request details
                    pr = event['payload'].get('pull_request', {})
                    title = pr.get('title', '')
                    body = pr.get('body', '') or 'No description'
                    contribution['messages'] = [
                        f"Title: {title}\nBody: {body}"
                    ]

                    contributions[repo].append(contribution)
            # Remove repositories without contributions
            contributions = {k: v for k, v in contributions.items() if v}

            # Sort by most contributions and limit to the top 10 repositories
            contributions = dict(
                sorted(contributions.items(), key=lambda x: len(x[1]), reverse=True)
            )
            contributions = {
                k: v for k, v in list(contributions.items())[:10]
            }

            return contributions
        except Exception as e:
            raise Exception(f"Error fetching contributions for {username}: {e}")
