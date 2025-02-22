import pytest
from unittest.mock import patch, Mock
from datetime import datetime, timedelta
from modules.github_projects import GitHubProjectRanker

SAMPLE_USERNAME = "testuser"
MOCK_TOKEN = "mock-token"

@pytest.fixture
def mock_settings():
    with patch('config.settings.Settings.get_github_token', return_value=MOCK_TOKEN):
        yield

@pytest.fixture
def ranker(mock_settings):
    return GitHubProjectRanker()

def create_mock_repo(name, stars=0, forks=0, updated_at=None, created_at=None, 
                    language=None, description=None, is_fork=False):
    """Helper function to create mock repository data"""
    now = datetime.now()
    # Format timestamps in GitHub's format without microseconds
    default_created = (now - timedelta(days=100)).strftime("%Y-%m-%dT%H:%M:%SZ")
    default_updated = now.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    return {
        'name': name,
        'stargazers_count': stars,
        'forks_count': forks,
        'updated_at': updated_at or default_updated,
        'created_at': created_at or default_created,
        'language': language,
        'description': description,
        'fork': is_fork,
        'topics': ['python', 'testing'],
        'size': 1000
    }

class TestGitHubProjectRanker:
    def test_fetch_user_repos_success(self, ranker):
        """Test successful fetching of user repositories"""
        mock_repos = [
            create_mock_repo('repo1', stars=10),
            create_mock_repo('repo2', stars=5)
        ]

        with patch('requests.get') as mock_get:
            # First call returns repos, second call returns empty list to end pagination
            mock_get.side_effect = [
                Mock(status_code=200, json=lambda: mock_repos),
                Mock(status_code=200, json=lambda: [])
            ]

            repos = ranker.fetch_user_repos(SAMPLE_USERNAME)
            
            assert len(repos) == 2
            assert repos[0]['name'] == 'repo1'
            assert repos[1]['name'] == 'repo2'
            
            # Verify API calls
            assert mock_get.call_count == 2  # Should make two calls - one for data, one to check for more
            first_call = mock_get.call_args_list[0]
            assert first_call[0][0] == f'https://api.github.com/users/{SAMPLE_USERNAME}/repos'
            assert first_call[1]['headers']['Authorization'] == f'token {MOCK_TOKEN}'
            assert first_call[1]['params'] == {'page': 1, 'per_page': 100}

    def test_fetch_user_repos_pagination(self, ranker):
        """Test repository fetching with pagination"""
        page1 = [create_mock_repo(f'repo{i}') for i in range(100)]
        page2 = [create_mock_repo(f'repo{i}') for i in range(100, 150)]

        with patch('requests.get') as mock_get:
            mock_get.side_effect = [
                Mock(status_code=200, json=lambda: page1),
                Mock(status_code=200, json=lambda: page2),
                Mock(status_code=200, json=lambda: [])
            ]

            repos = ranker.fetch_user_repos(SAMPLE_USERNAME)
            assert len(repos) == 150
            assert mock_get.call_count == 3

    def test_fetch_pinned_repos_success(self, ranker):
        """Test successful fetching of pinned repositories"""
        mock_response = {
            'data': {
                'user': {
                    'pinnedItems': {
                        'nodes': [
                            {'name': 'pinned1'},
                            {'name': 'pinned2'}
                        ]
                    }
                }
            }
        }

        with patch('requests.post') as mock_post:
            mock_post.return_value = Mock(
                status_code=200,
                json=lambda: mock_response
            )

            pinned_repos = ranker.fetch_pinned_repos(SAMPLE_USERNAME)
            assert len(pinned_repos) == 2
            assert 'pinned1' in pinned_repos
            assert 'pinned2' in pinned_repos

    def test_calculate_project_score(self, ranker):
        """Test project score calculation"""
        repo = create_mock_repo(
            'test-repo',
            stars=100,
            forks=50,
            language='Python',
            description='A test repository'
        )
        pinned_repos = ['test-repo']  # This repo is pinned

        score = ranker.calculate_project_score(repo, pinned_repos)
        assert score > 0  # Score should be positive for a repo with activity
        
        # Test fork penalty
        fork_repo = create_mock_repo(
            'fork-repo',
            stars=100,
            forks=50,
            is_fork=True
        )
        fork_score = ranker.calculate_project_score(fork_repo, [])
        assert fork_score < score  # Forked repo should have lower score

    def test_get_featured_projects(self, ranker):
        """Test getting featured projects"""
        mock_repos = [
            create_mock_repo('repo1', stars=100, forks=50),
            create_mock_repo('repo2', stars=50, forks=25),
            create_mock_repo('repo3', stars=10, forks=5)
        ]
        mock_pinned = ['repo2']

        with patch.object(ranker, 'fetch_user_repos', return_value=mock_repos), \
             patch.object(ranker, 'fetch_pinned_repos', return_value=mock_pinned):

            featured = ranker.get_featured(SAMPLE_USERNAME, top_n=2)
            assert isinstance(featured, dict)
            assert 'top_projects' in featured
            assert 'top_languages' in featured
            
            top_projects = featured['top_projects']
            assert len(top_projects) == 2
            assert top_projects[0]['name'] == 'repo2'  # Pinned repo should be first
            assert top_projects[1]['name'] == 'repo1'  # Highest scored non-pinned repo

    def test_error_handling(self, ranker):
        """Test error handling in various scenarios"""
        with patch('requests.get') as mock_get:
            mock_get.return_value = Mock(status_code=404)
            repos = ranker.fetch_user_repos(SAMPLE_USERNAME)
            assert repos == []

        with patch('requests.post') as mock_post:
            mock_post.return_value = Mock(status_code=404)
            pinned = ranker.fetch_pinned_repos(SAMPLE_USERNAME)
            assert pinned == []

            # Test malformed response
            mock_post.return_value = Mock(
                status_code=200,
                json=lambda: {'data': None}
            )
            pinned = ranker.fetch_pinned_repos(SAMPLE_USERNAME)
            assert pinned == []
