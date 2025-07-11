import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { UserMenu } from "./auth/UserMenu";
import { ChevronLeft, Menu, X, Search } from "lucide-react";
import { useMessageSummary } from "../hooks/useMessageSummary";
import { NewChatButton } from "./NewChatButton";

export default function ChatLayout() {
  const threads = useQuery(api.threads.getThreads);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const processedThreadsRef = useRef(new Set<string>());
  const { threadId } = useParams();

  const messageSummary = useQuery(api.messages.getMessages, {
    threadId: threadId!,
  });

  const { complete, isLoading } = useMessageSummary();

  // Check if mobile and handle resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
        setSidebarOpen(false);
      } else {
        setCollapsed(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        if (isMobile) {
          setSidebarOpen(!sidebarOpen);
        } else {
          setCollapsed(!collapsed);
        }
      }
    };

    document.addEventListener("keydown", handleKeyboard);
    return () => document.removeEventListener("keydown", handleKeyboard);
  }, [collapsed, sidebarOpen, isMobile]);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    if (!isMobile || !sidebarOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.getElementById("mobile-sidebar");

      if (sidebar && !sidebar.contains(e.target as Node)) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, sidebarOpen]);

  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  useEffect(() => {
    if (!threadId || !messageSummary || !messageSummary.length || isLoading) {
      return;
    }

    const currentThread = threads?.find((t) => t.threadId === threadId);
    if (
      currentThread &&
      (!currentThread.title || currentThread.title === "New Chat") &&
      !processedThreadsRef.current.has(threadId) &&
      messageSummary.length > 0
    ) {
      const firstUserMessage = messageSummary.find((m) => m.role === "user");

      if (firstUserMessage) {
        processedThreadsRef.current.add(threadId);

        const formatMessage = messageSummary.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const lastMessage = messageSummary[messageSummary.length - 1];
        const lastMessageId = lastMessage._id;

        const conversationSummary = formatMessage
          .slice(0, 5)
          .map((msg) => `${msg.role}: ${msg.content}`)
          .join("\n");

        complete(conversationSummary, {
          body: {
            threadId: threadId,
            messageId: lastMessageId,
            isTitle: true,
          },
        });
      }
    }
  }, [threadId, messageSummary?.length, threads?.length, complete, isLoading]);

  // Clean up processed threads when component unmounts or thread changes
  useEffect(() => {
    return () => {
      processedThreadsRef.current.clear();
    };
  }, []);

  // Group threads by time
  const groupThreadsByTime = () => {
    if (!threads) return { today: [], yesterday: [], lastWeek: [], older: [] };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const filtered = threads.filter(
      (thread) =>
        thread.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery === ""
    );

    return filtered.reduce(
      (groups, thread) => {
        const threadDate = new Date(thread._creationTime);

        if (threadDate >= today) {
          groups.today.push(thread);
        } else if (threadDate >= yesterday) {
          groups.yesterday.push(thread);
        } else if (threadDate >= lastWeek) {
          groups.lastWeek.push(thread);
        } else {
          groups.older.push(thread);
        }

        return groups;
      },
      {
        today: [] as any[],
        yesterday: [] as any[],
        lastWeek: [] as any[],
        older: [] as any[],
      }
    );
  };

  const threadGroups = groupThreadsByTime();

  const renderThreadGroup = (title: string, threads: any[]) => {
    if (threads.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-xs font-medium text-gray-500 mb-2 px-3">{title}</h3>
        <div className="space-y-1">
          {threads.map((thread) => (
            <NavLink
              key={thread.threadId}
              to={`/chat/${thread.threadId}`}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm transition-colors hover:bg-indigo-700/50 touch-manipulation ${
                  isActive
                    ? "bg-indigo-500/20 text-white"
                    : "text-gray-300 hover:text-white"
                }`
              }
            >
              <div className="truncate">{thread.title || "New Chat"}</div>
            </NavLink>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-dvh relative">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {(!collapsed || (isMobile && sidebarOpen)) && (
        <div
          id="mobile-sidebar"
          className={`
  ${isMobile ? "fixed bg-black/40" : "relative bg-gray-800/70"} 
  flex flex-col backdrop-blur-md shadow-2xl w-75 min-w-[18rem] transition-all duration-300 no-scrollbar
  ${isMobile ? "inset-y-0 right-0 z-999 pt-16" : ""}
  ${isMobile ? (sidebarOpen ? "translate-x-0" : "translate-x-full") : ""} 
  ${isMobile ? "max-w-[80vw]" : ""}
`}
        >
          {/* Desktop Close Button */}
          {!isMobile && (
            <button
              className="absolute top-4 left-4 z-10 bg-indigo-900/10 rounded-full p-1.5 hover:bg-indigo-700 transition-colors touch-manipulation"
              onClick={handleSidebarToggle}
              title="Collapse sidebar (Ctrl+B)"
            >
              <ChevronLeft size={16} className="text-gray-400" />
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              className="absolute top-2 left-3 z-10 bg-indigo-900 rounded-full p-1.5 hover:bg-indigo-700 transition-colors touch-manipulation"
              onClick={handleSidebarToggle}
              title="Close sidebar"
            >
              <X size={18} className="text-gray-400" />
            </button>
          )}

          <div className="flex flex-col h-full p-4">
            {/* Logo - Desktop Only */}
            {!isMobile && (
              <h1
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                }}
                className="mb-4 text-2xl tracking-tight text-center text-gradient-to-r from-indigo-900 to-indigo-300"
              >
                S3.chat
              </h1>
            )}

            {/* New Chat Button */}
            <div className="mb-4">
              <NewChatButton />
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search your threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md pl-10 pr-4 py-2 text-sm text-gray-300 focus:outline-none focus:ring-1 "
              />
            </div>

            {/* Threads List */}
            <nav className="flex-1 overflow-y-auto no-scrollbar">
              {renderThreadGroup("Today", threadGroups.today)}
              {renderThreadGroup("Yesterday", threadGroups.yesterday)}
              {renderThreadGroup("Last 7 Days", threadGroups.lastWeek)}
              {renderThreadGroup("Older", threadGroups.older)}

              {threads?.length === 0 && (
                <div className="text-sm text-indigo-300 text-center py-8">
                  No chats yet
                </div>
              )}
            </nav>

            {/* User Menu */}
            <div className="mt-4 pt-4 border-t border-zinc-700/50">
              <UserMenu />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Floating Expand Button */}
      {!isMobile && collapsed && (
        <button
          className="fixed top-6 left-6 z-30 bg-gradient-to-b from-indigo-500/10 to-indigo-500/30 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:bg-indigo-700/80 transition-colors touch-manipulation"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar (Ctrl+B)"
        >
          <ChevronLeft size={10} className="text-indigo-300" />
        </button>
      )}

      {/* Mobile Floating Menu Button */}
      {isMobile && !sidebarOpen && (
        <button
          className="fixed top-4 right-4 z-30 bg-gradient-to-b from-indigo-500/20 to-indigo-500/40 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-indigo-700/80 transition-colors touch-manipulation"
          onClick={() => setSidebarOpen(true)}
          title="Open sidebar"
        >
          <Menu size={20} className="text-indigo-300" />
        </button>
      )}

      {/* Main Content */}
      <main className="flex-1 relative">
        <Outlet />
      </main>
    </div>
  );
}
