import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createAdminSupabaseClient } from "../_shared/supabase-client.ts"
import { GitHubClient } from "../_shared/github-client.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { UserProfile } from "../_shared/types.ts"
import { getCache, setCache } from "../_shared/cache-utils.ts"

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const url = new URL(req.url)
        const username = url.searchParams.get('username')?.toLowerCase()

        if (!username) {
            return new Response(
                JSON.stringify({ error: 'Username is required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        const supabase = createAdminSupabaseClient()

        // 0. Check API Cache
        const cacheKey = `profile:${username}`
        const cachedResponse = await getCache(supabase, cacheKey)
        if (cachedResponse) {
            return new Response(
                JSON.stringify(cachedResponse),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 1. Check DB Cache (Legacy/Normalized check)
        // We can keep this or rely solely on API cache. 
        // Keeping it as a fallback or for partial data is fine, but API cache is faster.
        // Let's proceed to fetch fresh data if API cache misses.

        // 2. Fetch from GitHub
        const githubToken = Deno.env.get('GITHUB_ACCESS_TOKEN')
        if (!githubToken) {
            throw new Error('GITHUB_ACCESS_TOKEN not set')
        }
        const github = new GitHubClient(githubToken)
        const ghUser = await github.fetchUserProfile(username)

        if (!ghUser) {
            return new Response(
                JSON.stringify({ error: 'User not found on GitHub' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
        }

        // 3. Transform Data
        const prCount = ghUser.pullRequests?.totalCount || 0
        const issueCount = ghUser.issues?.totalCount || 0
        const readmeContent = ghUser.repository?.object?.text || ''

        const userData = {
            username: username,
            full_name: ghUser.name,
            bio: ghUser.bio,
            location: ghUser.location,
            avatar_url: ghUser.avatarUrl,
            website: ghUser.url,
            readme_content: readmeContent
        }

        // 4. Return Data
        const responseData = {
            id: 'generated-id', // Placeholder or remove if not needed by frontend
            username: username,
            full_name: ghUser.name,
            bio: ghUser.bio,
            location: ghUser.location,
            avatar_url: ghUser.avatarUrl,
            website: ghUser.url,
            readme_content: readmeContent,
            social_accounts: [],
            achievements: {
                total_contributions: ghUser.contributionsCollection.contributionCalendar.totalContributions,
                repositories_contributed_to: ghUser.repositoriesContributedTo.totalCount
            }
        }

        // 5. Set API Cache
        await setCache(supabase, cacheKey, responseData)

        // 6. Pre-warm 'about' cache since we have the data
        if (readmeContent) {
            await setCache(supabase, `about:${username}`, {
                about: null, // AI summary not available in this flow
                readme: readmeContent
            })
        }

        return new Response(
            JSON.stringify(responseData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
