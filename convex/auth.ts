// convex/auth.ts (SIMPLIFIED and CORRECTED)
import { Auth } from 'convex/server';

export async function getUser(auth: Auth) {
  // Convex's built-in auth (configured via convex.json) will have already
  // verified the token using the JWKS URL you provided in convex.json.
  const identity = await auth.getUserIdentity();

  if (!identity) {
    // User is not authenticated or token is invalid
    console.log('Clerk Auth: No identity found from Convex auth.getUserIdentity().');
    return null;
  }

  // The 'subject' (sub) claim from the JWT is typically the user ID for Clerk.
  const clerkUserId = identity.subject;

  if (!clerkUserId) {
    console.error('Clerk Auth: Clerk user ID (subject) not found in identity.');
    return null;
  }

  console.log('Clerk Auth: Successfully authenticated user:', clerkUserId);
  return clerkUserId; // This is the Clerk user ID
}