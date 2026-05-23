"use client";

import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";

export function MobileHeaderAuth() {
  const { isSignedIn } = useAuth();

  return isSignedIn ? (
    <UserButton />
  ) : (
    <SignInButton mode="modal">
      <button type="button" className="btn btn-primary text-xs px-3 py-2">
        Sign In
      </button>
    </SignInButton>
  );
}
