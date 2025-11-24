import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User, AuthError, Session } from "@supabase/supabase-js";
import { jwtDecode } from "jwt-decode";
import type { JwtPayload } from "jwt-decode";

type SupabaseJwtPayload = JwtPayload & {
  app_metadata: {
    role: string;
  };
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUser() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) throw error;

        if (session) {
          setSession(session);
          setUser(session.user);
          const decodedJwt = jwtDecode<SupabaseJwtPayload>(
            session.access_token
          );
          setRole(decodedJwt.app_metadata.role);
        }
      } catch (error) {
        setError(error as AuthError);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return { loading, error, session, user, role };
}
