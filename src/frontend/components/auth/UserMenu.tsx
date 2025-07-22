import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { LogOut, Settings, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function UserMenu() {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-3 p-2.5 bg-none rounded-xl">
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
      </div>
    );
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Error during sign out:", error);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-2.5 bg-none rounded-xl shadow-lg border-none backdrop-blur-sm">
      <div className="relative group">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
        <span className="absolute left-1/2 -bottom-8 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none shadow-lg z-10">
          {user?.fullName || "Account"}
        </span>
      </div>

      
      <div className="h-6 w-px bg-none"></div>

      
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="flex items-center justify-items-stretch gap-1.5 px-6 py-1.5 text-sm font-medium text-white bg-none rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-orange-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:ring-offset-orange-900 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Sign out"
      >
        {isSigningOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut size={16} />
        )}
        <span>{isSigningOut ? "Signing out..." : "Log Out"}</span>
      </button>

      <button
        className="flex items-center justify-items-stretch gap-1.5 px-2 py-1.5 text-sm font-medium text-white bg-none rounded-lg transition-all duration-200 hover:shadow-md hover:shadow-orange-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 focus:ring-offset-orange-900"
        onClick={() => navigate("/setting")}
      >
        <Settings className="text-white" size={16} />
      </button>
    </div>
  );
}
