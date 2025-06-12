import { useQuery } from "convex/react";
import { NavLink, Outlet } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { NewChatButton } from "./NewChatButton";

export default function ChatLayout() {
  const threads = useQuery(api.threads.getThreads);

  return (
    <div className="flex h-dvh flex-row-reverse">
      {/* Sidebar */}
      <div className="flex w-72 flex-col border-l border-gray-800 bg-[#111] p-4">
        <h1 className="mb-4 font-semibold text-white justify-center items-center flex self-center text-xl">S3.Chat</h1>
        <NewChatButton />
        <nav className="mt-6 flex-1 space-y-2 overflow-y-auto">
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
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}