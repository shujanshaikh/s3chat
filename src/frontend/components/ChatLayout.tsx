import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { NavLink, Outlet, useParams } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { NewChatButton } from "./NewChatButton";
import { UserMenu } from "./auth/UserMenu";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { useMessageSummary } from "../hooks/useMessageSummary";
import { Id } from "../../../convex/_generated/dataModel";

export default function ChatLayout() {
  const threads = useQuery(api.threads.getThreads);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const processedThreadsRef = useRef(new Set<string>());
  const { threadId: currentThreadId } = useParams<{
    threadId: Id<"threads">;
  }>();

  const messageSummary = useQuery(api.messages.getMessages, {
    threadId: currentThreadId!,
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
      const menuButton = document.getElementById("mobile-menu-button");

      if (
        sidebar &&
        menuButton &&
        !sidebar.contains(e.target as Node) &&
        !menuButton.contains(e.target as Node)
      ) {
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
    if (!currentThreadId || !messageSummary || messageSummary.length === 0 || isLoading) {
      return;
    }
  
    const currentThread = threads?.find((t) => t._id === currentThreadId);
    if (
      currentThread && 
      (!currentThread.title || currentThread.title === "New Chat") &&
      !processedThreadsRef.current.has(currentThreadId) &&
      messageSummary.length > 0
    ) {
      const firstUserMessage = messageSummary.find((m) => m.role === "user");
  
      if (firstUserMessage) {
        processedThreadsRef.current.add(currentThreadId);
        
        const formatMessage = messageSummary.map((m) => ({
          role: m.role,
          content: m.content,
        }));
  
        const lastMessage = messageSummary[messageSummary.length - 1];
        const lastMessageId = lastMessage._id;
  
        const conversationSummary = formatMessage
          .slice(0, 5)
          .map(msg => `${msg.role}: ${msg.content}`)
          .join('\n');
  
        complete(conversationSummary, {
          body: {
            threadId: currentThreadId,
            messageId: lastMessageId,
            isTitle: true,
          }
        });
      }
    }
  }, [currentThreadId, messageSummary?.length, threads?.length]); // More specific dependencies
  
  // Clean up processed threads when component unmounts or thread changes
  useEffect(() => {
    return () => {
      processedThreadsRef.current.clear();
    };
  }, []);

  return (
    <div className="flex h-dvh flex-row-reverse relative">
      {/* Mobile Top Bar */}
      {isMobile && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#2b2832]/95 backdrop-blur-sm border-b border-purple-900/20 px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                  color: "#d6b4d8",
                }}
                className="text-lg sm:text-xl tracking-tight"
              >
                S3.chat
              </h1>
            </div>
            <button
              id="mobile-menu-button"
              className="bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 shadow-lg hover:bg-purple-700 transition-colors touch-manipulation"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Open menu"
            >
              <Menu size={20} className="text-purple-300" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {(!collapsed || (isMobile && sidebarOpen)) && (
        <div
          id="mobile-sidebar"
          className={`
            ${isMobile ? "fixed" : "relative"} 
            flex flex-col border-purple-900 bg-[#2f2f32] border-2 p-3 sm:p-4 w-64 sm:w-72 min-w-[16rem] sm:min-w-[18rem] transition-all duration-300
            ${isMobile ? "inset-y-0 right-0 z-50 pt-16" : ""}
            ${
              isMobile
                ? sidebarOpen
                  ? "translate-x-0"
                  : "translate-x-full"
                : ""
            }
            ${isMobile ? "max-w-[80vw] min-w-[280px]" : ""}
          `}
        >
          {/* Desktop Close Button */}
          {!isMobile && (
            <button
              className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10 bg-gray-900 rounded-full p-1 hover:bg-purple-700 transition touch-manipulation"
              onClick={handleSidebarToggle}
              title="Collapse sidebar (Ctrl+B)"
            >
              <ChevronRight size={18} className="sm:size-5" />
            </button>
          )}

          {/* Mobile Close Button */}
          {isMobile && (
            <button
              className="absolute top-2 right-3 z-10 bg-gray-900 rounded-full p-1.5 hover:bg-purple-700 transition touch-manipulation"
              onClick={handleSidebarToggle}
              title="Close sidebar"
            >
              <X size={18} />
            </button>
          )}

          {/* Logo - Desktop Only */}
          {!isMobile && (
            <h1
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                color: "#d6b4d8",
              }}
              className="mb-3 sm:mb-4 flex self-center text-lg sm:text-xl xl:text-2xl transition-all duration-300 tracking-tight"
            >
              S3.chat
            </h1>
          )}

          {/* New Chat Button */}
          <div className="mt-2 sm:mt-0">
            <NewChatButton />
          </div>

          {/* Threads List */}
          <nav className="mt-4 sm:mt-6 flex-1 space-y-1.5 sm:space-y-2 overflow-y-auto transition-all duration-300 pr-1">
            {threads?.map((thread) => (
              <NavLink
                key={thread._id}
                to={`/chat/${thread._id}`}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={({ isActive }) =>
                  ` rounded-md px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700/50 touch-manipulation min-h-[40px] sm:min-h-[44px] flex items-center ${
                    isActive ? "bg-purple-500/20 text-white" : ""
                  }`
                }
              >
                <div className="truncate leading-tight">
                  {thread.title || "New Chat"}
                </div>
              </NavLink>
            ))}
            {threads?.length === 0 && (
              <div className="text-xs sm:text-sm text-gray-500 text-center py-4">
                No chats yet
              </div>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex flex-col gap-2 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-700/50">
            <UserMenu />
          </div>
        </div>
      )}

      {/* Desktop Floating Expand Button */}
      {!isMobile && collapsed && (
        <button
          className="fixed top-4 sm:top-6 right-4 sm:right-6 z-30 bg-gray-900 rounded-full p-2 sm:p-2.5 shadow-lg hover:bg-purple-700 transition-colors touch-manipulation"
          onClick={() => setCollapsed(false)}
          title="Expand sidebar (Ctrl+B)"
        >
          <ChevronLeft size={20} className="sm:size-6 text-purple-300" />
        </button>
      )}

      {/* Main Content */}
      <main className={`flex-1 relative ${isMobile ? "pt-12 sm:pt-14" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}
