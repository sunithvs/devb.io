import pytest
from datetime import datetime, timedelta
from modules.github_fetcher import GitHubProfileFetcher
from modules.github_projects import GitHubProjectRanker
from modules.contributions_fetcher import GitHubContributionsFetcher

# Test users with different profiles
TEST_USERS = ['sunithvs', 'octocat', 'torvalds', 'iamfasna','sunith-vs']

@pytest.mark.integration
class TestGitHubIntegration:
    """Integration tests using real GitHub API calls"""

    @pytest.mark.parametrize("username", TEST_USERS)
    def test_fetch_user_repositories(self, username):
        """Test fetching repositories for real users"""
        ranker = GitHubProjectRanker()
        repos = ranker.fetch_user_repos(username)
        
        assert isinstance(repos, list)
        assert len(repos) > 0
        
        # Verify repository structure
        for repo in repos:
            assert 'name' in repo
            assert 'stargazers_count' in repo
            assert 'forks_count' in repo
            assert 'language' in repo
            assert isinstance(repo.get('fork', False), bool)

    @pytest.mark.parametrize("username", TEST_USERS)
    def test_fetch_pinned_repositories(self, username):
        """Test fetching pinned repositories for real users"""
        ranker = GitHubProjectRanker()
        pinned = ranker.fetch_pinned_repos(username)
        
        assert isinstance(pinned, list)
        # Note: Not all users have pinned repos, so we don't assert length

    @pytest.mark.parametrize("username", TEST_USERS)
    def test_get_featured_projects(self, username):
        """Test getting featured projects for real users"""
        ranker = GitHubProjectRanker()
        featured = ranker.get_featured(username, top_n=5)
        
        assert isinstance(featured, dict)
        assert 'top_projects' in featured
        assert 'top_languages' in featured
        assert isinstance(featured['top_languages'], list)  # Should always be a list, even if empty
        
        top_projects = featured['top_projects']
        if top_projects:  # Only check structure if there are projects
            for project in top_projects:
                assert 'name' in project
                assert 'score' in project
                assert 'stars' in project
                assert 'forks' in project
                assert 'language' in project
                assert 'isPinned' in project
                assert isinstance(project['score'], (int, float))
                assert isinstance(project['stars'], int)
                assert isinstance(project['forks'], int)

    @pytest.mark.parametrize("username", TEST_USERS)
    def test_fetch_recent_contributions(self, username):
        """Test fetching recent contributions for real users"""
        contributions = GitHubContributionsFetcher.fetch_recent_contributions(username, days=30)
        
        assert isinstance(contributions, dict)
        
        # Verify contribution structure
        for repo_name, events in contributions.items():
            assert isinstance(repo_name, str)
            assert isinstance(events, list)
            
            for event in events:
                assert 'type' in event
                assert 'date' in event
                assert 'messages' in event
                
                # Verify date is within the last 30 days
                event_date = datetime.fromisoformat(event['date'].replace('Z', '+00:00'))
                assert event_date > datetime.now() - timedelta(days=31)

    @pytest.mark.parametrize("username", TEST_USERS)
    def test_end_to_end_profile_analysis(self, username):
        """Test end-to-end profile analysis for real users"""

        # 2. Get featured projects
        ranker = GitHubProjectRanker()
        featured = ranker.get_featured(username)

        assert isinstance(featured, dict)
        assert 'top_projects' in featured
        assert 'top_languages' in featured
        assert isinstance(featured['top_languages'], list)  # Should be a list, even if empty
        
        # 3. Get recent contributions
        contributions = GitHubContributionsFetcher.fetch_recent_contributions(username)
        assert isinstance(contributions, dict)
        
        # Verify data consistency only if we have both contributions and projects
        if contributions and featured['top_projects']:
            contribution_repos = set(contributions.keys())
            featured_repos = {project['name'] for project in featured['top_projects']}
            print(f"\nContribution repos for {username}: {contribution_repos}")
            print(f"Featured repos for {username}: {featured_repos}")

def test_rate_limit_handling():
    """Test handling of GitHub API rate limits with rapid requests"""
    username = TEST_USERS[0]
    ranker = GitHubProjectRanker()
    
    # Make multiple rapid requests
    for _ in range(3):
        featured = ranker.get_featured(username)
        assert featured['top_projects']
        
        contributions = GitHubContributionsFetcher.fetch_recent_contributions(username)
        assert isinstance(contributions, dict)
