import {
  DEFAULT_MODEL,
  groupModelsByProvider,
  getModelInfo,
} from "@/lib/models";
import { Message, useChat } from "@ai-sdk/react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import MessageBox from "./Message-box";
import Error from "./ui/error";
import { useAPIKeyStore } from "../store/apiKey";
import { Attachment, UIMessage } from "@ai-sdk/ui-utils";
import { MessageWrapper } from "./Messages";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom"; 




const groupedModels = groupModelsByProvider();

export function Chat({ threadId , initialMessages }: { threadId: string, initialMessages: Array<UIMessage> }) {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [webSearch, setWebSearch] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    append,
    reload,
  } = useChat({
    initialMessages: initialMessages,
    experimental_prepareRequestBody: (body) => ({
      message: body.messages.at(-1),
      model: selectedModel,
      webSearch: webSearch,
      threadId: threadId,
    }),
    experimental_throttle: 100,
    maxSteps: 5,
    // body: { model: selectedModel, webSearch: webSearch, threadId: threadId },
    headers: apiHeaders,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);


  const [searchParams] = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      append({
        role: 'user',
        content: query,
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${threadId}`);
    }
  }, [query, append, hasAppendedQuery, threadId]);


  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!input.trim() || status === "submitted") return;
      
      if (location.pathname === "/") {
        window.history.replaceState({}, '', `/chat/${threadId}`);
      }
      
      // Create attachments for this message
      if (attachments.length > 0) {
        try {
          const attachmentPromises = attachments.map((attachment) =>
            createAttachment({
              messageId: messages[messages.length - 1]?.id,
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
        attachments,
        createAttachment,
        handleSubmit,
        scrollToBottom,
        messages,
        status,
        location.pathname,
        threadId,
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
              status={status}
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
