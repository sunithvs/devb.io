import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const getCache = async (supabase: SupabaseClient, key: string) => {
    const { data, error } = await supabase
        .from('api_cache')
        .select('data, updated_at')
        .eq('key', key)
        .single()

    if (error || !data) return null

    // Optional: Check for expiry (e.g., 24 hours)
    // const now = new Date().getTime()
    // const updated = new Date(data.updated_at).getTime()
    // if (now - updated > 24 * 60 * 60 * 1000) return null

    return data.data
}

export const setCache = async (supabase: SupabaseClient, key: string, data: any) => {
    const { error } = await supabase
        .from('api_cache')
        .upsert({
            key,
            data,
            updated_at: new Date().toISOString()
        })

    if (error) console.error('Cache set error:', error)
}
