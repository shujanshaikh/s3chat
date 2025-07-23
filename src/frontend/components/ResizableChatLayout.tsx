import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { UserMenu } from "./auth/UserMenu";
import { ChevronLeft, Menu, X, Search, Plus } from "lucide-react";
import { Chat } from "./Chat";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "./ui/resizable";
import { UIMessage } from "@ai-sdk/ui-utils";
import { Button } from "./ui/button";

interface ResizableChatLayoutProps {
  threadId: string;
  initialMessages: Array<UIMessage>;
}

export default function ResizableChatLayout({ threadId, initialMessages }: ResizableChatLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const threads = useQuery(api.threads.getThreads);

  // Effect to highlight current thread in sidebar
  useEffect(() => {
    if (threads && threads.length > 0 && !threadId) {
      // If no thread is selected but threads exist, navigate to the first thread
      navigate(`/chat/${threads[0].threadId}`, { replace: true });
    }
  }, [threads, threadId, navigate]);

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

  const handleNewChat = () => {
    navigate("/", { replace: true });
    setSidebarOpen(false);
  };

  const handleThreadSelect = (threadId: string) => {
    navigate(`/chat/${threadId}`);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Group threads by time
  const groupThreadsByTime = () => {
    if (!threads) return { today: [], yesterday: [], lastWeek: [], older: [] };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const filtered = threads.filter(
      (thread: any) =>
        thread.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery === ""
    );

    return filtered.reduce(
      (groups: any, thread: any) => {
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
            <button
              key={thread.threadId}
              onClick={() => handleThreadSelect(thread.threadId)}
              className={`w-full text-left block rounded-md px-3 py-2 text-sm transition-colors hover:bg-indigo-700/50 touch-manipulation ${
                thread.threadId === threadId
                  ? "bg-indigo-500/20 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <div className="truncate">{thread.title || "New Chat"}</div>
            </button>
          ))}
        </div>
      </div>
    );
  };

 
  if (isMobile) {
    return (
      <div className="flex h-dvh relative">
      
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

       
        {sidebarOpen && (
          <div
            id="mobile-sidebar"
            className="fixed inset-0 z-40 flex w-full flex-col bg-gray-800/70 backdrop-blur-md shadow-2xl"
          >
            <div className="flex items-center justify-between p-4">
              <h1
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                }}
                className="text-2xl tracking-tight bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent"
              >
                S3.chat
              </h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col h-full p-4 pt-12">
              <div className="mb-4">
                <Button 
                  onClick={handleNewChat}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 border-0 flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  New Chat
                </Button>
              </div>

              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400/70" />
                <input
                  type="text"
                  placeholder="Search your threads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm bg-gray-800/30 text-gray-300 border-b border-gray-600/20 focus:outline-none focus:border-b-indigo-500 transition-colors"
                />
              </div>

            
              <nav className="flex-1 overflow-y-auto no-scrollbar">
                {renderThreadGroup("Today", threadGroups.today)}
                {renderThreadGroup("Yesterday", threadGroups.yesterday)}
                {renderThreadGroup("Last 7 Days", threadGroups.lastWeek)}
                {renderThreadGroup("Older", threadGroups.older)}

                {threads && threads.length === 0 && (
                  <div className="text-sm text-indigo-300 text-center py-8">
                    No chats yet
                  </div>
                )}
              </nav>

            
              <div className="mt-4 pt-4 border-t border-zinc-700/50">
                <UserMenu />
              </div>
            </div>
          </div>
        )}

      
        {!sidebarOpen && (
          <button
            className="fixed top-4 right-4 z-30 bg-gradient-to-b from-indigo-500/20 to-indigo-500/40 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-indigo-700/80 transition-colors touch-manipulation"
            onClick={() => setSidebarOpen(true)}
            title="Open sidebar"
          >
            <Menu size={20} className="text-indigo-300" />
          </button>
        )}

   
        <div className="flex-1">
          <Chat threadId={threadId} initialMessages={initialMessages} />
        </div>
      </div>
    );
  }


  return (
    <div className="h-dvh">
      <ResizablePanelGroup direction="horizontal" className="h-full">
   
        <ResizablePanel defaultSize={10} minSize={20} maxSize={60}>
          <div className="flex flex-col h-full bg-gray-800/70 backdrop-blur-md shadow-2xl">
         
            <div className="p-4">
              <h1
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 700,
                }}
                className="text-2xl tracking-tight text-center bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent"
              >
                S3.chat
              </h1>
            </div>

         
            <div className="p-4">
              <Button 
                onClick={handleNewChat}
                className="w-full bg-indigo-600/30 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
              >
                <span className="font-semibold">New Chat</span>
              </Button>
            </div>

           
            <div className="relative mb-4 px-4">
              <Search size={16} className="absolute left-7 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search your threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md pl-10 pr-4 py-2 text-sm bg-gray-800/50 text-gray-300 border border-gray-600/30 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

         
            <nav className="flex-1 overflow-y-auto no-scrollbar px-4">
              {renderThreadGroup("Today", threadGroups.today)}
              {renderThreadGroup("Yesterday", threadGroups.yesterday)}
              {renderThreadGroup("Last 7 Days", threadGroups.lastWeek)}
              {renderThreadGroup("Older", threadGroups.older)}

              {threads && threads.length === 0 && (
                <div className="text-sm text-indigo-300 text-center py-8">
                  No chats yet
                </div>
              )}
            </nav>

          
            <div className="mt-4 px-4 pb-4">
              <UserMenu />
            </div>
          </div>
        </ResizablePanel>

     
        <ResizableHandle withHandle={false} className="border-0 bg-transparent hover:bg-gray-600/20 transition-colors" />

      
        <ResizablePanel defaultSize={70} minSize={30}>
          <Chat threadId={threadId} initialMessages={initialMessages} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
} 