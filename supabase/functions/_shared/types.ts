export interface UserProfile {
    username: string;
    full_name: string;
    bio: string;
    location: string;
    avatar_url: string;
    profile_url: string;
    followers: number;
    following: number;
    public_repos: number;
    pull_requests_merged: string;
    issues_closed: string;
    total_contributions: number;
    repositories_contributed_to: number;
    readme_content: string;
    about_summary?: string;
    seo_title?: string;
    seo_description?: string;
    seo_keywords?: string;
    social_accounts: SocialAccount[];
}

export interface SocialAccount {
    provider: string;
    url: string;
    username_on_platform?: string;
}

export interface Project {
    name: string;
    description: string | null;
    url: string;
    preview_url: string | null;
    languages: string[];
    stars: number | null;
    forks: number | null;
    score: number | null;
    is_pinned: boolean;
    platform: string;
    updated_at: string;
}
