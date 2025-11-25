// Theme system types - separate from existing types.ts
import { Profile, UserProject, LinkedInProfile, MediumBlog } from './types';

/**
 * Standardized profile data structure that all themes receive
 * This is the contract between the data layer and theme layer
 */
export interface ProfileData {
    claimed: boolean;
    user_id?: string;

    // Core profile information
    profile: Profile;

    // Projects data
    projects: UserProject;

    // LinkedIn profile (optional)
    linkedin?: LinkedInProfile | null;

    // Medium blogs (optional)
    blogs?: MediumBlog[] | null;

    // Theme customizations
    customizations?: {
        theme_id: string;
        layout_config?: Record<string, any>;
        color_scheme?: Record<string, any>;
        section_visibility?: {
            about: boolean;
            projects: boolean;
            experience: boolean;
            education: boolean;
            skills: boolean;
            blogs: boolean;
        };
    };
}

/**
 * Standard props that all theme page components must accept
 */
export interface ThemePageProps {
    data: ProfileData;
    username: string;
    searchParams?: { [key: string]: string | string[] | undefined };
}

/**
 * Theme route definition
 */
export interface ThemeRoute {
    slug: string;           // URL slug (empty string for index)
    component: string;      // Component filename (without .tsx)
    label: string;          // Display label for navigation
}

/**
 * Theme manifest - defines theme metadata and configuration
 */
export interface ThemeManifest {
    id: string;
    name: string;
    author: string;
    version: string;
    description: string;

    // Routes this theme supports
    routes: ThemeRoute[];

    // Theme customization options exposed to users
    customization?: {
        colors?: string[];
        layouts?: string[];
        sections?: string[];
    };
}

/**
 * Theme layout component props
 */
export interface ThemeLayoutProps {
    theme: ThemeManifest;
    username: string;
    children: React.ReactNode;
}
