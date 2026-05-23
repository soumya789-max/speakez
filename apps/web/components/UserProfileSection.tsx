"use client";

import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";

export function UserProfileSection() {
  const { isSignedIn } = useAuth();

  return (
    <div className="space-y-2">
      {isSignedIn ? (
        <div className="flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent">
          <UserButton />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              Profile
            </div>
          </div>
        </div>
      ) : (
        <SignInButton mode="modal">
          <button type="button" className="btn btn-primary w-full">
            Sign In
          </button>
        </SignInButton>
      )}
      <p className="text-xs text-muted-foreground font-medium tracking-wide">
        SPEAKEZ v0.1
      </p>
    </div>
  );
}
