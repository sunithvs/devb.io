import base64
import re
import logging
from datetime import datetime, timedelta

import httpx

from config.settings import Settings

logger = logging.getLogger(__name__)


class GitHubProfileFetcher:
    """Fetch comprehensive GitHub user profile data"""

    @staticmethod
    def _validate_username_pattern(username: str) -> bool:
        """Validate GitHub username pattern:
        - Must be 1-39 characters long
        - Can only contain alphanumeric characters and hyphens
        - Cannot start or end with a hyphen
        - Cannot have consecutive hyphens"""
        if not isinstance(username, str) or not username:
            return False
        pattern = r'^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$'
        return bool(re.match(pattern, username))

    @staticmethod
    def _get_github_headers() -> dict:
        """Get standard GitHub API headers"""
        return {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"token {Settings.get_github_token()}"
        }

    @staticmethod
    async def validate_github_username(username: str) -> bool:
        """Async validate GitHub username including API check:
        - Validates username pattern
        - Verifies user exists on GitHub
        - Confirms account is of type 'User' (not Organization)"""
        if not GitHubProfileFetcher._validate_username_pattern(username):
            return False
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f'https://api.github.com/users/{username}',
                    headers=GitHubProfileFetcher._get_github_headers()
                )
                if response.status_code != 200:
                    return False
                data = response.json()
                return data.get('type') == 'User'
            except httpx.HTTPError:
                return True  # Fall back to pattern validation on API error

    @staticmethod
    async def fetch_user_profile(username: str) -> dict:
        """Fetch detailed GitHub user profile with extended metrics"""
        try:
            if not await GitHubProfileFetcher.validate_github_username(username):
                raise ValueError(f"Invalid GitHub username: '{username}'")

            one_year_ago = (datetime.now() - timedelta(days=365)).isoformat() + 'Z'

            graphql_query = {
                "query": f"""
                    query {{
                      user(login: "{username}") {{
                        name
                        bio
                        location
                        avatarUrl
                        url
                        followers {{ totalCount }}
                        following {{ totalCount }}
                        repository(name: "{username}") {{
                          object(expression: "HEAD:README.md") {{ ... on Blob {{ text }} }}
                          defaultBranchRef {{ name }}
                        }}
                        repositories(first: 100, orderBy: {{field: UPDATED_AT, direction: DESC}}) {{
                          totalCount
                          nodes {{ name description stargazerCount primaryLanguage {{ name }} url updatedAt }}
                        }}
                        contributionsCollection(from: "{one_year_ago}") {{
                          contributionCalendar {{ totalContributions }}
                          pullRequestContributionsByRepository {{ repository {{ name }} contributions(first: 100) {{ totalCount }} }}
                          issueContributionsByRepository {{ repository {{ name }} contributions(first: 100) {{ totalCount }} }}
                        }}
                        pullRequests(first: 100, states: MERGED, orderBy: {{field: UPDATED_AT, direction: DESC}}) {{ nodes {{ createdAt }} totalCount }}
                        issues(last: 100, states: CLOSED) {{ totalCount nodes {{ createdAt }} }}
                        repositoriesContributedTo(first: 100, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {{ totalCount nodes {{ name }} }}
                      }}
                    }}
                """
            }

            async with httpx.AsyncClient() as client:
                graphql_response = await client.post(
                    "https://api.github.com/graphql",
                    headers={
                        "Authorization": f"Bearer {Settings.get_github_token()}",
                        "Content-Type": "application/json"
                    },
                    json=graphql_query
                )
                graphql_response.raise_for_status()

            graphql_data = graphql_response.json().get('data', {}).get('user', {})
            if not graphql_data:
                raise ValueError(f"User '{username}' not found or query returned no data.")

            pr_merged_last_year = sum(
                1 for pr in graphql_data.get('pullRequests', {}).get('nodes', [])
                if pr and datetime.strptime(pr['createdAt'], '%Y-%m-%dT%H:%M:%SZ') > datetime.now() - timedelta(days=365)
            )
            issues_closed_last_year = sum(
                1 for issue in graphql_data.get('issues', {}).get('nodes', [])
                if issue and datetime.strptime(issue['createdAt'], '%Y-%m-%dT%H:%M:%SZ') > datetime.now() - timedelta(days=365)
            )

            return {
                'username': username,
                'name': graphql_data.get('name') or username,
                'bio': graphql_data.get('bio', ''),
                'location': graphql_data.get('location', ''),
                'avatar_url': graphql_data.get('avatarUrl', ''),
                'profile_url': graphql_data.get('url', ''),
                'followers': graphql_data.get('followers', {}).get('totalCount', 0),
                'following': graphql_data.get('following', {}).get('totalCount', 0),
                'public_repos': graphql_data.get('repositories', {}).get('totalCount', 0),
                'pull_requests_merged': pr_merged_last_year if pr_merged_last_year < 100 else f"{100}+",
                'issues_closed': issues_closed_last_year if issues_closed_last_year < 100 else f"{100}+",
                'achievements': {
                    'total_contributions': graphql_data.get('contributionsCollection', {})
                                           .get('contributionCalendar', {})
                                           .get('totalContributions', 0),
                    'repositories_contributed_to': graphql_data.get('repositoriesContributedTo', {})
                                                             .get('totalCount', 0),
                },
                'social_accounts': await GitHubProfileFetcher.social_accounts(username),
                'readme_content': (graphql_data.get('repository', {}).get('object', {}).get('text', '')
                                   if graphql_data.get('repository') and graphql_data.get('repository', {}).get('object') else '')
            }

        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP Error: {e.response.status_code}"}
        except httpx.RequestError as e:
            logger.exception("Request failed for user %s", username)
            return {"error": "A network error occurred while fetching GitHub data"}
        except Exception as e:
            logger.exception("Unexpected error in fetch_user_profile for user %s", username)
            return {"error": "An unexpected error occurred"}

    @staticmethod
    async def social_accounts(username):
        """Fetch social accounts of the user from GitHub API.
        If the API returns a 404, it attempts to extract social links from the user's README.md.

        Returns:
            list: A list of dictionaries, each representing a social account.
        """
        try:
            base_url = f"https://api.github.com/users/{username}/social_accounts"
            async with httpx.AsyncClient() as client:
                user_response = await client.get(
                    base_url,
                    headers={
                        "Accept": "application/vnd.github.v3+json",
                        "Authorization": f"token {Settings.get_github_token()}",
                    }
                )
                user_response.raise_for_status()
                return user_response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return await GitHubProfileFetcher.get_social_from_readme(username)
            return []
        except Exception as e:
            logger.exception("Unexpected error in social_accounts for user %s", username)
            return []

    @staticmethod
    async def get_social_from_readme(username):
        """Extract LinkedIn link from user's README.md (simplified - only LinkedIn for reliability)"""
        try:
            readme_url = f"https://api.github.com/repos/{username}/{username}/readme"
            async with httpx.AsyncClient() as client:
                readme_response = await client.get(
                    readme_url,
                    headers={
                        "Accept": "application/vnd.github.v3+json",
                        "Authorization": f"token {Settings.get_github_token()}",
                    }
                )
                readme_response.raise_for_status()
                readme_content = base64.b64decode(readme_response.json()['content']).decode('utf-8')

            social_accounts_list = []
            linkedin_match = re.search(r'linkedin\.com/in/([a-zA-Z0-9-]+)', readme_content, re.I)
            if linkedin_match:
                social_accounts_list.append({
                    "provider": "linkedin",
                    "url": f"https://linkedin.com/in/{linkedin_match.group(1)}"
                })
            return social_accounts_list
        except Exception as e:
            logger.exception("Unexpected error in get_social_from_readme for user %s", username)
            return []
