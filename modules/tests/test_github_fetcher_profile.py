import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
from modules.github_fetcher import GitHubProfileFetcher

class TestFetchUserProfile:
    @pytest.fixture
    def mock_validate_username(self):
        with patch.object(GitHubProfileFetcher, 'validate_github_username_sync', return_value=True):
            yield

    @pytest.fixture
    def mock_graphql_response(self):
        def create_mock_response():
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "data": {
                    "user": {
                        "name": "Sunith VS",
                        "bio": "Backend Developer",
                        "location": "Kerala, India",
                        "avatarUrl": "https://example.com/avatar.jpg",
                        "url": "https://github.com/sunithvs",
                        "followers": {"totalCount": 100},
                        "following": {"totalCount": 50},
                        "repositories": {
                            "totalCount": 30,
                            "nodes": [
                                {
                                    "name": "project1",
                                    "description": "Test project",
                                    "stargazerCount": 10,
                                    "primaryLanguage": {"name": "Python"},
                                    "url": "https://github.com/sunithvs/project1",
                                    "updatedAt": "2024-01-01T00:00:00Z"
                                }
                            ]
                        },
                        "contributionsCollection": {
                            "contributionCalendar": {
                                "totalContributions": 500
                            },
                            "pullRequestContributionsByRepository": [],
                            "issueContributionsByRepository": []
                        },
                        "pullRequests": {
                            "nodes": [
                                {"createdAt": (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%dT%H:%M:%SZ")}
                            ],
                            "totalCount": 20
                        },
                        "issues": {
                            "totalCount": 15,
                            "nodes": [
                                {"createdAt": (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%dT%H:%M:%SZ")}
                            ]
                        },
                        "repositoriesContributedTo": {
                            "totalCount": 10,
                            "nodes": [{"name": "contrib1"}]
                        },
                        "repository": {
                            "object": {
                                "text": "# README content"
                            },
                            "defaultBranchRef": {
                                "name": "main"
                            }
                        }
                    }
                }
            }
            return mock_response
        return create_mock_response

    @pytest.fixture
    def mock_social_accounts(self):
        with patch.object(GitHubProfileFetcher, 'social_accounts', return_value=[
            {"provider": "linkedin", "url": "https://linkedin.com/in/sunithvs"}
        ]):
            yield

    def test_fetch_user_profile_success(self, mock_validate_username, mock_graphql_response, mock_social_accounts):
        with patch('requests.post', return_value=mock_graphql_response()):
            result = GitHubProfileFetcher.fetch_user_profile("sunithvs")
            
            assert result["username"] == "sunithvs"
            assert result["name"] == "Sunith VS"
            assert result["bio"] == "Backend Developer"
            assert result["location"] == "Kerala, India"
            assert result["avatar_url"] == "https://example.com/avatar.jpg"
            assert result["followers"] == 100
            assert result["following"] == 50
            assert result["public_repos"] == 30
            assert result["achievements"]["total_contributions"] == 500
            assert len(result["social_accounts"]) == 1
            assert result["readme_content"] == "# README content"

    def test_fetch_user_profile_invalid_username(self, mock_validate_username):
        with patch.object(GitHubProfileFetcher, 'validate_github_username_sync', return_value=False):
            result = GitHubProfileFetcher.fetch_user_profile("invalid-user")
            assert "error" in result
            assert "Invalid GitHub username" in result["error"]

    def test_fetch_user_profile_api_error(self, mock_validate_username, mock_graphql_response):
        with patch('requests.post') as mock_post:
            mock_post.side_effect = Exception("API Error")
            result = GitHubProfileFetcher.fetch_user_profile("sunithvs")
            assert "error" in result
            assert "An unexpected error occurred" in result["error"]

    def test_fetch_user_profile_empty_response(self, mock_validate_username):
        with patch('requests.post') as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"data": {}}
            mock_post.return_value = mock_response
            
            result = GitHubProfileFetcher.fetch_user_profile("sunithvs")
            assert "error" in result
            assert "User 'sunithvs' not found" in result["error"]

    def test_fetch_user_profile_rate_limit(self, mock_validate_username):
        with patch('requests.post') as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 403
            mock_response.reason = "Rate limit exceeded"
            mock_post.side_effect = Exception("Rate limit exceeded")
            
            result = GitHubProfileFetcher.fetch_user_profile("sunithvs")
            assert "error" in result
            assert "An unexpected error occurred" in result["error"]

    @pytest.mark.parametrize("pr_count,expected", [
        (50, 50),
        (150, "100+")
    ])
    def test_fetch_user_profile_pr_count_formatting(self, mock_validate_username, mock_graphql_response, pr_count, expected):
        mock_response = mock_graphql_response()
        prs = [{"createdAt": (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%dT%H:%M:%SZ")} for _ in range(pr_count)]
        mock_response.json.return_value["data"]["user"]["pullRequests"]["nodes"] = prs
        
        with patch('requests.post', return_value=mock_response):
            result = GitHubProfileFetcher.fetch_user_profile("sunithvs")
            assert result["pull_requests_merged"] == expected
