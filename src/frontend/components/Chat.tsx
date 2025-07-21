import {
  DEFAULT_MODEL,
  groupModelsByProvider,
  getModelInfo,
} from "@/lib/models";
import { Message, useChat } from "@ai-sdk/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import MemoizedMarkdown from "./MemorizedMarkdown";
import MessageBox from "./Message-box";
import Error from "./ui/error";
import Image from "next/image";
  import { Copy, Globe, Loader2, ChevronDown } from "lucide-react";
import { useAPIKeyStore } from "../store/apiKey";
import { Attachment } from "@ai-sdk/ui-utils";
import { MessageAttachments } from "./Message-attachment";


const ToolInvocation = ({
  toolName,
  result,
  args 
}: {
  toolName: string;
  result?: string;
  args: Record<string, unknown>;
}) => {
  if(toolName === "webSearch") {
    return (
      <div className="my-4">
        {result ? (
          <details className="group">
            <summary className="flex cursor-pointer items-center gap-3 p-2 transition-colors">
              <Globe className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-300">Searched the web</span>
              <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-3 ml-8 space-y-3">
              {JSON.parse(result).map(
                (
                  item: { url: string; title: string; content: string },
                  i: number,
                ) => (
                  <div key={i} className="group/item">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-4 w-4 items-center justify-center rounded bg-gray-700">
                        <div className="h-2 w-2 rounded bg-gray-500"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-sm font-medium text-blue-400 hover:text-blue-300 hover:underline truncate"
                          title={item.title}
                        >
                          {item.title}
                        </a>
                        <div className="text-xs text-gray-500 truncate mt-0.5">
                          {new URL(item.url).hostname}
                        </div>
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          </details>
        ) : (
          <div className="flex items-center gap-3 p-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400/30 border-t-blue-400" />
            <span className="text-sm text-gray-400">Searching the web...</span>
          </div>
        )}
      </div>
    );
  }

  return null;
};


const MessageContent = memo(
  ({ message, isLoading }: { message: Message; isLoading: boolean }) => {
    const [copied, setCopied] = useState(false);

    const onCopy = useCallback(async () => {
      try {
        const textToCopy = message.parts
          ? message.parts
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join("\n")
          : message.content;

        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
      } catch (error) {
        console.error("Failed to copy text:", error);
      }
    }, [message.content, message.parts]);

    if (message.role === "user") {
      return (
        <div className="max-w-[85%] sm:max-w-[80%] p-1 sm:p-2">
          <div className="relative rounded-xl bg-indigo-800/30 px-3 sm:px-5 py-3 sm:py-4 text-white">
            <div className="whitespace-pre-wrap break-words text-pretty text-gray-100 text-sm sm:text-base leading-relaxed">
              {message.content}
            </div>
          </div>
          <MessageAttachments message={message} />
        </div>
      );
    }

    return (
      <div className="flex w-full max-w-full items-start gap-2 sm:gap-4 pl-2 sm:pl-4">
        <div className="min-w-0 flex-1 prose prose-invert max-w-none text-gray-100 prose-p:text-gray-100 rounded-none relative group">
          {!isLoading && (
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                               absolute bottom-2 left-2 z-10 
                               text-gray-400 hover:text-gray-200 
                               p-1 rounded"
              onClick={onCopy}
              aria-label="Copy response"
              title="Copy to clipboard"
            >
              <Copy
                className={`transition-colors duration-200 ${
                  copied
                    ? "text-indigo-400"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                size={14}
              />
            </button>
          )}
          {message.parts ? (
            <div className="pb-8">
              {message.parts.map((part, partIndex) => {
                if (part.type === "text") {
                  return (
                    <div
                      key={partIndex}
                      className="w-full max-w-full overflow-x-auto break-words"
                    >
                      <MemoizedMarkdown
                        content={part.text}
                        id={`${message.id}-text-${partIndex}`}
                        size="default"
                      />
                    </div>
                  );
                }

                if (
                  part.type === "file" &&
                  part.mimeType?.startsWith("image/")
                ) {
                  return (
                    <div
                      key={partIndex}
                      className="w-full max-w-full overflow-x-auto break-words"
                    >
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
                    </div>
                  );
                }

                if (part.type === "reasoning") {
                  return (
                    <div
                      key={partIndex}
                      className="w-full max-w-full overflow-x-auto break-words"
                    >
                      <details className="mb-4 rounded-lg p-3 w-full max-w-full">
                        <summary className="cursor-pointer text-md font-sans text-indigo-100/90  ">
                          Reasoning
                        </summary>
                        <div className="mt-2 text-sm text-gray-400 overflow-x-auto">
                          <pre className="whitespace-pre-wrap break-words bg-indigo-900/10">
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
                    </div>
                  );
                }

                if (part.type === "tool-invocation") {
                  const callId = part.toolInvocation.toolCallId;
                          const toolName = part.toolInvocation.toolName;
                          const state = part.toolInvocation.state;
                          const args = part.toolInvocation.args;

                          let result: string | undefined;
                          if (
                            state === "result" &&
                            "result" in part.toolInvocation
                          ) {
                            result =
                              typeof part.toolInvocation.result === "string"
                                ? part.toolInvocation.result
                                : JSON.stringify(part.toolInvocation.result);
                          }

                          return (
                            <ToolInvocation
                              key={callId}
                              toolName={toolName}
                              args={args}
                              result={result}
                            />
                          );
                }

                if (part.type === "step-start") {
                  return partIndex > 0 ? (
                    <div
                      key={partIndex}
                      className="w-full max-w-full flex items-center my-3"
                    >
                      <div className="flex-1 h-px bg-indigo-400/20"></div>
                      <div className="px-3 text-xs text-indigo-300 bg-indigo-600/20 rounded-full py-1">
                        Next Step
                      </div>
                      <div className="flex-1 h-px bg-indigo-400/20"></div>
                    </div>
                  ) : null;
                }

                return null;
              })}
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
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.message.role === nextProps.message.role &&
      JSON.stringify(prevProps.message.parts) ===
        JSON.stringify(nextProps.message.parts) &&
      prevProps.isLoading === nextProps.isLoading
    );
  }
);

MessageContent.displayName = "MessageContent";

const MessageWrapper = memo(
  ({
    message,
    index,
    isLastMessage,
    isLoading,
  }: {
    message: Message;
    index: number;
    isLastMessage: boolean;
    isLoading: boolean;
  }) => {
    const animationDelay = useMemo(() => `${index * 50}ms`, [index]);

    return (
      <div
        className={`flex animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ease-out ${
          message.role === "user" ? "justify-end" : "justify-start"
        }`}
        style={{ animationDelay }}
      >
        <MessageContent
          message={message}
          isLoading={isLastMessage && isLoading}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.index === nextProps.index &&
      prevProps.isLastMessage === nextProps.isLastMessage &&
      (!nextProps.isLastMessage || prevProps.isLoading === nextProps.isLoading)
    );
  }
);

MessageWrapper.displayName = "MessageWrapper";

const groupedModels = groupModelsByProvider();

function Chat(props: { threadId: string }) {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { threadId } = props;
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [webSearch, setWebSearch] = useState(false);

  const initialMessages = useQuery(api.messages.getMessages, {
    threadId: threadId!,
  });

  const createMessage = useMutation(api.messages.createMessage);
  const createAttachment = useMutation(api.attachments.createAttachment);

  const { getKey } = useAPIKeyStore();

  const apiHeaders = useMemo(() => {
    const headers: Record<string, string> = {};
    const googleKey = getKey("google");
    const openaiKey = getKey("openai");
    const anthropicKey = getKey("anthropic");
    const groqKey = getKey("groq");
    if (googleKey) headers["x-google-api-key"] = googleKey;
    if (openaiKey) headers["x-openai-api-key"] = openaiKey;
    if (anthropicKey) headers["x-anthropic-api-key"] = anthropicKey;
    if (groqKey) headers["x-groq-api-key"] = groqKey;
    return headers;
  }, [getKey]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
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
    experimental_throttle: 100,
    maxSteps: 5,
    body: { model: selectedModel, webSearch: webSearch },
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

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim()) return;

      const messageId = await createMessage({
        threadId: threadId!,
        role: "user",
        content: input,
        model: selectedModel,
      });

      // Create attachments for this message
      if (attachments.length > 0) {
        try {
          const attachmentPromises = attachments.map((attachment) =>
            createAttachment({
              messageId: messageId,
              fileUrl: attachment.url,
              fileName: attachment.name || "unknown",
              contentType: attachment.contentType || "application/octet-stream",
            })
          );
          // await Promise.all(attachmentPromises);
          console.log("Attachments created successfully");
        } catch (error) {
          console.error("Failed to create attachments:", error);
        }
      }

      // Submit the message along with the attachments
      handleSubmit(e, {
        experimental_attachments: attachments,
      });

      // Clear attachments after submission
      setAttachments([]);

      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    },
    [
      input,
      createMessage,
      threadId,
      attachments,
      createAttachment,
      handleSubmit,
      selectedModel,
      scrollToBottom,
    ]
  );

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 20;
      setShowScrollButton(!isAtBottom);
    }
  }, []);

  useEffect(() => {
    handleScroll();
  }, [messages.length, handleScroll]);

  const LoadingDots = () => (
    <div className="flex items-center gap-1 px-2 py-1">
      <div className="size-1.5 animate-[bounce_1s_infinite_-0.3s] rounded-full bg-gray-400"></div>
      <div className="size-1.5 animate-[bounce_1s_infinite_-0.15s] rounded-full bg-gray-400"></div>
      <div className="size-1.5 animate-[bounce_1s_infinite] rounded-full bg-gray-400"></div>
    </div>
  );

  const currentModel = useMemo(
    () => getModelInfo(selectedModel),
    [selectedModel]
  );
  const onDropdownToggle = useCallback(
    () => setIsDropdownOpen(!isDropdownOpen),
    [isDropdownOpen]
  );
  const onDropdownClose = useCallback(() => setIsDropdownOpen(false), []);

  return (
    <div className="flex h-dvh flex-col bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-indigo-950/30 relative min-h-screen">
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-6 scroll-smooth no-scrollbar"
        style={{ paddingBottom: "140px" }}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:gap-8">
          {messages.map((message, index) => (
            <MessageWrapper
              key={message.id}
              message={message}
              index={index}
              isLastMessage={index === messages.length - 1}
              isLoading={status === "streaming"}
            />
          ))}

          {/* Show loading dots only when starting a new conversation */}
          {status === "submitted" && (
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
        <Error error={error?.message} reload={reload} />

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
        isLoading={status === "streaming"}
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
        onDropdownToggle={onDropdownToggle}
        onDropdownClose={onDropdownClose}
        attachments={attachments}
        setAttachments={setAttachments}
        webSearch={webSearch}
        setWebSearch={setWebSearch}
      />
    </div>
  );
}

export default memo(Chat);
