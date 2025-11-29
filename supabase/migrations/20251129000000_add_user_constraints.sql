-- Add foreign key constraint to auth.users
ALTER TABLE public.users
ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint to id (explicitly requested, though PK is already unique)
ALTER TABLE public.users
ADD CONSTRAINT users_id_key UNIQUE (id);

-- Add RLS policy for INSERT
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = id);
