"use client";

import { useRouter } from "next/navigation";
import { signOut } from "./auth-store";

// Clears the signed-in state and returns to the landing page.
export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        signOut();
        router.push("/");
      }}
    >
      Sign out
    </button>
  );
}
