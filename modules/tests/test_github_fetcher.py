import pytest
import asyncio
from unittest.mock import patch, AsyncMock
from modules.github_fetcher import GitHubProfileFetcher
from config.settings import Settings

# Valid GitHub usernames for testing
VALID_USERNAMES = [
    "varshashaheen", "sanumuhammedc", "adarshps", "aazimanish", "hadibinnoor",
    "sunith-vs", "kiranmurali93", "ziyadkadekara", "adarshps123", "octocat",
    "abdulhakkeempa", "sunithvs", "rohittp0", "serasusan", "nandhu-44",
    "naumshaz", "sajithlaldev", "jenin82", "adriancosmas", "anikdascodes",
    "pavan-1802", "kekmatime", "shyamjp2002", "anantkatyayn", "soorya005",
    "irisxvii", "anikdas", "aaagrud", "fayazazeemp", "thepywizard",
    "ameeshaarackal", "rahulcodes109", "gobmj",'iamfasna'
]

# Invalid GitHub usernames for testing
INVALID_USERNAMES = [
    "",  # Empty string
    "a" * 40,  # Too long (>39 characters)
    "-invalid",  # Starts with hyphen
    "invalid-",  # Ends with hyphen
    "inv--alid",  # Contains consecutive hyphens
    "invalid@user",  # Contains invalid character @
    "invalid user",  # Contains space
    "Invalid_User",  # Contains underscore
    "%",  # Special character
    "dfghjkjhgfdfghjhgf",  # Random string
]

# Organization names (should be invalid for user validation)
ORGANIZATION_NAMES = [
    "teamlamsta",
    "github",
    "microsoft",
    "google",
    "facebook"
]

@pytest.mark.asyncio
class TestGitHubUsernameValidation:
    @pytest.fixture
    def mock_settings(self):
        with patch('config.settings.Settings.get_github_token', return_value='mock-token'):
            yield

    @pytest.fixture
    def mock_httpx_client(self):
        async def mock_response(url, headers=None):
            username = url.split('/')[-1]
            
            # Mock response for valid users
            if username in VALID_USERNAMES:
                return AsyncMock(
                    status_code=200,
                    json=lambda: {"type": "User"}
                )
            # Mock response for organizations
            elif username in ORGANIZATION_NAMES:
                return AsyncMock(
                    status_code=200,
                    json=lambda: {"type": "Organization"}
                )
            # Mock response for invalid users
            else:
                return AsyncMock(
                    status_code=404,
                    json=lambda: {"message": "Not Found"}
                )

        with patch('httpx.AsyncClient') as mock_client:
            client_instance = AsyncMock()
            client_instance.get = mock_response
            mock_client.return_value.__aenter__.return_value = client_instance
            yield mock_client

    @pytest.mark.parametrize("username", VALID_USERNAMES)
    async def test_valid_usernames(self, username, mock_settings, mock_httpx_client):
        """Test that valid GitHub usernames pass validation"""
        assert await GitHubProfileFetcher.validate_github_username(username) is True

    @pytest.mark.parametrize("username", INVALID_USERNAMES)
    async def test_invalid_usernames(self, username, mock_settings, mock_httpx_client):
        """Test that invalid GitHub usernames fail validation"""
        if username is None:
            with pytest.raises(TypeError):
                await GitHubProfileFetcher.validate_github_username(username)
        else:
            assert await GitHubProfileFetcher.validate_github_username(username) is False

    @pytest.mark.parametrize("org_name", ORGANIZATION_NAMES)
    async def test_organization_names(self, org_name, mock_settings, mock_httpx_client):
        """Test that organization names are rejected"""
        assert await GitHubProfileFetcher.validate_github_username(org_name) is False

    async def test_rate_limit_handling(self, mock_settings, mock_httpx_client):
        """Test handling of GitHub API rate limits"""
        # Test rapid consecutive requests
        results = await asyncio.gather(
            *[GitHubProfileFetcher.validate_github_username("octocat") for _ in range(5)],
            return_exceptions=True
        )
        # All requests should complete without raising exceptions
        assert all(isinstance(result, bool) for result in results)

    @pytest.mark.parametrize("username", [
        "a" * 39,  # Maximum length
        "user-name",  # With hyphen
        "user123",    # With numbers
    ])
    async def test_edge_cases(self, username, mock_settings, mock_httpx_client):
        """Test edge cases for username validation"""
        # Mock these usernames as valid users
        with patch('httpx.AsyncClient') as mock_client:
            client_instance = AsyncMock()
            client_instance.get = AsyncMock(
                return_value=AsyncMock(
                    status_code=200,
                    json=lambda: {"type": "User"}
                )
            )
            mock_client.return_value.__aenter__.return_value = client_instance
            assert await GitHubProfileFetcher.validate_github_username(username) is True
