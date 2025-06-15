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

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    handleScroll();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    <div className="flex h-dvh flex-col bg-[#2b2832]">
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="relative flex flex-1 flex-col gap-3 sm:gap-6 overflow-y-auto px-2 sm:px-4 py-3 sm:py-6 scroll-smooth pb-2 sm:pb-4"
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
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 z-10 -translate-x-1/2">
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

      {/* Floating Input - Fixed positioning */}
      <div className="flex-shrink-0 p-2 sm:p-4 pb-safe-bottom">
        <form onSubmit={handleFormSubmit} className="mx-auto max-w-4xl">
          <div className="relative flex flex-col rounded-xl sm:rounded-2xl border border-purple-400/20 bg-[#1a1a1a]/90 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-200 hover:border-purple-400/30 focus-within:border-purple-400/50 focus-within:shadow-purple-400/10 focus-within:ring-1 focus-within:ring-purple-400/30">
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder={`Ask ${currentModel?.name}...`}
              disabled={isLoading}
              rows={1}
              className="min-h-[44px] sm:min-h-[52px] max-h-28 sm:max-h-40 w-full flex-1 resize-none bg-transparent p-3 sm:p-4 pb-10 sm:pb-12 text-sm leading-5 sm:leading-6 text-gray-100 selection:bg-purple-400/30 placeholder:text-gray-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleFormSubmit(
                    e as unknown as React.FormEvent<HTMLFormElement>
                  );
                }
              }}
            />

            {/* Controls positioned absolutely within the container */}
            <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3" ref={dropdownRef}>
              {/* Drop-up Menu */}
              {isDropdownOpen && (
                <div className="absolute bottom-full mb-2 w-64 sm:w-72 origin-bottom-left rounded-xl border border-gray-700/50 bg-[#1a1a1a] shadow-2xl shadow-black/50 z-50 max-h-60 sm:max-h-80 overflow-y-auto">
                  {Object.entries(groupedModels).map(
                    ([provider, providerModels]) => (
                      <div key={provider}>
                        <div className="border-b border-gray-700/30 bg-[#161616] px-3 sm:px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                          {provider}
                        </div>
                        {providerModels.map((model) => (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              setSelectedModel(model.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full border-b border-gray-800/30 px-3 sm:px-4 py-2.5 sm:py-3 text-left transition-colors duration-150 last:border-b-0 hover:bg-[#222] touch-manipulation ${
                              selectedModel === model.id
                                ? "border-l-2 border-l-purple-500 bg-purple-500/10"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="min-w-0 flex-1 mr-2">
                                <div className="text-xs sm:text-sm font-medium text-gray-200 truncate">
                                  {model.name}
                                </div>
                                <div className="mt-1 text-xs text-gray-500 line-clamp-2">
                                  {model.description}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                <span
                                  className={`rounded-full px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium ${
                                    model.category === "Premium"
                                      ? "bg-yellow-500/20 text-yellow-400"
                                      : model.category === "Fast"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-blue-500/20 text-blue-400"
                                  }`}
                                >
                                  {model.category}
                                </span>
                                {selectedModel === model.id && (
                                  <div className="size-1.5 sm:size-2 rounded-full bg-purple-500"></div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )
                  )}
                </div>
              )}
              {/* Model Selector Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-1 sm:gap-2 whitespace-nowrap rounded-lg bg-black/20 px-2 sm:px-3 py-1 sm:py-1.5 text-xs text-gray-300 transition-all duration-200 hover:bg-black/40 touch-manipulation"
                aria-label="Select model"
              >
                <span className="font-medium truncate max-w-[100px] sm:max-w-none">{currentModel?.name}</span>
                <svg
                  className={`size-2.5 sm:size-3 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-2 sm:p-2.5 text-white shadow-lg transition-all duration-200 hover:from-purple-400 hover:to-purple-500 hover:shadow-purple-500/25 active:scale-95 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-800 disabled:shadow-none touch-manipulation"
              aria-label="Send message"
            >
              <svg
                className="size-4 sm:size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}