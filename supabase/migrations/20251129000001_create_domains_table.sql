-- Create domains table
CREATE TABLE public.domains (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    subdomain text UNIQUE NOT NULL,
    custom_domain text UNIQUE,
    custom_domain_verified boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id) -- One domain record per user for now
);

-- Enable RLS
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_domains_user_id ON public.domains(user_id);
CREATE INDEX idx_domains_subdomain ON public.domains(subdomain);
CREATE INDEX idx_domains_custom_domain ON public.domains(custom_domain);

-- Policies
CREATE POLICY "Public domains are viewable by everyone"
    ON public.domains FOR SELECT
    USING (true);

CREATE POLICY "Users can insert their own domain"
    ON public.domains FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own domain"
    ON public.domains FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own domain"
    ON public.domains FOR DELETE
    USING (auth.uid() = user_id);

-- Migrate existing usernames to subdomains
INSERT INTO public.domains (user_id, subdomain)
SELECT id, username
FROM public.users
ON CONFLICT (user_id) DO NOTHING;
