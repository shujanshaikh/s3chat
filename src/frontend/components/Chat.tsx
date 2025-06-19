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
import { toast } from "sonner";
import { useAPIKeyStore } from "../store/apiKey";
import { Attachment } from "@ai-sdk/ui-utils";

export default function Chat(props: { threadId: Id<"threads"> }) {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { threadId } = props;
  const [attachments, setAttachments] = useState<Attachment[]>([]); // Use state to store attachments
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const initialMessages = useQuery(api.messages.getMessages, {
    threadId: threadId!,
  });
  const createMessage = useMutation(api.messages.createMessage);
  const { getKey } = useAPIKeyStore();

  const apiHeaders: Record<string, string> = {};
  if (getKey("google")) apiHeaders["x-google-api-key"] = getKey("google")!;
  if (getKey("openai")) apiHeaders["x-openai-api-key"] = getKey("openai")!;
  if (getKey("anthropic"))
    apiHeaders["x-anthropic-api-key"] = getKey("anthropic")!;
  if (getKey("groq")) apiHeaders["x-groq-api-key"] = getKey("groq")!;

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
    headers: apiHeaders,
  });

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

   const message =  await createMessage({
      threadId: threadId!,
      role: "user",
      content: input,
      model: selectedModel,
    });


    // Submit the message along with the attachments
    handleSubmit(e, {
      experimental_attachments: attachments,
    });

    // Clear attachments after submission
    setAttachments([]);
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

  // Only check scroll position on mount and when messages change (not for auto-scroll)
  useEffect(() => {
    handleScroll();
  }, [messages.length]);

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
    <div className="flex h-dvh flex-col bg-pink-200/15 relative min-h-screen">
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
                  <div className="relative rounded-xl sm:rounded-2xl bg-pink-700/10 px-3 sm:px-5 py-3 sm:py-4 text-white">
                    <div className="whitespace-pre-wrap break-words text-pretty text-gray-100 text-sm sm:text-base leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                  <div className="mt-2 space-y-2">
                    {message.experimental_attachments
                      ?.filter(attachment =>
                        attachment.contentType?.startsWith('image/'),
                      )
                      .map((attachment, index) => (
                        <div key={`${message.id}-${index}`} className="max-w-xs">
                          <Image
                            src={attachment.url}
                            alt={attachment.name || "Attachment"}
                            width={300}
                            height={200}
                            className="rounded-lg object-cover"
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                // Assistant message
                <div className="flex w-full max-w-full items-start gap-2 sm:gap-4 pl-2 sm:pl-4">
                  <div className="min-w-0 flex-1 prose prose-invert max-w-none text-gray-100 prose-p:text-gray-100 rounded-none relative group">
                    {/* Copy Button for this assistant message */}
                    {!isLoading && (
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                                   absolute bottom-2 left-2 z-10 
                                   text-gray-400 hover:text-gray-200 
                                   p-1 rounded"
                        onClick={async () => {
                          try {
                            const textToCopy = message.parts
                              ? message.parts
                                  .filter((part) => part.type === "text")
                                  .map((part) => part.text)
                                  .join("\n")
                              : message.content;
                            
                            await navigator.clipboard.writeText(textToCopy);
                            setCopied(message.id);
                            toast.success("Copied to clipboard");
                            setTimeout(() => setCopied(null), 1500);
                          } catch (error) {
                            console.error("Failed to copy text:", error);
                            toast.error("Failed to copy to clipboard");
                          }
                        }}
                        aria-label="Copy response"
                        title="Copy to clipboard"
                      >
                        <Copy
                          className={`transition-colors duration-200 ${
                            copied === message.id ? "text-green-400" : "text-gray-400 hover:text-gray-200"
                          }`}
                          size={14}
                        />
                      </button>
                    )}
                    {/* Check if message has parts (reasoning) or just content */}
       {message.parts ? (
  <div className="pb-8">
    {message.parts.map((part, partIndex) => (
      <div key={partIndex} className="w-full max-w-full overflow-x-auto break-words">
        {part.type === "text" && (
          <MemoizedMarkdown
            content={part.text}
            id={`${message.id}-text-${partIndex}`}
            size="default"
          />
        )}

        {part.type === "file" && part.mimeType?.startsWith("image/") && (
          <div className="my-4 w-full max-w-full flex justify-center">
            <Image
              src={`data:${part.mimeType};base64,${part.data}`}
              alt="Generated image"
              className="w-full max-w-[100%] h-auto rounded-lg shadow-lg"
              loading="lazy"
              width={100}
              height={100}
            />
          </div>
        )}

        {part.type === "reasoning" && (
          <details className="mb-4 rounded-lg bg-gray-800/50 p-3 w-full max-w-full">
            <summary className="cursor-pointer text-sm font-medium text-gray-300 hover:text-white">
              View Reasoning
            </summary>
            <div className="mt-2 text-sm text-gray-400 overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words">
                {part.details?.map((detail, i) => (
                  <div key={i}>
                    {detail.type === "text" ? detail.text : "<redacted>"}
                  </div>
                ))}
              </pre>
            </div>
          </details>
        )}
      </div>
    ))}
  </div>
) : (
  <div className="w-full max-w-full overflow-x-auto break-words pb-8">
    <MemoizedMarkdown
      content={message.content}
      id={message.id}
      size="default"
    />
  </div>
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
        attachments={attachments}
        setAttachments={setAttachments}
      />
    </div>
  );
}