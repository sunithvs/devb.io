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
                return False   # API failed → treat as invalid (safer)

    @staticmethod
    async def fetch_user_profile(username: str) -> dict:
        """Fetch detailed GitHub user profile with extended metrics"""
        try:
            if not await GitHubProfileFetcher.validate_github_username(username):
                raise ValueError(f"Invalid GitHub username: '{username}'")

            one_year_ago_dt = datetime.utcnow() - timedelta(days=365)
            one_year_ago = one_year_ago_dt.isoformat() + 'Z'

            graphql_query = {
                "query": f"""
                    query {{
                      user(login: "{username}") {{
                        name bio location avatarUrl url
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
                resp = await client.post(
                    "https://api.github.com/graphql",
                    headers={"Authorization": f"Bearer {Settings.get_github_token()}", "Content-Type": "application/json"},
                    json=graphql_query
                )
                resp.raise_for_status()

            graphql_data = resp.json().get('data', {}).get('user', {})
            if not graphql_data:
                raise ValueError(f"User '{username}' not found")

            pr_merged = sum(1 for pr in graphql_data.get('pullRequests', {}).get('nodes', []) if pr and datetime.strptime(pr['createdAt'], '%Y-%m-%dT%H:%M:%SZ') > one_year_ago_dt)
            issues_closed = sum(1 for issue in graphql_data.get('issues', {}).get('nodes', []) if issue and datetime.strptime(issue['createdAt'], '%Y-%m-%dT%H:%M:%SZ') > one_year_ago_dt)

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
                'pull_requests_merged': pr_merged if pr_merged < 100 else f"{100}+",
                'issues_closed': issues_closed if issues_closed < 100 else f"{100}+",
                'achievements': {
                    'total_contributions': graphql_data.get('contributionsCollection', {}).get('contributionCalendar', {}).get('totalContributions', 0),
                    'repositories_contributed_to': graphql_data.get('repositoriesContributedTo', {}).get('totalCount', 0),
                },
                'social_accounts': await GitHubProfileFetcher.social_accounts(username),
                'readme_content': graphql_data.get('repository', {}).get('object', {}).get('text', '')
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
    async def social_accounts(username) -> list:
        """Fetch social accounts. Always returns list (empty on error)."""
        try:
            base_url = f"https://api.github.com/users/{username}/social_accounts"
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    base_url,
                    headers={
                        "Accept": "application/vnd.github.v3+json",
                        "Authorization": f"token {Settings.get_github_token()}"
                    }
                )
                resp.raise_for_status()
                return resp.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return await GitHubProfileFetcher.get_social_from_readme(username)
            logger.warning("HTTP error fetching social accounts for %s: %s", username, e)
            return []
        except Exception as e:
            logger.exception("Unexpected error in social_accounts for user %s", username)
            return []

    @staticmethod
    async def get_social_from_readme(username) -> list:
        """Extract LinkedIn link from README (simplified for reliability)"""
        try:
            url = f"https://api.github.com/repos/{username}/{username}/readme"
            async with httpx.AsyncClient() as client:
                r = await client.get(
                    url,
                    headers={
                        "Accept": "application/vnd.github.v3+json",
                        "Authorization": f"token {Settings.get_github_token()}"
                    }
                )
                r.raise_for_status()
                content = base64.b64decode(r.json()['content']).decode('utf-8')
            match = re.search(r'linkedin\.com/in/([a-zA-Z0-9-]+)', content, re.I)
            return [{"provider": "linkedin", "url": f"https://linkedin.com/in/{match.group(1)}"}] if match else []
        except Exception as e:
            logger.exception("Unexpected error in get_social_from_readme for user %s", username)
            return []
