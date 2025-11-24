"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

import { Icons } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [isGitHubLoading, setIsGitHubLoading] = useState<boolean>(false);
  const supabase = createClient();

  const searchParams = useSearchParams();

  const next = searchParams.get("next");

  async function signInWithGitHub() {
    setIsGitHubLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""
            }`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      toast({
        title: "Please try again.",
        description: "There was an error logging in with GitHub.",
        variant: "destructive",
      });
      setIsGitHubLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={signInWithGitHub}
      disabled={isGitHubLoading}
    >
      {isGitHubLoading ? (
        <Icons.loaderCircle className="mr-2 size-4 animate-spin" />
      ) : (
        <Icons.gitHub className="mr-2 size-6" />
      )}{" "}
      Sign in with GitHub
    </Button>
  );
}
