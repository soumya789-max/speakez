'use client';

import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";

export function MobileHeaderAuth() {
  const { isSignedIn } = useAuth();

  return isSignedIn ? (
    <UserButton />
  ) : (
    <SignInButton mode="modal">
      <button style={{
        padding: "0.4rem 0.8rem",
        borderRadius: "6px",
        background: "var(--primary)",
        color: "white",
        border: "none",
        fontSize: "0.85rem",
        fontWeight: 500,
        cursor: "pointer"
      }}>
        Sign In
      </button>
    </SignInButton>
  );
}
