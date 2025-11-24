import "server-only";

import { JWTPayload, jwtVerify } from "jose";

import { createClient } from "@/lib/supabase/server";

// Extend the JWTPayload type to include Supabase-specific metadata
type SupabaseJwtPayload = JWTPayload & {
  app_metadata: {
    role: string;
  };
};

export async function getUserRole() {
  // Create a Supabase client for server-side operations
  const supabase = createClient();

  // Retrieve the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let role;

  if (session) {
    // Extract the access token from the session
    const token = session.access_token;

    try {
      // Encode the JWT secret for verification
      const secret = new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET);

      // Verify the JWT token and extract the payload
      const { payload } = await jwtVerify<SupabaseJwtPayload>(token, secret);

      // Extract the role from the app_metadata in the payload
      role = payload.app_metadata.role;
    } catch (error) {
      console.error("Failed to verify token:", error);
    }
  }

  return role;
}
