import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createAdminSupabaseClient } from "../_shared/supabase-client.ts"
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
        const cacheKey = `linkedin:${username}`
        const cachedResponse = await getCache(supabase, cacheKey)
        if (cachedResponse) {
            return new Response(
                JSON.stringify(cachedResponse),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 1. Get User ID
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single()

        if (!user) {
            return new Response(
                JSON.stringify({ error: 'User not found' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
        }

        // 2. Check Platform Profiles for LinkedIn
        const { data: linkedinProfile } = await supabase
            .from('platform_profiles')
            .select('*')
            .eq('user_id', user.id)
            .eq('platform', 'linkedin')
            .single()

        if (linkedinProfile) {
            const responseData = linkedinProfile.data
            await setCache(supabase, cacheKey, responseData)

            return new Response(
                JSON.stringify(responseData),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 3. Fetch from External Source (Not implemented yet)
        // In the future, we would call a LinkedIn scraper/API here.

        return new Response(
            JSON.stringify({ error: 'LinkedIn profile not found or not linked' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
