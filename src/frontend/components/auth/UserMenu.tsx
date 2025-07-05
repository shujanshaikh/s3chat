import { UserButton, SignOutButton } from "@clerk/nextjs";
import { LogOut, Settings } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export function UserMenu() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-3 p-2.5  bg-none rounded-xl shadow-lg border-none backdrop-blur-sm">
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
      <div className="h-6 w-px bg-none"></div>

      {/* Sign out button */}
      <SignOutButton redirectUrl="/">
        <button
          className="flex items-center justify-items-stretch gap-1.5 px-6 py-1.5 text-sm font-medium text-white bg-none rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-orange-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:ring-offset-orange-900"
          aria-label="Sign out"
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </SignOutButton>

      <button
        className="flex items-center justify-items-stretch gap-1.5 px-2 py-1.5 text-sm font-medium text-white bg-none rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-orange-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:ring-offset-orange-900"
        onClick={() => navigate("/setting")}
      >
        <Settings className="text-white" size={16} />
      </button>
    </div>
  );
}
