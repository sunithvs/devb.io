import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        '/((?!api/|_next/|_static/|[\\w-]+\\.\\w+).*)',
    ],
};

export default async function middleware(req: NextRequest) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host')!;

    // Get the base domain from env or default to localhost
    // In production, this should be 'devb.io'
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'devb.io';

    // Check if we are on a subdomain (e.g. sunithvs.devb.io)
    // We assume the appDomain is the root domain.
    // If hostname is "sunithvs.devb.io", subdomain is "sunithvs"
    // If hostname is "devb.io", subdomain is null

    let currentDomain = hostname.replace(`.${appDomain}`, '');
    const isSubdomain = hostname.endsWith(`.${appDomain}`) && hostname !== appDomain;

    // Handle localhost for testing: "sunithvs.localhost:3000"
    if (appDomain === 'localhost:3000' || appDomain === 'localhost') {
        const parts = hostname.split('.');
        if (parts.length > 1 && (parts[parts.length - 1].includes('localhost') || parts[parts.length - 1] === '3000')) {
            // Simple check for localhost subdomains
            if (parts[0] !== 'localhost' && parts[0] !== 'www') {
                currentDomain = parts[0];
                // isSubdomain = true; // Logic handled below
            }
        }
    }

    // 1. Handle Subdomains (e.g. sunithvs.devb.io)
    if (isSubdomain) {
        const subdomain = hostname.split('.')[0];

        // Prevent rewrite for reserved subdomains if needed (though they shouldn't exist in domains table)
        if (['www', 'api', 'assets'].includes(subdomain)) {
            return NextResponse.next();
        }

        // Rewrite to the profile page
        // The page at app/[username]/page.tsx will handle the rendering
        return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
    }

    // 2. Handle Custom Domains (e.g. example.com)
    if (hostname !== appDomain && !hostname.endsWith(`.${appDomain}`) && !hostname.includes('localhost')) {
        // This is a custom domain. We need to find which username it belongs to.
        const supabase = await createClient();

        // Call the RPC function we created
        const { data: username } = await supabase.rpc('get_username_by_domain', {
            lookup_domain: hostname
        });

        if (username) {
            // Rewrite to the profile page
            return NextResponse.rewrite(new URL(`/${username}${url.pathname}`, req.url));
        }

        // If domain not found, 404
        return NextResponse.rewrite(new URL('/404', req.url));
    }

    // 3. Handle Root Domain (devb.io)
    // Redirect /username to username.devb.io (if it's a valid user profile path)
    // We need to be careful not to redirect reserved paths like /editor, /login, etc.
    if (hostname === appDomain) {
        const pathParts = url.pathname.split('/');
        const potentialUsername = pathParts[1]; // /username -> username

        // List of reserved paths that should NOT be redirected
        const reservedPaths = [
            'editor', 'api', 'auth', 'login', 'signup', 'dashboard', 'settings',
            'about', 'pricing', 'docs', 'legal', 'favicon.ico', 'images', '_next'
        ];

        if (potentialUsername && !reservedPaths.includes(potentialUsername) && potentialUsername.length > 0) {
            // Optional: Check if this username actually exists before redirecting?
            // Or just redirect and let the subdomain handle 404 if not found.
            // For speed, we might just redirect.

            // Construct the new URL: https://username.devb.io/path
            // Note: In development (localhost), this might be tricky without /etc/hosts

            if (process.env.NODE_ENV === 'production') {
                const newUrl = new URL(`https://${potentialUsername}.${appDomain}${url.pathname.replace(`/${potentialUsername}`, '')}`);
                return NextResponse.redirect(newUrl);
            }
        }
    }

    return NextResponse.next();
}
