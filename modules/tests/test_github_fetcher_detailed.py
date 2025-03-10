import pytest
import base64
from unittest.mock import patch, MagicMock, AsyncMock
from datetime import datetime, timedelta
from modules.github_fetcher import GitHubProfileFetcher

class TestValidateUsernamePattern:
    @pytest.mark.parametrize("username, expected", [
        ("sunithvs", True),  # Valid username
        ("user-name", True),  # Valid with hyphen
        ("a", True),  # Single character
        ("user123", True),  # Alphanumeric
        ("", False),  # Empty string
        ("a" * 40, False),  # Too long
        ("-invalid", False),  # Starts with hyphen
        ("invalid-", False),  # Ends with hyphen
        ("inv--alid", False),  # Consecutive hyphens
        ("user@name", False),  # Invalid character
        ("user name", False),  # Contains space
        ("User_Name", False),  # Contains underscore
    ])
    def test_validate_username_pattern(self, username, expected):
        assert GitHubProfileFetcher._validate_username_pattern(username) is expected

class TestGetGithubHeaders:
    def test_get_github_headers(self):
        with patch('config.settings.Settings.get_github_token', return_value='test-token'):
            headers = GitHubProfileFetcher._get_github_headers()
            assert headers == {
                "Accept": "application/vnd.github.v3+json",
                "Authorization": "token test-token"
            }

class TestFindBestMatch:
    @pytest.mark.parametrize("content, username, patterns, expected", [
        (
            "Check my LinkedIn: https://linkedin.com/in/sunithvs",
            "sunithvs",
            [r'https?://(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)/?'],
            "https://linkedin.com/in/sunithvs"
        ),
        (
            "Visit medium.com/@sunithvs for my articles",
            "sunithvs",
            [r'(?:https?://)?(?:www\.)?medium\.com/@([a-zA-Z0-9_-]+)/?'],
            "https://medium.com/@sunithvs"
        ),
        (
            "No matches here",
            "sunithvs",
            [r'linkedin\.com/in/([a-zA-Z0-9_-]+)/?'],
            None
        ),
        (
            "Multiple matches: linkedin.com/in/sunithvs linkedin.com/in/other",
            "sunithvs",
            [r'(?:https?://)?(?:www\.)?linkedin\.com/in/([a-zA-Z0-9_-]+)/?'],
            "https://linkedin.com/in/sunithvs"
        ),
    ])
    def test_find_best_match(self, content, username, patterns, expected):
        result = GitHubProfileFetcher.find_best_match(content, username, patterns)
        assert result == expected

class TestCalculateSimilarity:
    @pytest.mark.parametrize("str1, str2, expected_range", [
        ("sunithvs", "sunithvs", (1.0, 1.0)),  # Exact match
        ("sunithvs", "sunith", (0.7, 0.9)),    # Partial match
        ("sunithvs", "different", (0.0, 0.3)),  # Different strings
        ("", "", (1.0, 1.0)),                   # Empty strings
        ("a", "b", (0.0, 0.0)),                 # Single different chars
    ])
    def test_calculate_similarity(self, str1, str2, expected_range):
        similarity = GitHubProfileFetcher.calculate_similarity(str1, str2)
        assert expected_range[0] <= similarity <= expected_range[1]

class TestSocialAccounts:
    @pytest.fixture
    def mock_responses(self):
        with patch('requests.get') as mock_get:
            def side_effect(url, headers=None):
                if 'social_accounts' in url:
                    mock_response = MagicMock()
                    mock_response.status_code = 200
                    mock_response.json.return_value = [
                        {"provider": "linkedin", "url": "https://linkedin.com/in/sunithvs"}
                    ]
                    return mock_response
                elif 'readme' in url:
                    mock_response = MagicMock()
                    mock_response.status_code = 200
                    mock_response.json.return_value = {
                        "content": base64.b64encode(b"Check my Medium: https://medium.com/@sunithvs").decode()
                    }
                    return mock_response
                
            mock_get.side_effect = side_effect
            yield mock_get

    def test_social_accounts_success(self, mock_responses):
        result = GitHubProfileFetcher.social_accounts("sunithvs")
        assert len(result) >= 1
        assert any(account["provider"] == "linkedin" for account in result)

    def test_social_accounts_api_failure(self, mock_responses):
        with patch('requests.get') as mock_get:
            mock_get.side_effect = Exception("API Error")
            result = GitHubProfileFetcher.social_accounts("sunithvs")
            assert isinstance(result, dict)
            assert "error" in result

class TestGetSocialFromReadme:
    @pytest.fixture
    def mock_readme_response(self):
        with patch('requests.get') as mock_get:
            mock_response = MagicMock()
            mock_response.status_code = 200
            content = """
            # About Me
            Connect with me on [LinkedIn](https://linkedin.com/in/sunithvs)
            Read my articles on [Medium](https://medium.com/@sunithvs)
            """
            mock_response.json.return_value = {
                "content": base64.b64encode(content.encode()).decode()
            }
            mock_get.return_value = mock_response
            yield mock_get

    def test_get_social_from_readme_success(self, mock_readme_response):
        result = GitHubProfileFetcher.get_social_from_readme("sunithvs")
        assert "linkedin" in result
        assert "medium" in result
        assert "linkedin.com/in/sunithvs" in result["linkedin"]
        assert "medium.com/@sunithvs" in result["medium"]

    def test_get_social_from_readme_no_links(self):
        with patch('requests.get') as mock_get:
            mock_response = MagicMock()
            mock_response.status_code = 200
            content = "# About Me\nNo social links here"
            mock_response.json.return_value = {
                "content": base64.b64encode(content.encode()).decode()
            }
            mock_get.return_value = mock_response
            
            result = GitHubProfileFetcher.get_social_from_readme("sunithvs")
            assert result == {}
