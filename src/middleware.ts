import { clerkMiddleware } from '@clerk/nextjs/server'

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default clerkMiddleware();

export const config = {
  matcher: [
    // Exclude files with a "." followed by an extension, which are typically static files
    "/((?!.+\\.[\\w]+$|_next).*)",
    // But include all API routes except uploadthing
    "/api/((?!uploadthing).*)",
    // Skip static and public files
    "/((?!static|.*\\..*|_next|favicon.ico).*)",
  ],
};