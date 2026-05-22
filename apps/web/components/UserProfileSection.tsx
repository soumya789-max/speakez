'use client';

import { useAuth, SignInButton, UserButton } from "@clerk/nextjs";

export function UserProfileSection() {
  const { isSignedIn } = useAuth();

  return (
    <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
      {isSignedIn ? (
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.75rem",
          padding: "0.5rem",
          borderRadius: "8px",
          background: "var(--surface-2)"
        }}>
          <UserButton />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-1)" }}>
              Profile
            </div>
          </div>
        </div>
      ) : (
        <SignInButton mode="modal">
          <button style={{
            width: "100%",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            background: "var(--primary)",
            color: "white",
            border: "none",
            fontWeight: 500,
            cursor: "pointer"
          }}>
            Sign In
          </button>
        </SignInButton>
      )}

      <div style={{ fontSize: "0.7rem", color: "var(--text-3)", letterSpacing: "0.04em", marginTop: "0.5rem" }}>
        SPEAKEZ v0.1
      </div>
    </div>
  );
}
