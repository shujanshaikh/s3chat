
"use client";

import { Authenticated, Unauthenticated } from 'convex/react';
import { SignInButton } from '@clerk/nextjs';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  fallback 
}: ProtectedRouteProps) {
  return (
    <>
      <Authenticated>
        {children}
      </Authenticated>
      <Unauthenticated>
        {fallback || (
          <div className="p-4 text-center">
            <h2 className="text-xl mb-4">Authentication Required</h2>
            <SignInButton />
          </div>
        )}
      </Unauthenticated>
    </>
  );
}