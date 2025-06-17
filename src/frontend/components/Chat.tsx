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
import Error from "./ui/error";
import Image from "next/image";
import { Copy } from "lucide-react";

export default function Chat(props: { threadId: Id<"threads"> }) {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
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
    stop,
    status,
    error,
    reload,
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
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-6 scroll-smooth no-scrollbar"
        style={{ paddingBottom: "140px" }} // Reserve space for MessageBox
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
                // User message (unchanged)
                <div className="max-w-[85%] sm:max-w-[80%] p-1 sm:p-2">
                  <div className="relative rounded-xl sm:rounded-2xl bg-[#51495f] px-3 sm:px-5 py-3 sm:py-4 text-white">
                    <div className="whitespace-pre-wrap break-words text-pretty text-gray-100 text-sm sm:text-base leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </div>
              ) : (
                // Assistant message
                <div className="flex w-full max-w-full items-start gap-2 sm:gap-4 pl-2 sm:pl-4">
                  <div className="min-w-0 flex-1 prose prose-invert max-w-none text-gray-100 prose-p:text-gray-100 rounded-none relative">
                    {/* Copy Button for this assistant message */}
                    <button
                      className="rounded transition justify-start p-2 absolute top-0 right-0"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          message.parts
                            ? message.parts
                                .filter((part) => part.type === "text")
                                .map((part) => part.text)
                                .join("\n")
                            : message.content
                        );
                        setCopied(message.id);
                        setTimeout(() => setCopied(null), 1500);
                      }}
                      aria-label="Copy response"
                    >
                      <Copy
                        className={`text-white ${copied === message.id ? "text-green-400" : ""}`}
                        size={16}
                      />
                    </button>
                    {/* Check if message has parts (reasoning) or just content */}
                    {message.parts ? (
                      // Handle structured message with reasoning and images
                      message.parts.map((part, partIndex) => (
                        <div key={partIndex}>
                          {part.type === "text" && (
                            <MemoizedMarkdown
                              content={part.text}
                              id={message.id}
                              size="default"
                            />
                          )}
                          {part.type === "file" &&
                            part.mimeType?.startsWith("image/") && (
                              <div className="my-4">
                                <Image
                                  src={`data:${part.mimeType};base64,${part.data}`}
                                  alt="Generated image"
                                  className="max-w-full h-auto rounded-lg shadow-lg"
                                  loading="lazy"
                                  width={100}
                                  height={100}
                                />
                              </div>
                            )}
                          {part.type === "reasoning" && (
                            <details className="mb-4 rounded-lg bg-gray-800/50 p-3">
                              <summary className="cursor-pointer text-sm font-medium text-gray-300 hover:text-white">
                                View Reasoning
                              </summary>
                              <div className="mt-2 text-sm text-gray-400">
                                <pre className="whitespace-pre-wrap">
                                  {part.details?.map((detail, i) => (
                                    <div key={i}>
                                      {detail.type === "text"
                                        ? detail.text
                                        : "<redacted>"}
                                    </div>
                                  ))}
                                </pre>
                              </div>
                            </details>
                          )}
                        </div>
                      ))
                    ) : (
                      // Handle simple string content
                      <MemoizedMarkdown
                        content={message.content}
                        id={message.id}
                        size="default"
                      />
                    )}
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
        {/* Error Component */}
        <Error error={error ? error.message : null} reload={reload} />

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
        status={status}
        error={error ? error.message : null}
        reload={reload}
        onModelSelect={setSelectedModel}
        onDropdownToggle={() => setIsDropdownOpen(!isDropdownOpen)}
        onDropdownClose={() => setIsDropdownOpen(false)}
      />
    </div>
  );
}
