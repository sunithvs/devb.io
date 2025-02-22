from collections import Counter
from datetime import datetime

import numpy as np
import requests

from config.settings import Settings


class GitHubProjectRanker:
    def __init__(self):
        """
        Initialize the GitHub Project Ranker

        """
        github_token = Settings.get_github_token()
        self.headers = {
            'Accept': 'application/vnd.github.v3+json'
        }
        if github_token:
            self.headers['Authorization'] = f'token {github_token}'

    def fetch_user_repos(self, username):
        """
        Fetch all repositories for a given user

        :param username: GitHub username
        :return: List of repository dictionaries
        """
        url = f'https://api.github.com/users/{username}/repos'
        repos = []
        page = 1

        while True:
            params = {'page': page, 'per_page': 100}
            response = requests.get(url, headers=self.headers, params=params)

            if response.status_code != 200:
                print(f"Error fetching repositories: {response.status_code}")
                break

            page_repos = response.json()
            if not page_repos:
                break

            repos.extend(page_repos)
            page += 1

        return repos

    def fetch_pinned_repos(self, username):
        """
        Fetch pinned repositories for a user using the GraphQL API

        :param username: GitHub username
        :return: List of pinned repository names
        """
        url = 'https://api.github.com/graphql'
        query = """
        query($username: String!) {
          user(login: $username) {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository {
                  name
                }
              }
            }
          }
        }
        """

        variables = {'username': username}

        response = requests.post(
            url,
            headers=self.headers,
            json={'query': query, 'variables': variables}
        )

        if response.status_code != 200:
            print(f"Error fetching pinned repos: {response.status_code}")
            return []

        data = response.json()
        try:
            pinned_items = data['data']['user']['pinnedItems']['nodes']
            return [item['name'] for item in pinned_items]
        except (KeyError, TypeError):
            return []

    def calculate_project_score(self, repo, pinned_repos):
        """
        Calculate a comprehensive score for a repository

        :param repo: Repository dictionary
        :param pinned_repos: List of pinned repository names
        :return: Numerical score
        """
        # Base metrics
        stars = repo.get('stargazers_count', 0)
        forks = repo.get('forks_count', 0)

        # Recency calculation
        try:
            created_at = datetime.strptime(repo.get('created_at', ''), "%Y-%m-%dT%H:%M:%S.%fZ")
        except ValueError:
            try:
                created_at = datetime.strptime(repo.get('created_at', ''), "%Y-%m-%dT%H:%M:%SZ")
            except ValueError:
                created_at = datetime.now()

        try:
            updated_at = datetime.strptime(repo.get('updated_at', ''), "%Y-%m-%dT%H:%M:%S.%fZ")
        except ValueError:
            try:
                updated_at = datetime.strptime(repo.get('updated_at', ''), "%Y-%m-%dT%H:%M:%SZ")
            except ValueError:
                updated_at = datetime.now()

        days_since_creation = (datetime.now() - created_at).days
        days_since_update = (datetime.now() - updated_at).days

        # Weighting factors
        star_weight = 2.0
        fork_weight = 1.5
        recency_weight = 1.0
        pinned_weight = 10

        # Normalized scoring
        star_score = np.log1p(stars) * star_weight
        fork_score = np.log1p(forks) * fork_weight

        # Recency bonus/penalty
        if days_since_update <= 365:
            recency_bonus = 1.5
        elif days_since_update <= 730:
            recency_bonus = 1.0
        else:
            recency_bonus = 0.5

        # Pinned repository bonus
        pinned_bonus = pinned_weight if repo['name'] in pinned_repos else 0

        # Total score calculation
        total_score = (
                star_score +
                fork_score +
                recency_weight * recency_bonus * (1 / np.log1p(days_since_creation)) +
                pinned_bonus
        )

        return total_score

    def get_featured(self, username, top_n=8):
        """
        Get top featured projects for a user

        :param username: GitHub username
        :param top_n: Number of top projects to return
        :return: List of top projects with details
        """
        # Fetch repositories and pinned repos
        repos = self.fetch_user_repos(username)
        pinned_repos = self.fetch_pinned_repos(username)
        print(pinned_repos)
        top_languages = self.get_top_languages(repos)

        # Calculate scores
        scored_repos = []
        for repo in repos:
            # Skip forks and archived repositories
            if repo.get('fork') or repo.get('archived'):
                continue

            score = self.calculate_project_score(repo, pinned_repos)
            scored_repos.append({
                'name': repo['name'],
                'description': repo.get('description', 'No description'),
                'score': score,
                'stars': repo.get('stargazers_count', 0),
                'forks': repo.get('forks_count', 0),
                'language': repo.get('language', 'Unknown'),
                'url': repo.get('html_url', ''),
                'updatedAt': repo.get('updated_at', ''),
                'isPinned': repo['name'] in pinned_repos,
                'homepage': repo.get('homepage', '')
            })

        # Sort and select top projects
        featured_projects = sorted(
            scored_repos,
            key=lambda x: x['score'],
            reverse=True
        )[:top_n]

        return {
            "top_projects": featured_projects,
            "top_languages": top_languages
        }

    def get_top_languages(self, repos, top_n=3):
        """
        Get top languages ranked by usage frequency and complexity across repositories

        :param repos: List of repository dictionaries
        :param top_n: Number of top languages to return
        :return: List of [language, count] pairs
        """
        # Language Complexity and Rarity Scoring Dictionary
        LANGUAGE_COMPLEXITY = {
            # Systems Programming Languages
            'Rust': 9.5,
            'C': 8.5,
            'C++': 8.0,

            # Advanced High-Level Languages
            'Haskell': 9.0,
            'Scala': 8.5,
            'Go': 8.0,

            # Data Science and Scientific Computing
            'Julia': 8.5,
            'R': 7.5,

            # Web and Modern Languages
            'TypeScript': 7.5,
            'Kotlin': 7.5,
            'Swift': 7.0,

            # Scripting and Dynamic Languages
            'Python': 6.5,
            'Ruby': 6.0,
            'JavaScript': 5.5,

            # Less Common Languages
            'Erlang': 9.0,
            'Clojure': 8.5,
            'Elixir': 8.0,

            # Niche Languages
            'Elm': 7.5,
            'Crystal': 7.0,
            'Nim': 7.0,

            # Default for unknown or very common languages
            'Unknown': 3.0,
            'HTML': 3.0,
            'CSS': 3.0,
            'Shell': 4.0
        }

        # Count languages
        language_counter = Counter()
        for repo in repos:
            # Skip forks and archived repositories
            if repo.get('fork') or repo.get('archived'):
                continue

            # Replace None with 'Unknown' and handle empty strings
            language = repo.get('language')
            if not language:  # This handles both None and empty string
                language = 'Unknown'

            language_counter[language] += 1

        # Calculate total repositories and language distribution
        total_repos = sum(language_counter.values())

        # Guard against empty repository list
        if total_repos == 0:
            return []

        # Scoring languages based on complexity and usage
        scored_languages = []
        for language, count in language_counter.items():
            # Base complexity score
            complexity_score = LANGUAGE_COMPLEXITY.get(language, 5.0)

            # Usage factor: More frequently used languages get higher scores
            usage_factor = np.sqrt(count / total_repos) * 10

            # Combine metrics with higher weight on usage
            total_score = (
                    complexity_score * 0.6 +  # Reduced complexity weight
                    usage_factor * 0.4  # Increased usage weight
            )
            if language != 'Unknown':
                scored_languages.append({
                    'language': language,
                    'count': count,
                    'total_score': total_score
                })

        # Sort by total score in descending order
        ranked_languages = sorted(
            scored_languages,
            key=lambda x: x['total_score'],
            reverse=True
        )[:top_n]

        # Return list of [language, count] pairs
        return [[lang['language'], lang['count']] for lang in ranked_languages]
