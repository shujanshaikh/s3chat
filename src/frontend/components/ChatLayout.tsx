import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { NavLink, Outlet } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { NewChatButton } from "./NewChatButton";
import { UserMenu } from "./auth/UserMenu";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ChatLayout() {
  const threads = useQuery(api.threads.getThreads);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-dvh flex-row-reverse">
      {/* Sidebar */}
      {!collapsed && (
        <div
          className="relative flex flex-col border-purple-900 bg-[#2f2f32] border-2 p-4 w-72 min-w-[18rem] transition-all duration-300"
        >
          {/* Collapse Button */}
          <button
            className="absolute top-4 right-4 z-10 bg-gray-900 rounded-full p-1 hover:bg-purple-700 transition"
            onClick={() => setCollapsed(true)}
            title="Collapse sidebar (Ctrl+B)"
          >
            <ChevronRight size={20} />
          </button>

          {/* Logo */}
          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              color: "#d6b4d8",
            }}
            className="mb-4 flex self-center text-2xl transition-all duration-300 tracking-tight"
          >
            S3.chat
          </h1>

          {/* New Chat Button */}
          <NewChatButton />
          {/* Threads List */}
          <nav className="mt-6 flex-1 space-y-2 overflow-y-auto transition-all duration-300">
            {threads?.map((thread) => (
              <NavLink
                key={thread._id}
                to={`/chat/${thread._id}`}
                className={({ isActive }) =>
                  `block rounded-md px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700/50 ${
                    isActive ? "bg-purple-500/20 text-white" : ""
                  }`
                }
              >
                {thread.title || "New Chat"}
              </NavLink>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex flex-col gap-2 mt-4">
            <UserMenu />
          </div>
        </div>
      )}

      {/* Floating Expand Button */}
      {collapsed && (
        <button
          className="fixed top-6 right-6 z-50 bg-gray-900 rounded-full p-2 shadow-lg hover:bg-purple-700 transition"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar (Ctrl+B)"
        >
          <ChevronLeft size={24} className="text-purple-300" />
        </button>
      )}

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}