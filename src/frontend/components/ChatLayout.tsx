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
      if ((e.ctrlKey || e.metaKey) && e.key.toLocaleLowerCase() === "b") {
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
      <div
        className={`relative flex flex-col border-l border-gray-800 bg-[#111] p-4 transition-all duration-300
          ${collapsed ? "w-16 min-w-[4rem]" : "w-72 min-w-[18rem]"}
        `}
      >
        {/* Collapse Button */}
        <button
          className="absolute top-4 right-4 z-10 bg-gray-900 rounded-full p-1 hover:bg-purple-700 transition"
          onClick={() => setCollapsed((c) => !c)}
          title={
            collapsed ? "Expand sidebar (Ctrl+B)" : "Collapse sidebar (Ctrl+B)"
          }
        >
          {collapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Logo */}
        <h1
  style={{
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 700,
    color: "#d6b4d8", // or use Tailwind's text-purple-300
  }}
  className={`mb-4 flex self-center text-2xl transition-all duration-300 tracking-tight ${
    collapsed ? "scale-0 h-0 mb-0" : "scale-100 h-auto"
  }`}
>
  S3.chat
</h1>

        {/* New Chat Button */}
        {!collapsed && <NewChatButton />}

        {/* Threads List */}
        <nav
          className={`mt-6 flex-1 space-y-2 overflow-y-auto transition-all duration-300 ${
            collapsed
              ? "opacity-0 pointer-events-none h-0"
              : "opacity-100 h-auto"
          }`}
        >
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

        {/* User Menu - Only show when not collapsed */}
        {!collapsed && (
          <div className="flex flex-col gap-2 mt-4">
            <UserMenu />
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
