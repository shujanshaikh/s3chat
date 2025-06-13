import { UserButton, SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export function UserMenu() {
  return (
    <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-purple-900/90 to-purple-800/90 rounded-xl shadow-lg border border-purple-700/30 backdrop-blur-sm">
      <div className="relative group">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
        <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none shadow-lg z-10">
          Account
        </span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-purple-700/50"></div>

      {/* Sign out button */}
      <SignOutButton>
        <button
          className="flex items-center justify-items-stretch gap-1.5 px-6 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-purple-900/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 focus:ring-offset-purple-900"
          aria-label="Sign out"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </SignOutButton>
    </div>
  );
}