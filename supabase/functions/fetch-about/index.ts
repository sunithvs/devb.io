import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createAdminSupabaseClient } from "../_shared/supabase-client.ts"
import { GitHubClient } from "../_shared/github-client.ts"
import { corsHeaders } from "../_shared/cors.ts"
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
        const cacheKey = `about:${username}`
        const cachedResponse = await getCache(supabase, cacheKey)
        if (cachedResponse) {
            return new Response(
                JSON.stringify(cachedResponse),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 1. Check DB Cache (Legacy)
        const { data: cachedUser } = await supabase
            .from('users')
            .select('readme_content, about_summary')
            .eq('username', username)
            .single()

        if (cachedUser && cachedUser.readme_content) {
            // If we found it in DB but not in API cache, we could populate API cache here too.
            // But let's stick to the flow: if DB has it, return it.
            const responseData = {
                about: cachedUser.about_summary,
                readme: cachedUser.readme_content
            }
            await setCache(supabase, cacheKey, responseData) // Populate API cache for next time

            return new Response(
                JSON.stringify(responseData),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 2. Fetch from GitHub
        const githubToken = Deno.env.get('GITHUB_ACCESS_TOKEN')
        if (!githubToken) throw new Error('GITHUB_ACCESS_TOKEN not set')

        const github = new GitHubClient(githubToken)
        const ghUser = await github.fetchUserProfile(username)

        if (!ghUser) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
        }

        const readmeContent = ghUser.repository?.object?.text || ''

        // 3. Save to Supabase (Partial Update) - REMOVED
        // We only cache the response now.


        const responseData = {
            about: null,
            readme: readmeContent
        }

        // 4. Set API Cache
        await setCache(supabase, cacheKey, responseData)

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
