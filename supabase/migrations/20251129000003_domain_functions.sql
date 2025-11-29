-- Function to check if a domain is available
-- Returns true if available, false if taken
CREATE OR REPLACE FUNCTION public.check_domain_availability(
    requested_domain text,
    current_user_id uuid DEFAULT null
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- 1. Check reserved domains
    IF EXISTS (SELECT 1 FROM public.reserved_domains WHERE domain = lower(requested_domain)) THEN
        RETURN false;
    END IF;

    -- 2. Check existing subdomains in domains table
    -- Exclude the current user's own domain from the check if current_user_id is provided
    IF EXISTS (
        SELECT 1 
        FROM public.domains 
        WHERE subdomain = lower(requested_domain)
        AND (current_user_id IS NULL OR user_id != current_user_id)
    ) THEN
        RETURN false;
    END IF;

    -- 3. Check existing usernames in users table (legacy check, just in case)
    IF EXISTS (
        SELECT 1 
        FROM public.users 
        WHERE username = lower(requested_domain)
        AND (current_user_id IS NULL OR id != current_user_id)
    ) THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;

-- Function to get username by domain (for custom domain resolution)
-- Returns the username associated with the custom domain
CREATE OR REPLACE FUNCTION public.get_username_by_domain(
    lookup_domain text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    found_username text;
BEGIN
    SELECT subdomain INTO found_username
    FROM public.domains
    WHERE custom_domain = lower(lookup_domain)
    AND custom_domain_verified = true;

    RETURN found_username;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.check_domain_availability TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_username_by_domain TO anon, authenticated, service_role;
