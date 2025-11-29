'use server';

import { createClient } from '@/lib/supabase/server';
import { ProfileData } from '@/types/types';
import { revalidatePath } from 'next/cache';

export async function saveProfile(data: ProfileData) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    // Verify that the user is updating their own profile
    // Fetch the current username from the database
    const { data: currentUserData, error: userFetchError } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

    // Allow if user doesn't exist (new user) or if usernames match
    if (userFetchError && userFetchError.code !== 'PGRST116') {
        console.error('Error fetching user:', userFetchError);
        return { error: 'Failed to verify user identity' };
    }

    if (currentUserData && currentUserData.username !== data.profile.username) {
        return { error: 'You can only edit your own profile' };
    }

    try {
        // 1. Update Users Table FIRST (Critical for FK constraints)
        console.log(user.id)
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                id: user.id,
                username: data.profile.username,
                full_name: data.profile.name,
                bio: data.profile.bio,
                location: data.profile.location,
                avatar_url: data.profile.avatar_url,
                website: data.profile.profile_url,
                about_summary: data.profile.about,
                issues_closed: data.profile.issues_closed,
                pull_requests_merged: data.profile.pull_requests_merged,
                total_contributions: data.profile.achievements?.total_contributions || 0,
                updated_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (userError) throw new Error(`User update failed: ${userError.message}`);

        // 2. Update Dependent Tables (Parallel)
        const updates = [];

        // Update Settings Table
        if (data.customizations) {
            updates.push((async () => {
                // Try insert first (assuming row might be missing)
                const { error: insertError } = await supabase
                    .from('settings')
                    .insert({
                        user_id: user.id,
                        theme: data.customizations!.theme_id,
                        section_visibility: data.customizations!.section_visibility,
                        updated_at: new Date().toISOString(),
                    });

                // If insert failed due to duplicate key (row exists), try update
                if (insertError) {
                    if (insertError.code === '23505') { // unique_violation
                        const { error: updateError } = await supabase
                            .from('settings')
                            .update({
                                theme: data.customizations!.theme_id,
                                section_visibility: data.customizations!.section_visibility,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('user_id', user.id);

                        if (updateError) throw new Error(`Settings update failed: ${updateError.message}`);
                    } else {
                        throw new Error(`Settings insert failed: ${insertError.message}`);
                    }
                }
            })());
        }

        // Update Social Links (Delete all and re-insert)
        if (data.profile.social_accounts) {
            updates.push((async () => {
                // Delete existing
                await supabase.from('social_links').delete().eq('user_id', user.id);

                // Insert new
                if (data.profile.social_accounts && data.profile.social_accounts.length > 0) {
                    const socialLinks = data.profile.social_accounts.map(account => ({
                        user_id: user.id,
                        platform: account.provider,
                        url: account.url,
                        username: account.display_name,
                    }));

                    const { error: socialError } = await supabase
                        .from('social_links')
                        .insert(socialLinks);

                    if (socialError) throw new Error(`Social links update failed: ${socialError.message}`);
                }
            })());
        }

        // Update Projects (Delete all and re-insert)
        if (data.projects && data.projects.top_projects) {
            updates.push((async () => {
                // Delete existing
                await supabase.from('projects').delete().eq('user_id', user.id);

                // Insert new
                if (data.projects.top_projects.length > 0) {
                    const projects = data.projects.top_projects.map(project => ({
                        user_id: user.id,
                        name: project.name,
                        description: project.description,
                        url: project.url,
                        stars: project.stars,
                        forks: project.forks,
                        languages: project.languages,
                        platform: project.platform,
                        updated_at: new Date().toISOString(), // Or project.updated_at
                    }));

                    const { error: projectsError } = await supabase
                        .from('projects')
                        .insert(projects);

                    if (projectsError) throw new Error(`Projects update failed: ${projectsError.message}`);
                }
            })());
        }

        await Promise.all(updates);

        revalidatePath('/editor');
        revalidatePath(`/editor/${data.profile.username}`);

        return { success: true };
    } catch (error: unknown) {
        console.error('Error saving profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save profile';
        return { error: errorMessage };
    }
}
