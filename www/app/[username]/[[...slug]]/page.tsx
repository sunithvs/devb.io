import { notFound } from 'next/navigation';
import { getTheme, registerTheme } from '@/lib/theme-registry';
import { getCompleteProfileData } from '@/lib/data-adapter';
import { manifest as defaultManifest } from '@/themes/default/manifest';
import { manifest as minimalResumeManifest } from '@/themes/minimal-resume/manifest';

// Register all themes
registerTheme(defaultManifest);
registerTheme(minimalResumeManifest);

export const maxDuration = 60;

/**
 * Dynamic Theme Route Handler
 * Handles all /[username] and /[username]/[...slug] routes
 * Dynamically loads and renders the appropriate theme
 */
export default async function UserPage({
    params,
    searchParams,
}: {
    params: Promise<{ username: string; slug?: string[] }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    try {
        const { username, slug = [] } = await params;
        const urlSearchParams = await searchParams;

        if (!username) {
            console.error('No username provided');
            return notFound();
        }

        // Validate username to prevent system paths from being treated as usernames
        // GitHub Username Rules:
        // 1. Alphanumeric and hyphens only
        // 2. Cannot start or end with a hyphen
        // 3. Max 39 characters
        // 4. No consecutive hyphens (optional, but good practice)
        // Regex: Starts with alphanumeric, followed by optional alphanumeric/hyphens, ends with alphanumeric. Max 39 chars.
        // This automatically blocks paths with dots like .well-known, favicon.ico, etc.
        const githubUsernameRegex = /^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){0,38}$/i;

        if (!githubUsernameRegex.test(username)) {
            console.log(`[Theme System] Blocking invalid username request (regex mismatch): ${username}`);
            return notFound();
        }

        console.log(`[Theme System] Loading profile for: ${username}, slug: ${slug.join('/')}`);

        // 1. Fetch complete profile data
        const profileData = await getCompleteProfileData(username);

        if (!profileData) {
            console.error(`[Theme System] Profile data not found for: ${username}`);
            return notFound();
        }

        console.log(`[Theme System] Profile data loaded for: ${username}`);

        // 2. Determine theme (from query param override, customizations, or default)
        const themeOverride = urlSearchParams?.theme as string;
        const themeId = themeOverride || profileData.customizations?.theme_id || 'default';

        if (themeOverride) {
            console.log(`[Theme System] Previewing theme override: ${themeOverride}`);
        } else {
            console.log(`[Theme System] Using stored theme: ${themeId}`);
        }

        const theme = getTheme(themeId);

        if (!theme) {
            console.error(`[Theme System] Theme not found: ${themeId}`);
            return notFound();
        }

        // 3. Determine which route to render
        const pageSlug = slug.join('/') || '';
        console.log(`[Theme System] Looking for route: "${pageSlug}"`);

        const route = theme.routes.find(r => r.slug === pageSlug);

        if (!route) {
            console.error(`[Theme System] Route not found: "${pageSlug}" in theme: ${themeId}`);
            console.log(`[Theme System] Available routes:`, theme.routes.map(r => r.slug));
            return notFound();
        }

        console.log(`[Theme System] Rendering route: ${route.component}`);

        // 4. Dynamically import the theme's page component
        const ThemePage = (await import(`@/themes/${themeId}/pages/${route.component}.tsx`)).default;

        // 5. Dynamically import theme layout
        const ThemeLayout = (await import(`@/themes/${themeId}/layouts/main.tsx`)).default;

        console.log(`[Theme System] Successfully loaded theme components`);

        // 6. Render with theme layout
        return (
            <ThemeLayout theme={theme} username={username}>
                <ThemePage data={profileData} username={username} searchParams={urlSearchParams} />
            </ThemeLayout>
        );
    } catch (error) {
        console.error('[Theme System] Error rendering page:', error);
        return notFound();
    }
}
