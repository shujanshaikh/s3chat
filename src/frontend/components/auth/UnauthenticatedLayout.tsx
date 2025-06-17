import { Unauthenticated } from "convex/react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";

export function UnauthenticatedLayout() {
  return (
    <Unauthenticated>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-950 to-purple-400">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
          <h2
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              color: "#d6b4d8",
            }}
            className="text-2xl font-bold text-white mb-4"
          >
            Welcome to S3.chat
          </h2>
          <p className="text-gray-300 mb-6">Login in with Google to start chatting!</p>
        <div className="flex flex-row gap-4 items-center justify-center">
        <SignUpButton>
            <button className="px-6 py-2 bg-gray-600 text-white  hover:bg-purple-700 transition rounded-2xl">
              Login in with Google
            </button>
          </SignUpButton>
        </div>
        </div>
      </div>
    </Unauthenticated>
  );
}
