import { ProfileData } from '@/types/theme';
import {
    getUserProfile,
    getUserProjects,
    getUserLinkedInProfile,
    getUserMediumBlogs
} from './api';

/**
 * Data Adapter
 * Converts Supabase Edge Function responses into standardized ProfileData
 * This ensures themes receive consistent data regardless of backend changes
 */

/**
 * Fetch and transform complete profile data for themes
 */
export async function getCompleteProfileData(username: string): Promise<ProfileData | null> {
    try {
        // Fetch core profile data
        const profile = await getUserProfile(username);
        if (!profile) return null;

        // Fetch projects data
        const projects = await getUserProjects(username);

        // Fetch LinkedIn data (if available)
        const linkedInAccount = profile.social_accounts?.find(
            (account) => account.provider === 'linkedin'
        );
        const linkedInUsername = linkedInAccount?.url?.split('in/').pop()?.replace('/', '');
        const linkedin = linkedInUsername ? await getUserLinkedInProfile(linkedInUsername) : null;

        // Fetch Medium blogs (if available)
        const mediumAccount = profile.social_accounts?.find(
            (account) => account.provider === 'generic' && account.url.includes('medium.com')
        );
        const mediumUsername = mediumAccount?.url.split('@')[1];
        const blogs = mediumUsername ? await getUserMediumBlogs(mediumUsername) : null;

        // Transform into ProfileData structure
        const profileData: ProfileData = {
            claimed: true, // TODO: Fetch from database
            user_id: undefined, // TODO: Fetch from database if claimed
            profile,
            projects: projects || { top_projects: [], top_languages: [], all_projects: [] },
            linkedin,
            blogs,
            customizations: {
                theme_id: 'default', // TODO: Fetch from database
                section_visibility: {
                    about: true,
                    projects: true,
                    experience: !!linkedin,
                    education: !!linkedin,
                    skills: true,
                    blogs: !!blogs && blogs.length > 0,
                },
            },
        };

        return profileData;
    } catch (error) {
        console.error(`Error fetching complete profile data for ${username}:`, error);
        return null;
    }
}
