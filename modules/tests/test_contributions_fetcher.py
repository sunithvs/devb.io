import pytest
from unittest.mock import patch, Mock
from datetime import datetime, timedelta
from modules.contributions_fetcher import GitHubContributionsFetcher
from config.settings import Settings

SAMPLE_USERNAME = "testuser"
MOCK_TOKEN = "mock-token"

@pytest.fixture
def mock_settings():
    with patch('config.settings.Settings.get_github_token', return_value=MOCK_TOKEN):
        yield

@pytest.fixture
def mock_response():
    def create_event(event_type, date, repo_name, **kwargs):
        event = {
            'type': event_type,
            'created_at': date.strftime("%Y-%m-%dT%H:%M:%SZ"),
            'repo': {'name': repo_name}
        }
        if event_type == 'PushEvent':
            event['payload'] = {
                'commits': kwargs.get('commits', [{'message': 'Test commit'}])
            }
        elif event_type == 'PullRequestEvent':
            event['payload'] = {
                'pull_request': {
                    'title': kwargs.get('pr_title', 'Test PR'),
                    'body': kwargs.get('pr_body', 'Test PR body')
                }
            }
        return event

    return create_event

class TestGitHubContributionsFetcher:
    def test_fetch_recent_contributions_success(self, mock_settings, mock_response):
        """Test successful fetching of contributions"""
        now = datetime.now()
        events = [
            mock_response('PushEvent', now - timedelta(days=1), 'repo1'),
            mock_response('PullRequestEvent', now - timedelta(days=2), 'repo1',
                         pr_title='Feature PR', pr_body='Adding new feature'),
            mock_response('PushEvent', now - timedelta(days=3), 'repo2',
                         commits=[{'message': 'Fix bug'}, {'message': 'Update docs'}])
        ]

        with patch('requests.get') as mock_get:
            mock_get.return_value = Mock(
                status_code=200,
                json=lambda: events,
                raise_for_status=lambda: None
            )

            contributions = GitHubContributionsFetcher.fetch_recent_contributions(SAMPLE_USERNAME, days=30)

            # Verify API call
            mock_get.assert_called_once()
            assert mock_get.call_args[0][0] == f"https://api.github.com/users/{SAMPLE_USERNAME}/events"
            assert mock_get.call_args[1]['headers']['Authorization'] == f"token {MOCK_TOKEN}"

            # Verify response processing
            assert len(contributions) <= 10  # Should respect the 10 repo limit
            assert 'repo1' in contributions
            assert 'repo2' in contributions
            
            # Verify PushEvent processing
            repo2_contributions = contributions['repo2']
            assert any(c['type'] == 'PushEvent' for c in repo2_contributions)
            push_event = next(c for c in repo2_contributions if c['type'] == 'PushEvent')
            assert len(push_event['messages']) == 2
            assert 'Fix bug' in push_event['messages']
            
            # Verify PullRequestEvent processing
            repo1_contributions = contributions['repo1']
            assert any(c['type'] == 'PullRequestEvent' for c in repo1_contributions)
            pr_event = next(c for c in repo1_contributions if c['type'] == 'PullRequestEvent')
            assert 'Feature PR' in pr_event['messages'][0]

    def test_fetch_recent_contributions_old_events(self, mock_settings, mock_response):
        """Test handling of events older than the cutoff date"""
        old_date = datetime.now() - timedelta(days=150)
        events = [mock_response('PushEvent', old_date, 'old-repo')]

        with patch('requests.get') as mock_get:
            mock_get.return_value = Mock(
                status_code=200,
                json=lambda: events,
                raise_for_status=lambda: None
            )

            contributions = GitHubContributionsFetcher.fetch_recent_contributions(SAMPLE_USERNAME, days=30)
            assert len(contributions) == 0  # No contributions within the time window

    def test_fetch_recent_contributions_api_error(self, mock_settings):
        """Test handling of API errors"""
        with patch('requests.get') as mock_get:
            mock_get.return_value = Mock(
                status_code=404,
                raise_for_status=lambda: exec('raise Exception("API Error")')
            )

            with pytest.raises(Exception) as exc_info:
                GitHubContributionsFetcher.fetch_recent_contributions(SAMPLE_USERNAME)
            assert "Error fetching contributions" in str(exc_info.value)

    def test_fetch_recent_contributions_empty_response(self, mock_settings):
        """Test handling of empty API response"""
        with patch('requests.get') as mock_get:
            mock_get.return_value = Mock(
                status_code=200,
                json=lambda: [],
                raise_for_status=lambda: None
            )

            contributions = GitHubContributionsFetcher.fetch_recent_contributions(SAMPLE_USERNAME)
            assert contributions == {}
