import base64
import difflib
import re
from datetime import datetime, timedelta

import httpx
import requests

from config.settings import Settings


class GitHubProfileFetcher:
    """Fetch comprehensive GitHub user profile data"""

    @staticmethod
    def _validate_username_pattern(username: str) -> bool:
        if not isinstance(username, str) or not username:
            return False
        pattern = r'^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$'
        return bool(re.match(pattern, username))

    @staticmethod
    def _get_github_headers() -> dict:
        return {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"token {Settings.get_github_token()}"
        }

    @staticmethod
    async def validate_github_username(username: str) -> bool:
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
                return True

    @staticmethod
    def validate_github_username_sync(username: str) -> bool:
        if not GitHubProfileFetcher._validate_username_pattern(username):
            return False
        try:
            response = requests.get(
                f'https://api.github.com/users/{username}',
                headers=GitHubProfileFetcher._get_github_headers()
            )
            if response.status_code != 200:
                return False
            data = response.json()
            return data.get('type') == 'User'
        except requests.RequestException:
            return True

    @staticmethod
    async def fetch_user_profile(username):
        try:
            if not GitHubProfileFetcher.validate_github_username_sync(username):
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

            graphql_url = "https://api.github.com/graphql"
            async with httpx.AsyncClient() as client:
                graphql_response = await client.post(
                    graphql_url,
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
                1 for pr in graphql_data['pullRequests']['nodes'] if
                pr and datetime.strptime(pr['createdAt'], '%Y-%m-%dT%H:%M:%SZ') > datetime.now() - timedelta(days=365)
            )
            issues_closed_last_year = sum(
                1 for issue in graphql_data['issues']['nodes'] if
                issue and datetime.strptime(issue['createdAt'], '%Y-%m-%dT%H:%M:%SZ') > datetime.now() - timedelta(days=365)
            )

            return {
                'username': username,
                'name': graphql_data.get('name') or username,
                'bio': graphql_data.get('bio', ''),
                'location': graphql_data.get('location', ''),
                'avatar_url': graphql_data.get('avatarUrl', ''),
                'profile_url': graphql_data.get('url', ''),
                'followers': graphql_data['followers']['totalCount'],
                'following': graphql_data['following']['totalCount'],
                'public_repos': graphql_data['repositories']['totalCount'],
                'pull_requests_merged': pr_merged_last_year if pr_merged_last_year < 100 else f"{100}+",
                'issues_closed': issues_closed_last_year if issues_closed_last_year < 100 else f"{100}+",
                'achievements': {
                    'total_contributions': graphql_data['contributionsCollection']['contributionCalendar']['totalContributions'],
                    'repositories_contributed_to': graphql_data['repositoriesContributedTo']['totalCount'],
                },
                'social_accounts': await GitHubProfileFetcher.social_accounts(username),
                'readme_content': (graphql_data.get('repository', {}).get('object', {}).get('text', '')
                                   if (graphql_data.get('repository') and graphql_data.get('repository', {}).get('object')) else '')
            }

        except httpx.HTTPStatusError as e:
            return {"error": f"HTTP Error: {e.response.status_code}"}
        except httpx.RequestError as e:
            return {"error": f"Request failed: {str(e)}"}
        except Exception:
            return {"error": "An unexpected error occurred"}

    @staticmethod
    async def social_accounts(username):
        social_accounts = []
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
                social_accounts = user_response.json()
            return social_accounts
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                return await GitHubProfileFetcher.get_social_from_readme(username)
            return []
        except Exception:
            return []

    @staticmethod
    async def get_social_from_readme(username):
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
                social_accounts_list.append({"provider": "linkedin", "url": f"https://linkedin.com/in/{linkedin_match.group(1)}"})
            return social_accounts_list
        except Exception:
            return {}
