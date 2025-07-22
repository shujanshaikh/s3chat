import { Message } from "@ai-sdk/ui-utils";
import { memo, useCallback, useMemo, useState } from "react";
import { MessageAttachments } from "./Message-attachment";
import { Copy } from "lucide-react";
import MemoizedMarkdown from "./MemorizedMarkdown";
import Image from "next/image";
import { ToolCall } from "./ToolCall";

export const MessageContent = memo(
  ({ message, status }: { message: Message; status: string }) => {
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
              {message.parts?.map((part, partIndex) => {
                if (part.type === "text") {
                  return <div key={partIndex}>{part.text}</div>;
                }
              })}
            </div>
          </div>
          <MessageAttachments message={message} />
        </div>
      );
    }

    return (
      <div className="flex w-full max-w-full items-start gap-2 sm:gap-4 pl-2 sm:pl-4">
        <div className="min-w-0 flex-1 prose prose-invert max-w-none text-gray-100 prose-p:text-gray-100 rounded-none relative group">
          {status === "streaming" && (
            <button
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                 absolute bottom-1 left-2 z-10 
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
                  if (state === "result" && "result" in part.toolInvocation) {
                    result =
                      typeof part.toolInvocation.result === "string"
                        ? part.toolInvocation.result
                        : JSON.stringify(part.toolInvocation.result);
                  }

                  return (
                    <ToolCall
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
      prevProps.status === nextProps.status
    );
  }
);

MessageContent.displayName = "MessageContent";

export const MessageWrapper = memo(
  ({
    message,
    index,
    status,
  }: {
    message: Message;
    index: number;
    status: string;
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
          status={status}
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.message.id === nextProps.message.id &&
      prevProps.message.content === nextProps.message.content &&
      prevProps.index === nextProps.index &&
      prevProps.status === nextProps.status
    );
  }
);

MessageWrapper.displayName = "MessageWrapper";
