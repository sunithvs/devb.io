export class GitHubClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async fetchGraphQL(query: string, variables: any = {}) {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`GitHub GraphQL API error: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchUserProfile(username: string) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const oneYearAgoStr = oneYearAgo.toISOString();

    const query = `
      query($username: String!, $from: DateTime!) {
        user(login: $username) {
          name
          bio
          location
          avatarUrl
          url
          websiteUrl
          socialAccounts(first: 10) {
            nodes {
              provider
              url
              displayName
            }
          }
          followers { totalCount }
          following { totalCount }
          repositories(first: 100, orderBy: {field: UPDATED_AT, direction: DESC}) {
            totalCount
          }
          contributionsCollection(from: $from) {
            contributionCalendar { totalContributions }
          }
          repositoriesContributedTo(first: 100, contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY]) {
            totalCount
          }
          pullRequests(first: 100, states: MERGED, orderBy: {field: UPDATED_AT, direction: DESC}) {
             totalCount
             nodes { createdAt }
          }
          issues(last: 100, states: CLOSED) {
            totalCount
            nodes { createdAt }
          }
          repository(name: $username) {
            object(expression: "HEAD:README.md") {
              ... on Blob { text }
            }
          }
        }
      }
    `;

    const data = await this.fetchGraphQL(query, { username, from: oneYearAgoStr });
    return data.data.user;
  }

  async fetchUserRepos(username: string) {
    // For simplicity, we can use REST API for repos as it's easier to paginate if needed
    // But for now, let's stick to a simple fetch
    const response = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = errorBody.message || response.statusText;
      throw new Error(`GitHub REST API error: ${errorMessage}`);
    }

    const data = await response.json();

    // Ensure we're returning an array
    if (!Array.isArray(data)) {
      const errorMsg = data.message || JSON.stringify(data);
      console.error('GitHub API returned non-array response:', data);
      throw new Error(`GitHub API returned unexpected response: ${errorMsg}`);
    }

    return data;
  }

  async fetchPinnedRepos(username: string) {
    const query = `
        query($username: String!) {
          user(login: $username) {
            pinnedItems(first: 6, types: REPOSITORY) {
              nodes {
                ... on Repository { name }
              }
            }
          }
        }
      `;
    const data = await this.fetchGraphQL(query, { username });
    return data.data.user?.pinnedItems?.nodes?.map((n: any) => n.name) || [];
  }
}
