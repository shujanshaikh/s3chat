import { SignInButton, SignUpButton } from "@clerk/nextjs";

export function UnauthenticatedLayout() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-indigo-950/30 px-4">
      <div className="w-full max-w-sm bg-zinc-800/60 backdrop-blur-md border border-zinc-700/30 p-8 rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 
            className="text-3xl font-bold text-white mb-2 tracking-tight"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
            }}
          >
            S3.chat
          </h1>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
            Connect with AI assistants
          </p>
          
          <div className="space-y-4">
            <SignInButton>
              <button className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-medium hover:scale-[1.02] shadow-lg hover:shadow-indigo-500/25">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </SignInButton>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-700/40" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-800/60 px-2 text-zinc-500">or</span>
              </div>
            </div>
            
            <SignUpButton>
              <button className="w-full px-4 py-3 bg-zinc-700/60 hover:bg-zinc-700/80 border border-zinc-600/40 hover:border-indigo-500/40 text-zinc-200 hover:text-white rounded-xl transition-all duration-200 flex items-center justify-center gap-3 font-medium hover:scale-[1.02]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Create Account
              </button>
            </SignUpButton>
          </div>
          
          <p className="text-zinc-500 text-xs mt-6 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
