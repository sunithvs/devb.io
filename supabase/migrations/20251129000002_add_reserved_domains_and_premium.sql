-- Create reserved_domains table
CREATE TABLE public.reserved_domains (
    domain text PRIMARY KEY,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reserved_domains ENABLE ROW LEVEL SECURITY;

-- Policies (Public Read)
CREATE POLICY "Reserved domains are viewable by everyone"
    ON public.reserved_domains FOR SELECT
    USING (true);

-- Add premium_until to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS premium_until timestamptz;

-- Insert initial reserved domains
INSERT INTO public.reserved_domains (domain) VALUES
    ('www'),
    ('api'),
    ('blog'),
    ('about'),
    ('admin'),
    ('support'),
    ('help'),
    ('editor'),
    ('app'),
    ('dev'),
    ('staging'),
    ('test'),
    ('auth'),
    ('login'),
    ('signup'),
    ('register'),
    ('dashboard'),
    ('settings'),
    ('profile'),
    ('home'),
    ('root'),
    ('mail'),
    ('email'),
    ('shop'),
    ('store'),
    ('status'),
    ('docs'),
    ('documentation'),
    ('legal'),
    ('privacy'),
    ('terms'),
    ('careers'),
    ('jobs'),
    ('contact');
