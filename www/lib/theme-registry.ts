import type { ThemeManifest } from '@/types/theme';

/**
 * Theme Registry
 * Auto-discovers and manages all available themes
 */

// In Next.js, we'll manually register themes for now
// Can be enhanced with auto-discovery later
const themes = new Map<string, ThemeManifest>();

/**
 * Register a theme in the registry
 */
export function registerTheme(manifest: ThemeManifest) {
    themes.set(manifest.id, manifest);
}

/**
 * Get a theme by ID, fallback to default if not found
 */
export function getTheme(themeId: string): ThemeManifest | null {
    return themes.get(themeId) ?? themes.get('default') ?? null;
}

/**
 * Get all registered themes
 */
export function getAllThemes(): ThemeManifest[] {
    return Array.from(themes.values());
}

/**
 * Get user's selected theme ID from profile data
 */
export function getUserThemeId(customizations?: { theme_id?: string }): string {
    return customizations?.theme_id || 'default';
}

/**
 * Theme registry instance
 */
export const themeRegistry = themes;
