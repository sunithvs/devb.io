from collections import Counter
from datetime import datetime, timedelta

import requests

from config.settings import Settings


class GitHubProfileFetcher:
    """Fetch comprehensive GitHub user profile data"""

    @staticmethod
    def fetch_user_profile(username):
        """
        Fetch detailed GitHub user profile with extended metrics and reduced API calls

        Args:
            username (str): GitHub username

        Returns:
            dict: Comprehensive user profile data
        """

        one_year_ago = (datetime.now() - timedelta(days=365)).isoformat() + 'Z'

        graphql_query = {
            "query": f"""
                query {{
                  user(login: "{username}") {{
                    # Basic user information
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

                    # Contributions and achievements
                    contributionsCollection(from: "{one_year_ago}") {{
                      contributionCalendar {{
                        totalContributions
                      }}
                      # These fields will help filter issues and repositories
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

                    # Pull Requests and Issues
                    pullRequests(first: 0, states: MERGED, orderBy: {{field: UPDATED_AT, direction: DESC}}) {{
                      totalCount
                    }}

                    issues(first: 0, states: CLOSED) {{
                      totalCount
                    }}

                    # Starred Repositories
                    starredRepositories(first: 10, orderBy: {{field: STARRED_AT, direction: DESC}}) {{
                      nodes {{
                        name
                        description
                        url
                      }}
                    }}

                    # Sponsorships
                    sponsors {{
                      totalCount
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

        # Single GraphQL request to fetch most of the data
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
        graphql_data = graphql_response.json()['data']['user']

        # Process languages and top projects
        languages = Counter()
        top_projects = []
        for repo in graphql_data['repositories']['nodes']:
            if repo['primaryLanguage']:
                languages[repo['primaryLanguage']['name']] += 1
            top_projects.append({
                'name': repo['name'],
                'description': repo.get('description', ''),
                'stars': repo['stargazerCount'],
                'url': repo['url'],
                'language': repo['primaryLanguage']['name'] if repo['primaryLanguage'] else 'Unknown',
                'updatedAt':repo['updatedAt']
            })

        # Sort top projects by star count
        top_projects = sorted(top_projects, key=lambda x: datetime.strptime(x['updatedAt'],'%Y-%m-%dT%H:%M:%SZ'), reverse=True)[:10]

        return {
            'username': username,
            'name': graphql_data.get('name', username) or username,
            'bio': graphql_data.get('bio', ''),
            'location': graphql_data.get('location', ''),
            'avatar_url': graphql_data.get('avatarUrl', ''),
            'profile_url': graphql_data.get('url', ''),
            'top_languages': languages.most_common(3),
            'top_projects': top_projects,
            'followers': graphql_data['followers']['totalCount'],
            'following': graphql_data['following']['totalCount'],
            'public_repos': graphql_data['repositories']['totalCount'],

            # Metrics from GraphQL data
            'pull_requests_merged': graphql_data['pullRequests']['totalCount'],
            'issues_closed': graphql_data['issues']['totalCount'],
            'starred_repos': {
                'count': 10,  # Limited to first 10 in query
                'repositories': [
                    {
                        'name': repo['name'],
                        'description': repo.get('description', ''),
                        'url': repo['url']
                    } for repo in graphql_data['starredRepositories']['nodes']
                ]
            },
            'achievements': {
                'total_contributions': graphql_data['contributionsCollection']['contributionCalendar'][
                    'totalContributions'],
                'repositories_contributed_to': graphql_data['repositoriesContributedTo']['totalCount'],
                'sponsors': graphql_data['sponsors']['totalCount']
            },
            'social_accounts': GitHubProfileFetcher.social_accounts(username)
        }

    @staticmethod
    def fetch_user_profile_rest(username):
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
                "Authorization": f"token {Settings.get_github_token()}",
            }
        )
        user_response.raise_for_status()
        user_data = user_response.json()

        # Fetch repositories
        repos_response = requests.get(
            user_data['repos_url'],
            headers={
                "Accept": "application/vnd.github.v3+json",
                "Authorization": f"token {Settings.get_github_token()}",
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
        recent_projects.sort(key=lambda x: datetime.strptime(x['updated_at'], '%Y-%m-%dT%H:%M:%SZ'), reverse=True)

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

    @staticmethod
    def social_accounts(username):
        """
        Fetch social accounts of the user

        Args:
            username (str): GitHub username

        Returns:
            dict: Social accounts of the user
        """
        base_url = f"https://api.github.com/users/{username}/social_accounts"

        # Fetch user details
        user_response = requests.get(
            base_url,
            headers={
                "Accept": "application/vnd.github.v3+json",
                "Authorization": f"token {Settings.get_github_token()}",
            }
        )
        user_response.raise_for_status()
        user_data = user_response.json()

        return user_data
