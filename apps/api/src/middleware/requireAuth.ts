import { Request, Response, NextFunction } from "express";

/**
 * Middleware to require authentication on a route.
 * Use this on routes that MUST have a logged-in user.
 * 
 * Example usage:
 * router.post("/sessions", requireAuth, (req, res) => {
 *   const userId = req.auth.userId; // guaranteed to exist
 *   // ... your logic
 * });
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // @ts-ignore - Clerk adds auth to request object
  const { userId } = req.auth;

  if (!userId) {
    return res.status(401).json({ 
      error: "unauthorized",
      message: "You must be logged in to access this resource" 
    });
  }

  next();
}

/**
 * Get the current authenticated user ID from the request.
 * Returns null if not authenticated.
 * 
 * Example usage:
 * const userId = getUserId(req);
 * if (userId) {
 *   // User is logged in
 * } else {
 *   // User is not logged in
 * }
 */
export function getUserId(req: Request): string | null {
  // @ts-ignore - Clerk adds auth to request object
  return req.auth?.userId ?? null;
}

/**
 * Get the full auth object from the request.
 * Returns null if not authenticated.
 * 
 * The auth object contains:
 * - userId: string - The user's ID
 * - sessionId: string - The current session ID
 * - orgId: string | null - Organization ID (if using Clerk organizations)
 * - getToken: () => Promise<string> - Get the session token
 */
export function getAuth(req: Request) {
  // @ts-ignore - Clerk adds auth to request object
  return req.auth ?? null;
}
