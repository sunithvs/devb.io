import {ProfileData} from "@/types/types";

import {
    getUserProfile,
    getUserProjects,
} from './api';
import type { Profile, SocialAccount } from '@/types/types';

/**
 * Data Adapter
 * Converts Supabase Edge Function responses into standardized ProfileData
 * This ensures themes receive consistent data regardless of backend changes
 */

/**
 * Fetch and transform profile data for themes
 * Only fetches FAST data (profile, projects)
 * Slow data (LinkedIn, Medium) should be fetched by theme pages with Suspense
 */
export async function getCompleteProfileData(username: string): Promise<ProfileData | null> {
    try {
        // Fetch ONLY fast API calls
        const profile = await getUserProfile(username);
        if (!profile) return null;

        const projects = await getUserProjects(username);

        // Transform into ProfileData structure
        // LinkedIn and blogs are null - theme pages will fetch them with Suspense
        const profileData: ProfileData = {
            claimed: true, // TODO: Fetch from database
            user_id: undefined, // TODO: Fetch from database if claimed
            profile,
            projects: projects || { top_projects: [], top_languages: [] },
            linkedin: null, // Will be fetched by theme page with Suspense
            blogs: null,    // Will be fetched by theme page with Suspense
            customizations: {
                theme_id: 'minimal-resume', // Change to 'default' to switch back
                section_visibility: {
                    about: true,
                    projects: true,
                    experience: true, // Theme will check if LinkedIn data exists
                    education: true,  // Theme will check if LinkedIn data exists
                    skills: true,
                    blogs: true,      // Theme will check if blogs exist
                },
            },
        };

        return profileData;
    } catch (error) {
        console.error(`Error fetching complete profile data for ${username}:`, error);
        return null;
    }
}

/**
 * Helper to get LinkedIn username from profile
 */
export function getLinkedInUsername(profile: Profile): string | null {
    const linkedInAccount = profile.social_accounts?.find(
        (account: SocialAccount) => account.provider === 'linkedin'
    );
    return linkedInAccount?.url?.split('in/').pop()?.replace('/', '') || null;
}

/**
 * Helper to get Medium username from profile
 */
export function getMediumUsername(profile: Profile): string | null {
    const mediumAccount = profile.social_accounts?.find(
        (account: SocialAccount) => account.provider === 'generic' && account.url.includes('medium.com')
    );
    return mediumAccount?.url.split('@')[1] || null;
}
