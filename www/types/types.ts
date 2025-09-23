export type SocialAccount = {
  provider: string;
  url: string;
};

export type Achievements = {
  total_contributions: number;
  repositories_contributed_to: number;
};

export type Profile = {
  username: string;
  name: string;
  bio: string;
  location: string;
  avatar_url: string;
  profile_url: string;
  followers: number;
  following: number;
  public_repos: number;
  pull_requests_merged: number;
  issues_closed: number;
  achievements: Achievements;
  social_accounts: SocialAccount[];
  readme_content: string;
  about: string;
  seo: SEOContent;
  cached: boolean;
};

export type Project = {
  name: string;
  description: string | null;
  score: number | null;
  stars: number;
  forks: number;
  language: string;
  url: string;
  updatedAt: string;
  isPinned: boolean;
  homepage: string | null;
};

export type LanguageUsage = [string, number];

export type UserProject = {
  top_projects: Project[];
  top_languages: LanguageUsage[];
};


export type Location = {
  city: string;
  state: string;
  country: string;
};

export type BasicInfo = {
  full_name: string;
  headline: string;
  location: Location;
  summary: string;
  profile_url: string;
  connections: number;
};

export type Duration = {
  start: {
    month?: number;
    year: number;
  };
  end?: {
    month?: number;
    year?: number;
  };
};

export type Experience = {
  title: string;
  company: string;
  location: string;
  description: string | null;
  duration: Duration;
};

export type Education = {
  school: string;
  degree: string;
  field: string | null;
  duration: {
    start: {
      year: number;
    };
    end: {
      year: number;
    };
  };
};

export type LinkedInProfile = {
  basic_info: BasicInfo;
  experience: Experience[];
  education: Education[];
};

export type SEOContent = {
  title: string;
  description: string;
  keywords: string;
}

export interface MediumBlog {
  title: string;
  link: string;
  pubDate: string;
  preview: string;
  categories: string;
  thumbnail?: string;
}

export interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
  firstDay: string;
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface ContributionsCollection {
  contributionCalendar: ContributionCalendar;
}

export interface ContributionsData {
  total: {
    [year: number]: number;
  };
  contributions: ContributionDay[];
}

export type GitHubUser = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  user_view_type: string;
  site_admin: boolean;
  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  hireable: boolean | null;
  bio: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string; // ISO date
  updated_at: string; // ISO date
};


