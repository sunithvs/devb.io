import { ThemeManifest } from '@/types/theme';

export const manifest: ThemeManifest = {
    id: 'default',
    name: 'Default Portfolio',
    author: 'devb.io',
    version: '1.0.0',
    description: 'Clean and modern portfolio theme with all sections',

    // Routes this theme supports
    routes: [
        {
            slug: '',              // Main page: /username
            component: 'index',
            label: 'Home'
        },
        // Can add more routes later:
        // { slug: 'projects', component: 'projects', label: 'Projects' },
        // { slug: 'blogs', component: 'blogs', label: 'Blog Posts' },
    ],

    // Theme customization options (for future use)
    customization: {
        colors: ['primary', 'accent', 'background'],
        layouts: ['default'],
        sections: ['about', 'projects', 'experience', 'education', 'skills', 'blogs']
    }
};
