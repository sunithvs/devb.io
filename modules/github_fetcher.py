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
        """
        Validate GitHub username pattern:
        - Must be 1-39 characters long
        - Can only contain alphanumeric characters and hyphens
        - Cannot start or end with a hyphen
        - Cannot have consecutive hyphens
        """
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
                1 for pr in graphql_data['pullRequests']['nodes'] if
                pr and datetime.strptime(pr['createdAt'], '%Y-%m-%dT%H:%M:%SZ') > datetime.now() - timedelta(days=365)
            )
            issues_closed_last_year = sum(
                1 for issue in graphql_data['issues']['nodes'] if
                issue and datetime.strptime(issue['createdAt'], '%Y-%m-%dT%H:%M:%SZ') > datetime.now() - timedelta(
                    days=365)
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
                    'total_contributions': graphql_data['contributionsCollection']['contributionCalendar'][
                        'totalContributions'],
                    'repositories_contributed_to': graphql_data['repositoriesContributedTo']['totalCount'],
                },
                'social_accounts': GitHubProfileFetcher.social_accounts(username),
                'readme_content': (graphql_data.get('repository', {}).get('object', {}).get('text', '')
                                   if (graphql_data.get('repository') and graphql_data.get('repository', {}).get(
                    'object')) else '')  # empty string if falsy values
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
        Fetch social accounts of the user from GitHub API and README.md

        Args:
            username (str): GitHub username

        Returns:
            dict: Social accounts of the user including LinkedIn and Medium
        """
        social_accounts = []

        try:
            # First try the GitHub API
            base_url = f"https://api.github.com/users/{username}/social_accounts"

            user_response = requests.get(
                base_url,
                headers={
                    "Accept": "application/vnd.github.v3+json",
                    "Authorization": f"token {Settings.get_github_token()}",
                }
            )
            user_response.raise_for_status()
            api_accounts = user_response.json()

            # Extract accounts from API response
            for account in api_accounts:
                social_accounts.append(account)

            # Check if we need to look for LinkedIn and Medium in README
            has_linkedin = False
            has_medium = False

            # Check if LinkedIn or Medium is already in the results (accounting for provider variations)
            for account in social_accounts:
                provider = account.get('provider', '').lower()
                url = account.get('url', '').lower()

                if provider == 'linkedin' or 'linkedin.com' in url:
                    has_linkedin = True
                elif provider == 'medium' or 'medium.com' in url:
                    has_medium = True

            # If LinkedIn or Medium not found, check README.md
            if not has_linkedin or not has_medium:
                readme_accounts = GitHubProfileFetcher.get_social_from_readme(username)

                # Add LinkedIn if not already present
                if not has_linkedin and 'linkedin' in readme_accounts:
                    social_accounts.append({
                        'provider': 'linkedin',
                        'url': readme_accounts['linkedin']
                    })

                # Add Medium if not already present
                if not has_medium and 'medium' in readme_accounts:
                    social_accounts.append({
                        'provider': 'generic',
                        'url': readme_accounts['medium']
                    })

            return social_accounts

        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                # If API fails, try README approach
                readme_accounts = GitHubProfileFetcher.get_social_from_readme(username)
                return [{'provider': k, 'url': v} for k, v in readme_accounts.items()]
            return {"error": f"HTTP Error: {e.response.status_code} - {e.response.reason}"}
        except requests.exceptions.RequestException as e:
            return {"error": f"Request failed: {str(e)}"}
        except Exception as e:
            return {"error": f"An unexpected error occurred: {str(e)}"}

    @staticmethod
    def get_social_from_readme(username):
        """
        Extract social media links from a user's GitHub README.md file

        Args:
            username (str): GitHub username

        Returns:
            dict: Social accounts found in README
        """
        try:
            # Get README content
            readme_url = f"https://api.github.com/repos/{username}/{username}/readme"
            readme_response = requests.get(
                readme_url,
                headers={
                    "Accept": "application/vnd.github.v3+json",
                    "Authorization": f"token {Settings.get_github_token()}",
                }
            )
            readme_response.raise_for_status()

            # Decode the content (it's base64 encoded)
            content_encoded = readme_response.json().get('content', '')
            content = base64.b64decode(content_encoded).decode('utf-8')

            # Find social links
            social_links = {
                'linkedin': GitHubProfileFetcher.find_best_match(content, username, [
                    r'https?://(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)/?',
                    r'linkedin\.com/in/([a-zA-Z0-9_-]+)/?'
                ]),
                'medium': GitHubProfileFetcher.find_best_match(content, username, [
                    r'https?://(?:www\.)?medium\.com/@?([a-zA-Z0-9_-]+)/?',
                    r'medium\.com/@?([a-zA-Z0-9_-]+)/?',
                    r'https?://([a-zA-Z0-9_-]+)\.medium\.com/?'  # Pattern for username.medium.com
                ])
            }

            # Filter out None values
            return {k: v for k, v in social_links.items() if v}

        except requests.exceptions.HTTPError as e:
            # Try alternative README locations if first attempt fails
            try:
                # Some users have README in their main profile repository with different names
                alt_readme_url = f"https://api.github.com/repos/{username}/{username}/contents/README.md"
                alt_response = requests.get(
                    alt_readme_url,
                    headers={
                        "Accept": "application/vnd.github.v3+json",
                        "Authorization": f"token {Settings.get_github_token()}",
                    }
                )
                alt_response.raise_for_status()

                content_encoded = alt_response.json().get('content', '')
                content = base64.b64decode(content_encoded).decode('utf-8')

                # Process content same as above
                social_links = {
                    'linkedin': GitHubProfileFetcher.find_best_match(content, username, [
                        r'https?://(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)/?',
                        r'linkedin\.com/in/([a-zA-Z0-9_-]+)/?'
                    ]),
                    'medium': GitHubProfileFetcher.find_best_match(content, username, [
                        r'https?://(?:www\.)?medium\.com/@?([a-zA-Z0-9_-]+)/?',
                        r'medium\.com/@?([a-zA-Z0-9_-]+)/?',
                        r'https?://([a-zA-Z0-9_-]+)\.medium\.com/?'  # Pattern for username.medium.com
                    ])
                }

                return {k: v for k, v in social_links.items() if v}

            except:
                return {}
        except Exception as e:
            return {}

    @staticmethod
    def find_best_match(content, username, patterns):
        """
        Find the best matching URL from the content based on similarity to the username

        Args:
            content (str): README content
            username (str): GitHub username
            patterns (list): List of regex patterns to match

        Returns:
            str: The best matching URL or None if no match
        """
        all_matches = []

        for pattern in patterns:
            # Find all matches for the current pattern
            matches = re.finditer(pattern, content, re.IGNORECASE)
            
            for match in matches:
                # Get the full match and the username group
                full_url = match.group(0)
                handle = match.group(1) if match.groups() else ''
                
                # Clean up the handle and URL
                handle = handle.strip('/@')
                if not full_url.startswith('http'):
                    full_url = 'https://' + full_url.lstrip('/')

                # Calculate similarity score
                similarity = GitHubProfileFetcher.calculate_similarity(username.lower(), handle.lower())
                all_matches.append((full_url, similarity))

        # Sort by similarity score (highest first)
        all_matches.sort(key=lambda x: x[1], reverse=True)

        # Return the best match or None
        return all_matches[0][0] if all_matches else None

    @staticmethod
    def calculate_similarity(str1, str2):
        """
        Calculate similarity between two strings using Levenshtein distance

        Args:
            str1 (str): First string
            str2 (str): Second string

        Returns:
            float: Similarity score between 0 and 1
        """
        # Simple implementation using difflib
        return difflib.SequenceMatcher(None, str1, str2).ratio()
