// components/auth/UnauthenticatedLayout.tsx
import { Unauthenticated } from "convex/react";
import { SignInButton } from "@clerk/nextjs";

export function UnauthenticatedLayout() {
  return (
    <Unauthenticated>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-purple-900">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome to S3.Chat</h2>
          <p className="text-gray-300 mb-6">Sign in to start chatting!</p>
          <SignInButton>
            <button className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
              Sign In
            </button>
          </SignInButton>
        </div>
      </div>
    </Unauthenticated>
  );
}