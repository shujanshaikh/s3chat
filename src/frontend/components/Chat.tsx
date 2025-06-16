import {
  DEFAULT_MODEL,
  groupModelsByProvider,
  getModelInfo,
} from "@/lib/models";
import { Message, useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import MemoizedMarkdown from "./MemorizedMarkdown";
import MessageBox from "./Message-box";

export default function Chat(props: { threadId: Id<"threads"> }) {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { threadId } = props;

  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const initialMessages = useQuery(api.messages.getMessages, {
    threadId: threadId!,
  });
  const createMessage = useMutation(api.messages.createMessage);

  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    isLoading, 
    stop 
  } = useChat({
    initialMessages: initialMessages?.map((message) => ({
      id: message._id,
      role: message.role,
      content: message.content,
    })),
    body: { model: selectedModel },
    onFinish: async (message: Message) => {
      await createMessage({
        threadId: threadId!,
        role: "assistant",
        content: message.content,
        model: selectedModel,
      });
    },
  });

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await createMessage({
      threadId: threadId!,
      role: "user",
      content: input,
      model: selectedModel,
    });

    handleSubmit(e);
  };

  const handleStop = () => {
    stop();
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 20;
      setShowScrollButton(!isAtBottom);
    }
  };

  // Auto-scroll to bottom when new messages arrive or when streaming
  useEffect(() => {
    if (isLoading || messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  useEffect(() => {
    handleScroll();
  }, []);

  const LoadingDots = () => (
    <div className="flex items-center gap-1 px-2 py-1">
      <div className="size-1.5 animate-[bounce_1s_infinite_-0.3s] rounded-full bg-gray-400"></div>
      <div className="size-1.5 animate-[bounce_1s_infinite_-0.15s] rounded-full bg-gray-400"></div>
      <div className="size-1.5 animate-[bounce_1s_infinite] rounded-full bg-gray-400"></div>
    </div>
  );

  const groupedModels = groupModelsByProvider();
  const currentModel = getModelInfo(selectedModel);

  return (
    <div className="flex h-dvh flex-col bg-[#2b2832] relative min-h-screen">
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-6 scroll-smooth"
        style={{ paddingBottom: '140px' }} // Reserve space for MessageBox
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:gap-8">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ease-out ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {message.role === "user" ? (
                // --- USER MESSAGE STYLING ---
                <div className="max-w-[85%] sm:max-w-[80%] p-1 sm:p-2">
                  <div className="relative rounded-xl sm:rounded-2xl bg-[#51495f] px-3 sm:px-5 py-3 sm:py-4 text-white">
                    <div className="whitespace-pre-wrap break-words text-pretty text-gray-100 text-sm sm:text-base leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </div>
              ) : (
                // --- ASSISTANT MESSAGE STYLING ---
                <div className="flex w-full max-w-full items-start gap-2 sm:gap-4 pl-2 sm:pl-4">
                  <div className="min-w-0 flex-1 prose prose-invert max-w-none text-gray-100 prose-p:text-gray-100 rounded-none">
                    <MemoizedMarkdown 
                      content={message.content}
                      id={message.id}
                      size="default"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Show loading dots only when starting a new conversation */}
          {isLoading && (
            <div className="flex animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ease-out justify-start">
              <div className="w-full">
                <div className="text-sm text-gray-400">
                  <LoadingDots />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <div className="absolute bottom-60 left-1/2 z-auto -translate-x-1/2">
            <button
              onClick={scrollToBottom}
              className="flex animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ease-out items-center gap-1 sm:gap-2 rounded-full bg-black/30 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-white backdrop-blur-sm transition-all hover:bg-black/50 touch-manipulation"
              aria-label="Scroll to bottom"
            >
              <span className="hidden xs:inline">Scroll to bottom</span>
              <span className="xs:hidden">↓</span>
              <svg
                className="size-3 sm:size-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* MessageBox Component - Positioned within the chat container */}
       
        <MessageBox 
          input={input}
          isLoading={isLoading}
          currentModel={currentModel}
          selectedModel={selectedModel}
          groupedModels={groupedModels}
          isDropdownOpen={isDropdownOpen}
          onInputChange={handleInputChange}
          onSubmit={handleFormSubmit}
          onStop={handleStop}
          onModelSelect={setSelectedModel}
          onDropdownToggle={() => setIsDropdownOpen(!isDropdownOpen)}
          onDropdownClose={() => setIsDropdownOpen(false)}
        />
    </div>
  );
}