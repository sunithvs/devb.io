import { ProfileData } from "@/types/types";

import {
    getUserProfile,
    getUserProjects,
} from './api';
import type { Profile, SocialAccount, UserProject } from '@/types/types';
import { createClient } from '@/lib/supabase/server';


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
/**
 * Fetch profile data from Supabase Database
 */
async function fetchProfileFromDB(username: string): Promise<ProfileData | null> {
    console.time(`[DataAdapter] DB Fetch ${username}`);
    try {
        const supabase = await createClient();

        // 1. Fetch User
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();

        if (userError || !user) return null;

        // 2. Fetch related data
        const [
            { data: projects },
            { data: socialLinks },
            { data: settings }
        ] = await Promise.all([
            supabase.from('projects').select('*').eq('user_id', user.id),
            supabase.from('social_links').select('*').eq('user_id', user.id),
            supabase.from('settings').select('*').eq('user_id', user.id).single()
        ]);

        // 3. Map to ProfileData
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const profile: Profile = {
            username: user.username,
            name: user.full_name,
            bio: user.bio,
            location: user.location,
            avatar_url: user.avatar_url,
            profile_url: user.website,
            about: user.about_summary,
            followers: 0, // Not in DB
            following: 0, // Not in DB
            public_repos: 0, // Not in DB
            pull_requests_merged: user.pull_requests_merged || 0,
            issues_closed: user.issues_closed || 0,
            achievements: {
                total_contributions: user.total_contributions || 0,
                repositories_contributed_to: 0
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            social_accounts: socialLinks?.map((link: any) => ({
                provider: link.platform,
                url: link.url,
                display_name: link.username
            })) || [],
            readme_content: '', // Not in DB
            cached: true
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userProjects: UserProject = {
            top_projects: projects?.map((p: any) => ({
                name: p.name,
                description: p.description,
                url: p.url,
                stars: p.stars,
                forks: p.forks,
                languages: p.languages || [],
                platform: p.platform || 'github',
                updated_at: p.updated_at,
                score: 0,
                is_pinned: false,
                preview_url: null
            })) || [],
            top_languages: [] // Not in DB
        };

        const result: ProfileData = {
            claimed: true,
            user_id: user.id,
            profile,
            projects: userProjects,
            linkedin: null,
            blogs: null,
            customizations: settings ? {
                theme_id: settings.theme,
                section_visibility: settings.section_visibility
            } : {
                theme_id: 'minimal-resume',
                section_visibility: {
                    about: true,
                    projects: true,
                    experience: true,
                    education: true,
                    skills: true,
                    blogs: true,
                },
            }
        };
        return result;
    } finally {
        console.timeEnd(`[DataAdapter] DB Fetch ${username}`);
    }
}

/**
 * Fetch and transform profile data for themes
 * Only fetches FAST data (profile, projects)
 * Slow data (LinkedIn, Medium) should be fetched by theme pages with Suspense
 */
export async function getCompleteProfileData(username: string): Promise<ProfileData | null> {
    try {
        // 1. Try fetching from DB first
        try {
            const dbProfile = await fetchProfileFromDB(username);
            if (dbProfile) {
                return dbProfile;
            }
            console.log(`[DataAdapter] DB miss for ${username}, falling back to Edge Function`);
        } catch (dbError) {
            console.error(`[DataAdapter] DB fetch failed for ${username}:`, dbError);
            // Fallthrough to Edge Function
        }

        console.time(`[DataAdapter] Edge Function Fetch ${username}`);

        // 2. Fallback to Edge Function (existing logic)
        const profile = await getUserProfile(username);
        if (!profile) return null;

        const projects = await getUserProjects(username);

        // Transform into ProfileData structure
        // LinkedIn and blogs are null - theme pages will fetch them with Suspense
        const profileData: ProfileData = {
            claimed: false, // Not in DB
            user_id: undefined,
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

        console.timeEnd(`[DataAdapter] Edge Function Fetch ${username}`);
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
