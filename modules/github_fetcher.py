from collections import Counter
from datetime import datetime, timedelta
import requests
import re
import httpx
from config.settings import Settings
from modules.github_projects import GitHubProjectRanker


class GitHubProfileFetcher:
    """Fetch comprehensive GitHub user profile data"""

    @staticmethod
    def _validate_username_pattern(username: str) -> bool:
        """
        Validate GitHub username pattern:
        - Must be 1-39 characters long
        - Can only contain alphanumeric characters and hyphens
        - Cannot start or end with a hyphen
        - Cannot have consecutive hyphens
        """
        pattern = r'^[a-zA-Z0-9][-a-zA-Z0-9]*[a-zA-Z0-9]$'
        return (isinstance(username, str) and 
                re.match(pattern, username) and 
                len(username) <= 39 and 
                '--' not in username)

    @staticmethod
    def _get_github_headers() -> dict:
        """Get standard GitHub API headers"""
        return {
            "Accept": "application/vnd.github.v3+json",
            "Authorization": f"token {Settings.get_github_token()}"
        }

    @staticmethod
    async def validate_github_username(username: str) -> bool:
        """
        Async validate GitHub username including API check:
        - Validates username pattern
        - Verifies user exists on GitHub
        - Confirms account is of type 'User' (not Organization)
        """
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
    def validate_github_username_sync(username: str) -> bool:
        """
        Sync validate GitHub username including API check:
        - Validates username pattern
        - Verifies user exists on GitHub
        - Confirms account is of type 'User' (not Organization)
        """
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
            return True  # Fall back to pattern validation on API error

    @staticmethod
    def fetch_user_profile(username):
        """
        Fetch detailed GitHub user profile with extended metrics and reduced API calls

        Args:
            username (str): GitHub username

        Returns:
            dict: Comprehensive user profile data
        """
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
                        followers {{
                          totalCount
                        }}
                        following {{
                          totalCount
                        }}
                        repository(name: "{username}") {{
                          object(expression: "HEAD:README.md") {{
                            ... on Blob {{
                              text
                            }}
                          }}
                          defaultBranchRef {{
                            name
                          }}
                        }}
                        repositories(first: 100, orderBy: {{field: UPDATED_AT, direction: DESC}}) {{
                          totalCount
                          nodes {{
                            name
                            description
                            stargazerCount
                            primaryLanguage {{
                              name
                            }}
                            url
                            updatedAt
                          }}
                        }}
                        contributionsCollection(from: "{one_year_ago}") {{
                          contributionCalendar {{
                            totalContributions
                          }}
                          pullRequestContributionsByRepository {{
                            repository {{
                              name
                            }}
                            contributions(first: 100) {{
                              totalCount
                            }}
                          }}
                          issueContributionsByRepository {{
                            repository {{
                              name
                            }}
                            contributions(first: 100) {{
                              totalCount
                            }}
                          }}
                        }}
                        pullRequests(first: 100, states: MERGED, orderBy: {{field: UPDATED_AT, direction: DESC}}) {{
                           nodes {{
                          createdAt
                          }}
                          totalCount
                        }}
                        issues(last: 100, states: CLOSED) {{
                          totalCount
                          nodes {{
                            createdAt
                            }}
                        }}
                        repositoriesContributedTo(first: 100, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {{
                          totalCount
                          nodes {{
                            name
                          }}
                        }}
                      }}
                    }}
                """
            }

            graphql_url = "https://api.github.com/graphql"
            graphql_response = requests.post(
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
                1 for pr in graphql_data['pullRequests']['nodes'] if pr and datetime.strptime(pr['createdAt'], '%Y-%m-%dT%H:%M:%SZ') > datetime.now() - timedelta(days=365)
            )
            issues_closed_last_year = sum(
                1 for issue in graphql_data['issues']['nodes'] if issue and datetime.strptime(issue['createdAt'], '%Y-%m-%dT%H:%M:%SZ') > datetime.now() - timedelta(days=365)
            )
            # featured = GitHubProjectRanker().get_featured(username)
            return {
                'username': username,
                'name': graphql_data.get('name') or username,
                'bio': graphql_data.get('bio', ''),
                'location': graphql_data.get('location', ''),
                'avatar_url': graphql_data.get('avatarUrl', ''),
                'profile_url': graphql_data.get('url', ''),
                # 'top_languages': featured['top_languages'],
                # 'top_projects': featured['top_projects'],
                'followers': graphql_data['followers']['totalCount'],
                'following': graphql_data['following']['totalCount'],
                'public_repos': graphql_data['repositories']['totalCount'],
                'pull_requests_merged': pr_merged_last_year if pr_merged_last_year < 100 else f"{100}+",
                'issues_closed': issues_closed_last_year if issues_closed_last_year < 100 else f"{100}+",
                'achievements': {
                    'total_contributions': graphql_data['contributionsCollection']['contributionCalendar']['totalContributions'],
                    'repositories_contributed_to': graphql_data['repositoriesContributedTo']['totalCount'],
                },
                'social_accounts': GitHubProfileFetcher.social_accounts(username),
                'readme_content' :( graphql_data.get('repository', {}).get('object', {}).get('text', '') 
                                  if ( graphql_data.get('repository') and graphql_data.get('repository', {}).get('object') ) else '' )    # empty string if falsy values
            }

        except requests.exceptions.HTTPError as e:
            return {"error": f"HTTP Error: {e.response.status_code} - {e.response.reason}"}
        except requests.exceptions.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}
        except Exception as e:
            return {"error": f"An unexpected error occurred: {str(e)}"}


    @staticmethod
    def social_accounts(username):
        """
        Fetch social accounts of the user

        Args:
            username (str): GitHub username

        Returns:
            dict: Social accounts of the user
        """
        try:
            base_url = f"https://api.github.com/users/{username}/social_accounts"

            user_response = requests.get(
                base_url,
                headers={
                    "Accept": "application/vnd.github.v3+json",
                    "Authorization": f"token {Settings.get_github_token()}",
                }
            )
            user_response.raise_for_status()
            return user_response.json()

        except requests.exceptions.HTTPError as e:
            return {"error": f"HTTP Error: {e.response.status_code} - {e.response.reason}"}
        except requests.exceptions.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}
        except Exception as e:
            return {"error": f"An unexpected error occurred: {str(e)}"}
