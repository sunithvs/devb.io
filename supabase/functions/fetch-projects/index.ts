import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createAdminSupabaseClient } from "../_shared/supabase-client.ts"
import { GitHubClient } from "../_shared/github-client.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { Project } from "../_shared/types.ts"
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
        const cacheKey = `projects:${username}`
        const cachedResponse = await getCache(supabase, cacheKey)
        if (cachedResponse) {
            return new Response(
                JSON.stringify(cachedResponse),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // 1. Get User ID
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single()

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'User not found. Please fetch profile first.' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
            )
        }

        // 2. Fetch from GitHub
        const githubToken = Deno.env.get('GITHUB_ACCESS_TOKEN')
        if (!githubToken) throw new Error('GITHUB_ACCESS_TOKEN not set')

        const github = new GitHubClient(githubToken)
        const repos = await github.fetchUserRepos(username)
        const pinnedRepos = await github.fetchPinnedRepos(username)

        // 3. Process & Score Projects
        const projects: Project[] = []

        for (const repo of repos) {
            if (repo.fork || repo.archived) continue

            const isPinned = pinnedRepos.includes(repo.name)

            // Simple scoring logic (port from Python)
            // Weighting: Stars (2.0), Forks (1.5), Recency (1.0), Pinned (10.0)
            const stars = repo.stargazers_count
            const forks = repo.forks_count
            const updatedAt = new Date(repo.updated_at)
            const daysSinceUpdate = (new Date().getTime() - updatedAt.getTime()) / (1000 * 3600 * 24)

            let recencyBonus = 0.5
            if (daysSinceUpdate <= 365) recencyBonus = 1.5
            else if (daysSinceUpdate <= 730) recencyBonus = 1.0

            const score =
                (Math.log1p(stars) * 2.0) +
                (Math.log1p(forks) * 1.5) +
                (1.0 * recencyBonus) +
                (isPinned ? 10 : 0)

            projects.push({
                name: repo.name,
                description: repo.description,
                url: repo.html_url,
                preview_url: repo.homepage,
                languages: repo.language ? [repo.language] : [], // GitHub API returns primary language
                stars: stars,
                forks: forks,
                score: score,
                is_pinned: isPinned,
                platform: 'github',
                updated_at: repo.updated_at
            })
        }

        // 4. Save to Supabase - REMOVED
        // We only cache the response now.


        // 5. Return Top Projects
        const topProjects = projects.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 8)
        const responseData = { top_projects: topProjects }

        // 6. Set API Cache
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
