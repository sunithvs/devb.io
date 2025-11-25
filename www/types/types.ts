export type SocialAccount = {
  provider: string;
  url: string;
  display_name: string;
};


export type Achievements = {
  total_contributions: number;
  repositories_contributed_to: number;
};

export type Profile = {
  username: string;
  name: string;
  bio?: string;
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
  about?: string;
  seo?: SEOContent;
  cached: boolean;
};

export type Project = {
  name: string;
  description: string | null;
  score: number;
  stars: number;
  forks: number;
  languages: string[];
  url: string;
  updated_at: string;
  is_pinned: boolean;
  platform: string;
  preview_url: string | null;
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
    end?: {
      year: number;
    } | null;
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
