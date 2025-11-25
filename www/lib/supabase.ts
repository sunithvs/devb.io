import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials are missing. Some features may not work.')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client (for API routes and server components)
export const createServerClient = () => {
    const url = process.env.SUPABASE_URL || ''
    const key = process.env.SUPABASE_KEY || ''

    if (!url || !key) {
        throw new Error('Missing Supabase environment variables')
    }

    return createClient(url, key)
}
