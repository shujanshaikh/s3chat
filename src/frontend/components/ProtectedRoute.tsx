import { Authenticated, Unauthenticated } from 'convex/react';
import { SignInButton } from '@clerk/nextjs';
import { ReactNode } from 'react';
import { Lock, Shield } from 'lucide-react';

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
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-indigo-950/30 px-4">
            <div className="w-full max-w-md bg-zinc-800/60 backdrop-blur-md border border-zinc-700/30 p-8 rounded-2xl shadow-2xl">
              <div className="text-center">
                {/* Icon */}
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20">
                  <Shield className="w-8 h-8 text-indigo-400" />
                </div>
                
                {/* Title */}
                <h2 
                  className="text-2xl font-bold text-white mb-3 tracking-tight"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700,
                  }}
                >
                  Authentication Required
                </h2>
                
                {/* Description */}
                <p className="text-zinc-400 text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                  You need to sign in to access this page. Please authenticate to continue using S3.chat.
                </p>
                
                {/* Sign In Button */}
                <SignInButton>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-medium hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/25">
                    <Lock className="w-5 h-5" />
                    Sign In to Continue
                  </button>
                </SignInButton>
                
                {/* Additional Info */}
                <p className="text-zinc-500 text-xs mt-6 leading-relaxed">
                  Secure authentication powered by Clerk
                </p>
              </div>
            </div>
          </div>
        )}
      </Unauthenticated>
    </>
  );
}