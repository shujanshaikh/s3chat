import { DEFAULT_MODEL, groupModelsByProvider, getModelInfo } from "@/lib/models";
import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

export default function Chat() {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      body: {
        model: selectedModel,
      },
    });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Close dropdown when clicking outside
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

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const formatMessage = (content: string) => {
    // Split content by code blocks
    const parts = content.split(/(```[\s\S]*?```|`[^`]+`)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        // Multi-line code block
        const code = part.slice(3, -3);
        const lines = code.split("\n");
        const language = lines[0].trim();
        const codeContent = lines.slice(1).join("\n");
        const codeId = `code-${index}-${Date.now()}`;

        return (
          <div
            key={index}
            className="my-4 overflow-hidden rounded-xl border border-gray-700/30 bg-[#0d1117] shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-gray-700/30 bg-[#161b22] px-4 py-3">
              <span className="font-mono text-xs font-medium text-gray-400">
                {language || "code"}
              </span>
              <button
                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all duration-200 ${
                  copiedCode === codeId
                    ? "border-green-500/30 bg-green-500/20 text-green-400"
                    : "border-transparent text-gray-400 hover:bg-gray-700/50 hover:text-gray-300"
                }`}
                onClick={() => copyToClipboard(codeContent, codeId)}
                aria-label="Copy code"
              >
                {copiedCode === codeId ? (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="overflow-x-auto p-4">
              <code className="font-mono text-sm leading-relaxed text-gray-300">
                {codeContent}
              </code>
            </pre>
          </div>
        );
      } else if (part.startsWith("`") && part.endsWith("`")) {
        // Inline code
        const code = part.slice(1, -1);
        return (
          <code
            key={index}
            className="rounded-md border border-gray-700/30 bg-[#0d1117] px-2 py-1 font-mono text-sm text-purple-300"
          >
            {code}
          </code>
        );
      } else {
        // Regular text
        return <span key={index}>{part}</span>;
      }
    });
  };

  const groupedModels = groupModelsByProvider();
  const currentModel = getModelInfo(selectedModel);

  return (
    <div className="flex h-dvh flex-col bg-[#0a0a0a]">
      {/* Messages */}
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex animate-in fade-in-0 slide-in-from-bottom-3 duration-300 ease-out ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={`${message.role === "user" ? "w-[60%]" : "w-full"}`}
              >
                <div
                  className={`relative rounded-2xl px-5 py-4 ${
                    message.role === "user"
                      ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white text-pretty whitespace-pre-wrap"
                      : "border border-gray-800/50 bg-[#1a1a1a] text-gray-100 shadow-lg"
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {message.role === "assistant" ? (
                      <div className="text-pretty whitespace-pre-wrap">
                        {formatMessage(message.content)}
                      </div>
                    ) : (
                      <div className="text-pretty whitespace-pre-wrap">
                        {message.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Input */}
      <div className="p-4 pb-6">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <div className="relative flex flex-col rounded-2xl border border-purple-400/20 bg-[#1a1a1a]/90 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-200 hover:border-purple-400/30 focus-within:border-purple-400/50 focus-within:shadow-purple-400/10 focus-within:ring-1 focus-within:ring-purple-400/30">
            <textarea
              value={input}
              onChange={handleInputChange}
              placeholder={`Ask ${currentModel?.name}...`}
              disabled={isLoading}
              rows={1}
              className="min-h-[56px] max-h-48 w-full flex-1 resize-none bg-transparent p-4 pb-12 text-sm leading-6 text-gray-100 selection:bg-purple-400/30 placeholder:text-gray-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />

            {/* Controls positioned absolutely within the container */}
            <div className="absolute bottom-3 left-3" ref={dropdownRef}>
              {/* Drop-up Menu */}
              {isDropdownOpen && (
                <div className="absolute bottom-full mb-2 w-72 origin-bottom-left rounded-xl border border-gray-700/50 bg-[#1a1a1a] shadow-2xl shadow-black/50 z-50 max-h-80 overflow-y-auto">
                  {Object.entries(groupedModels).map(
                    ([provider, providerModels]) => (
                      <div key={provider}>
                        <div className="border-b border-gray-700/30 bg-[#161616] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
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
                            className={`w-full border-b border-gray-800/30 px-4 py-3 text-left transition-colors duration-150 last:border-b-0 hover:bg-[#222] ${
                              selectedModel === model.id
                                ? "border-l-2 border-l-purple-500 bg-purple-500/10"
                                : ""
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-sm font-medium text-gray-200">
                                  {model.name}
                                </div>
                                <div className="mt-1 text-xs text-gray-500">
                                  {model.description}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-full px-2 py-1 text-xs font-medium ${
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
                                  <div className="size-2 rounded-full bg-purple-500"></div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ),
                  )}
                </div>
              )}
              {/* Model Selector Button */}
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg bg-black/20 px-3 py-1.5 text-xs text-gray-300 transition-all duration-200 hover:bg-black/40"
                aria-label="Select model"
              >
                <span className="font-medium">{currentModel?.name}</span>
                <svg
                  className={`size-3 text-gray-400 transition-transform duration-200 ${
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
              className="absolute bottom-3 right-3 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 p-2.5 text-white shadow-lg transition-all duration-200 hover:from-purple-400 hover:to-purple-500 hover:shadow-purple-500/25 active:scale-95 disabled:cursor-not-allowed disabled:from-gray-700 disabled:to-gray-800 disabled:shadow-none"
              aria-label="Send message"
            >
              <svg
                className="size-5"
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