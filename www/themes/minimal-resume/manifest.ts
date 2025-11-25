import { ThemeManifest } from '@/types/theme';

export const manifest: ThemeManifest = {
    id: 'minimal-resume',
    name: 'Minimal Resume',
    author: 'devb.io',
    version: '1.0.0',
    description: 'Clean black and white resume-style portfolio with elegant typography',

    routes: [
        {
            slug: '',
            component: 'index',
            label: 'Portfolio'
        }
    ],

    customization: {
        colors: ['black', 'white', 'gray'],
        layouts: ['single-page'],
        sections: ['about', 'projects', 'experience', 'education', 'skills']
    }
};
