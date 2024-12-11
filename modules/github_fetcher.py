import requests
from collections import Counter
from config.settings import Settings


class GitHubProfileFetcher:
    """Fetch comprehensive GitHub user profile data"""

    @staticmethod
    def fetch_user_profile(username):
        """
        Fetch detailed GitHub user profile

        Args:
            username (str): GitHub username

        Returns:
            dict: Comprehensive user profile data
        """
        base_url = f"https://api.github.com/users/{username}"

        # Fetch user details
        user_response = requests.get(
            base_url,
            headers={
                "Accept": "application/vnd.github.v3+json",
                "Authorization": f"token {Settings.GITHUB_API_TOKEN}",
            }
        )
        user_response.raise_for_status()
        user_data = user_response.json()

        # Fetch repositories
        repos_response = requests.get(
            user_data['repos_url'],
            headers={
                "Accept": "application/vnd.github.v3+json",
                "Authorization": f"token {Settings.GITHUB_API_TOKEN}",
            }
        )
        repos_response.raise_for_status()
        repos_data = repos_response.json()

        # Process languages and projects
        languages = Counter()
        recent_projects = []
        for repo in repos_data:
            if repo.get('language'):
                languages[repo['language']] += 1
            recent_projects.append({
                'name': repo['name'],
                'description': repo.get('description', ''),
                'stars': repo['stargazers_count'],
                'url': repo['html_url'],
                'updated_at': repo['updated_at']
            })


        # Sort projects date
        # recent_projects.sort(key=lambda x: x['stars'], reverse=True)

        return {
            'username': username,
            'name': user_data.get('name', username),
            'bio': user_data.get('bio', ''),
            'location': user_data.get('location', ''),
            'avatar_url': user_data.get('avatar_url', ''),
            'profile_url': user_data.get('html_url', ''),
            'top_languages': languages.most_common(3),
            'recent_projects': recent_projects[:5],
            'followers': user_data.get('followers', 0),
            'following': user_data.get('following', 0),
            'public_repos': user_data.get('public_repos', 0)
        }
