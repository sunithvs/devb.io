"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export function SignInButton() {
  const pathname = usePathname();

  return pathname !== "/signin" ? (
    <Link
      href="/signin"
      className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
    >
      <Icons.logIn className="mr-2 size-3.5" />
      Sign in
    </Link>
  ) : null;
}
