import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createAdminSupabaseClient } from "../_shared/supabase-client.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { getCache, setCache } from "../_shared/cache-utils.ts"

const LINKEDIN_API_URL = "https://notes.cleve.ai/api/linkedin-unwrapped"
const LINKEDIN_USERNAME_PATTERN = /^[\w\-]+$/

function validateLinkedInUsername(username: string): boolean {
    return LINKEDIN_USERNAME_PATTERN.test(username)
}

function processLinkedInResponse(data: any): any {
    if (!data.profile) {
        return { error: "No profile data found" }
    }

    const profile = data.profile

    return {
        basic_info: {
            full_name: profile.full_name,
            headline: profile.headline,
            location: {
                city: profile.city,
                state: profile.state,
                country: profile.country
            },
            summary: profile.summary,
            profile_url: `https://linkedin.com/in/${profile.public_identifier}`,
            connections: profile.connections
        },
        experience: (profile.experiences || []).map((exp: any) => ({
            title: exp.title,
            company: exp.company,
            location: exp.location,
            description: exp.description,
            duration: {
                start: {
                    month: exp.starts_at?.month || 'N/A',
                    year: exp.starts_at?.year || 'N/A'
                },
                end: exp.ends_at ? {
                    month: exp.ends_at.month,
                    year: exp.ends_at.year
                } : null
            }
        })),
        education: (profile.education || []).map((edu: any) => ({
            school: edu.school,
            degree: edu.degree_name,
            field: edu.field_of_study,
            duration: {
                start: {
                    year: edu.starts_at?.year || null
                },
                end: edu.ends_at ? {
                    year: edu.ends_at.year
                } : null
            }
        }))
    }
}

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

        if (!validateLinkedInUsername(username)) {
            return new Response(
                JSON.stringify({ error: `Invalid LinkedIn username: '${username}'` }),
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

        // 1. Fetch from LinkedIn API
        const payload = {
            action: "wrapped",
            cache: false,
            email: "mail@example.com",
            linkedinUrl: `https://linkedin.com/in/${username}`,
            user: false
        }

        const response = await fetch(LINKEDIN_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            throw new Error(`LinkedIn API error: ${response.statusText}`)
        }

        const responseData = await response.json()
        const data = responseData.data

        // 2. Process response
        const processedData = processLinkedInResponse(data)

        if (processedData.error) {
            return new Response(
                JSON.stringify(processedData),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
        }

        // 3. Set API Cache
        await setCache(supabase, cacheKey, processedData)

        return new Response(
            JSON.stringify(processedData),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
    }
})
