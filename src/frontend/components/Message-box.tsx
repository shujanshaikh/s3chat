import { useUploadThing } from "@/utils/uploadthings";
import { ArrowUp, ChevronDown, Globe, Paperclip, X } from "lucide-react";
import type React from "react";
import { useRef, useEffect, useCallback, useState, memo, useMemo } from "react";
import Image from "next/image";

interface Attachment {
  url: string;
  name?: string;
  contentType?: string;
}

interface MessageBoxProps {
  input: string;
  currentModel?: { name: string; id: string };
  selectedModel: string;
  groupedModels: Record<
    string,
    Array<{ id: string; name: string; description: string; category: string }>
  >;
  isDropdownOpen: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onStop: () => void;
  status: string;
  onModelSelect: (modelId: string) => void;
  onDropdownToggle: () => void;
  onDropdownClose: () => void;
  error: string | null;
  reload: () => void;
  attachments: Attachment[];
  setAttachments: React.Dispatch<React.SetStateAction<Attachment[]>>;
  webSearch: boolean;
  setWebSearch: React.Dispatch<React.SetStateAction<boolean>>;
}

// Separate component for attachment preview to prevent re-renders
const AttachmentPreview = memo(({ 
  attachment, 
  index, 
  onRemove, 
  isMobile = false 
}: { 
  attachment: Attachment; 
  index: number; 
  onRemove: (index: number) => void;
  isMobile?: boolean;
}) => {
  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  const size = isMobile ? 'w-12 h-12' : 'w-16 h-16';

  return (
    <div className="relative">
      {attachment.contentType?.startsWith("image/") ? (
        <Image
          width={isMobile ? 48 : 64}
          height={isMobile ? 48 : 64}
          src={attachment.url}
          alt={attachment.name || "Attachment"}
          className={`${size} rounded-lg object-cover border border-zinc-600/40`}
        />
      ) : (
        <div className={`${size} bg-zinc-700/80 rounded-lg flex items-center justify-center border border-zinc-600/40`}>
          <span className="text-xs text-zinc-300 text-center px-1 truncate">
            {isMobile 
              ? attachment.name?.split(".")[0]?.substring(0, 4) || "File"
              : attachment.name || "File"
            }
          </span>
        </div>
      )}
      <button
        onClick={handleRemove}
        className={`absolute -top-1 -right-1 ${isMobile ? 'w-4 h-4' : 'w-5 h-5'} bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600`}
      >
        <X size={isMobile ? 10 : 12} />
      </button>
    </div>
  );
});

AttachmentPreview.displayName = "AttachmentPreview";

function MessageBox({
  input,
  currentModel,
  selectedModel,
  onStop,
  status,
  groupedModels,
  isDropdownOpen,
  onInputChange,
  onSubmit,
  error,
  reload,
  onModelSelect,
  onDropdownToggle,
  onDropdownClose,
  attachments,
  setAttachments,
  webSearch,
  setWebSearch,
}: MessageBoxProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoResizeTimeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Memoize upload configuration to prevent re-creating on every render
  const uploadConfig = useMemo(() => ({
    onClientUploadComplete: (res: any) => {
      if (!res) return;
      const newAttachments = res.map((file: any) => ({
        url: file.url,
        name: file.name,
        contentType: file.type,
      }));
      setAttachments((prev) => [...prev, ...newAttachments]);
      setUploadProgress(0);
    },
    onUploadError: (error: Error) => {
      console.error("Upload failed:", error.message);
      setUploadProgress(0);
    },
    onUploadProgress: setUploadProgress,
  }), [setAttachments]);

  const { startUpload, isUploading } = useUploadThing("imageUploader", uploadConfig);

  // Memoize attachment removal handler
  const handleRemoveAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, [setAttachments]);

  // Memoize file input handler
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      startUpload(Array.from(e.target.files));
    }
  }, [startUpload]);

  // Memoize file attachment click handler
  const handleAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Memoize web search toggle
  const handleWebSearchToggle = useCallback(() => {
    setWebSearch(!webSearch);
  }, [webSearch, setWebSearch]);

  // Memoize model selection handlers
  const handleModelSelect = useCallback((modelId: string) => {
    onModelSelect(modelId);
    onDropdownClose();
  }, [onModelSelect, onDropdownClose]);

  const handleModelSelectMobile = useCallback((e: React.TouchEvent, modelId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onModelSelect(modelId);
  }, [onModelSelect]);

  // Memoize keyboard event handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && input.trim()) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  }, [input, onSubmit]);

  // Optimized autoResize function with better memoization
  const autoResize = useCallback(() => {
    const ta = inputRef.current;
    if (!ta) return;

    // Cancel any pending resize operations
    if (autoResizeTimeoutRef.current) {
      clearTimeout(autoResizeTimeoutRef.current);
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    // For immediate resize on user typing, use a shorter debounce
    const debounceTime = input.length === 0 ? 0 : 8;

    autoResizeTimeoutRef.current = window.setTimeout(() => {
      rafRef.current = requestAnimationFrame(() => {
        if (!ta) return;

        const currentHeight = ta.scrollHeight;
        const newHeight = Math.min(currentHeight, 120);

        if (ta.style.height !== `${newHeight}px`) {
          ta.style.height = "auto";
          ta.style.height = `${newHeight}px`;
        }
      });
    }, debounceTime);
  }, [input.length]);

  // Stable event handlers for global events
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const clipboardData = e.clipboardData;
    if (!clipboardData) return;

    const items = Array.from(clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith("image/"));

    if (imageItems.length > 0) {
      e.preventDefault();
      const files: File[] = [];
      imageItems.forEach((item) => {
        const file = item.getAsFile();
        if (file) files.push(file);
      });

      if (files.length > 0) {
        startUpload(files);
      }
    }
  }, [startUpload]);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      onDropdownClose();
    }
  }, [onDropdownClose]);

  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onDropdownClose();
  }, [onDropdownClose]);

  
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      document.removeEventListener("paste", handlePaste);
    };
  }, [handleClickOutside, handleEscapeKey, handlePaste]);


  useEffect(() => {
    autoResize();

    return () => {
      if (autoResizeTimeoutRef.current) {
        clearTimeout(autoResizeTimeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [autoResize]);

  const hasAttachments = attachments.length > 0;
  const canSubmit = input.trim();
  const isStreaming = status === "streaming" || status === "submitted";
  const inputDisabled = error !== null;

  const submitButtonClasses = useMemo(() => {
    const baseClasses = "rounded-full flex items-center justify-center transition-all duration-200";
    return canSubmit
      ? `${baseClasses} bg-indigo-500/30 text-gray-200 hover:bg-indigo-500/40 hover:scale-105`
      : `${baseClasses} bg-zinc-700/50 text-gray-500 cursor-not-allowed`;
  }, [canSubmit]);

  return (
    <>
      {/* Mobile: Fixed bottom container */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3">
        <div className="relative">
          {/* Display current attachments - mobile optimized */}
          {hasAttachments && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <AttachmentPreview 
                    key={index}
                    attachment={attachment}
                    index={index}
                    onRemove={handleRemoveAttachment}
                    isMobile={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upload progress - mobile */}
          {isUploading && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-xs text-indigo-200/80">
                <div className="flex-1 bg-indigo-400/20 rounded-full h-1.5">
                  <div
                    className="bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-right min-w-[2rem]">
                  {uploadProgress.toFixed(0)}%
                </span>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit}>
            {/* Main input container - mobile */}
            <div className="bg-zinc-800/60 backdrop-blur-md rounded-2xl border border-zinc-700/30 p-1">
              {/* Text input area */}
              <div className="px-4 pt-3 pb-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={onInputChange}
                  placeholder="Type your message here..."
                  disabled={inputDisabled}
                  rows={1}
                  className="w-full resize-none bg-transparent text-zinc-200 placeholder-zinc-400 
                           focus:outline-none text-sm leading-relaxed
                           disabled:cursor-not-allowed disabled:opacity-50"
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* Bottom controls - mobile */}
              <div className="flex items-center justify-between px-3 pb-2">
                {/* Left controls */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                    multiple
                  />

                  {/* Model selector - mobile optimized */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={onDropdownToggle}
                      className="flex items-center gap-1 text-xs bg-zinc-800/60 hover:bg-zinc-700/70 border border-zinc-700/40 hover:border-indigo-500/40 rounded-lg px-2 py-1.5 text-zinc-200 hover:text-white transition-all duration-200 disabled:opacity-80"
                    >
                      <span className="truncate max-w-[80px] font-medium">
                        {currentModel?.name || "GPT-4.1"}
                      </span>
                      <ChevronDown className="h-3 w-3 flex-shrink-0" />
                    </button>

                    {/* Mobile Dropdown - full screen overlay */}
                    {isDropdownOpen && (
                      <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md">
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900 via-zinc-900/95 to-zinc-800/90 rounded-t-3xl border-t-2 border-indigo-500/30 max-h-[70vh] overflow-hidden shadow-2xl">
                          <div className="p-6 border-b border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 to-zinc-900/60">
                            <div className="flex items-center justify-between">
                              <h2 className="text-xl font-bold text-white tracking-wide">
                                Select Model
                              </h2>
                              <button
                                onClick={onDropdownClose}
                                onTouchEnd={(e) => {
                                  e.preventDefault();
                                  onDropdownClose();
                                }}
                                className="text-gray-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-700/80 rounded-full p-2 touch-manipulation transition-all duration-200"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </div>

                          <div className="overflow-y-auto max-h-[calc(70vh-80px)] p-6 bg-zinc-900/40">
                            {Object.entries(groupedModels).map(
                              ([provider, models]) => (
                                <div key={provider} className="mb-6">
                                  <div className="px-4 py-2 text-sm font-bold text-indigo-200 uppercase tracking-wider bg-indigo-950/60 rounded-lg border border-indigo-500/30 mb-3">
                                    {provider}
                                  </div>
                                  {models.map((model) => (
                                    <button
                                      key={model.id}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleModelSelect(model.id);
                                        onDropdownClose();
                                      }}
                                      onTouchEnd={(e) => {
                                        handleModelSelectMobile(e, model.id);
                                      }}
                                      className={`w-full rounded-xl px-4 py-4 text-left text-sm mb-3 border-2 transition-all duration-200 touch-manipulation cursor-pointer ${
                                        selectedModel === model.id
                                          ? "bg-gradient-to-r from-indigo-600/30 to-indigo-500/20 border-indigo-400/60 shadow-lg shadow-indigo-500/20"
                                          : "bg-zinc-800/60 border-zinc-700/40 hover:bg-zinc-700/70 hover:border-indigo-500/40 hover:shadow-md"
                                      }`}
                                      style={{
                                        WebkitTapHighlightColor: "transparent",
                                        touchAction: "manipulation",
                                      }}
                                    >
                                      <div className="text-white font-semibold pointer-events-none">
                                        {model.name}
                                      </div>
                                      <div className="text-xs text-gray-300 mt-1 pointer-events-none">
                                        {model.description}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleAttachmentClick}
                    className="text-zinc-400 hover:text-zinc-300 transition-colors duration-200 p-1 border border-zinc-700/40 rounded-3xl px-2 py-2"
                    aria-label="Add attachment"
                    disabled={isUploading}
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleWebSearchToggle}
                    className={`transition-colors duration-200 p-1 border border-zinc-700/40 rounded-3xl px-2 py-2 ${
                      webSearch
                        ? "text-indigo-400 hover:text-indigo-300"
                        : "text-zinc-400 hover:text-zinc-300"
                    }`}
                    aria-label="Web Search"
                  >
                    <Globe className="h-4 w-4" />
              
                  </button>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  {isStreaming && (
                    <button
                      type="button"
                      onClick={onStop}
                      className="px-2 py-1 rounded-full bg-indigo-500/20 text-white text-xs
                               hover:bg-indigo-500/30 transition-all duration-200"
                      aria-label="Stop"
                      disabled={status === "streaming"}
                    >
                      Stop
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`h-7 w-7 ${submitButtonClasses}`}
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Desktop: Original layout */}
      <div className="hidden md:block w-full max-w-4xl mx-auto px-6">
        <div className="relative">
          <div className="bg-zinc-800/60 backdrop-blur-md rounded-t-2xl border border-zinc-700/30 p-1">
            {/* Display current attachments */}
            {hasAttachments && (
              <div className="px-5 pt-3">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment, index) => (
                    <AttachmentPreview 
                      key={index}
                      attachment={attachment}
                      index={index}
                      onRemove={handleRemoveAttachment}
                      isMobile={false}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {isUploading && (
              <div className="px-5 pt-3 pb-1">
                <div className="flex items-center gap-3 text-xs text-indigo-200/80">
                  <div className="flex-1 bg-indigo-400/20 rounded-full h-1.5">
                    <div
                      className="bg-indigo-400 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="w-8 text-right">
                    {uploadProgress.toFixed(0)}%
                  </span>
                </div>
              </div>
            )}
            
            <form onSubmit={onSubmit}>
              {/* Text input area */}
              <div className="px-5 pt-4 pb-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={onInputChange}
                  placeholder="Type your message here..."
                  disabled={inputDisabled}
                  rows={1}
                  className="w-full resize-none bg-transparent text-zinc-200 placeholder-zinc-400 
                           focus:outline-none text-base leading-relaxed
                           disabled:cursor-not-allowed disabled:opacity-50"
                  onKeyDown={handleKeyDown}
                />
              </div>

              {/* Bottom controls - desktop */}
              <div className="flex items-center justify-between px-3 pb-3">
                {/* Left controls */}
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    className="hidden"
                    multiple
                  />
                  {/* Model selector - desktop */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={onDropdownToggle}
                      className="flex items-center gap-1 text-sm hover:bg-zinc-700/70 px-2 py-2 text-white/70 hover:text-white rounded-3xl transition-all duration-200 disabled:opacity-80"
                    >
                      <span className="font-medium">
                        {currentModel?.name || "GPT-4.1"}
                      </span>
                      <ChevronDown className="h-3 w-3" />
                    </button>

                    {/* Desktop Dropdown */}
                    {isDropdownOpen && (
                      <div
                        className="absolute bottom-full mb-2 w-[520px] rounded-2xl border-2 border-indigo-500/30 
                                     bg-gradient-to-br from-zinc-900 via-zinc-900/95 to-zinc-800/90 shadow-2xl z-20 overflow-hidden backdrop-blur-md"
                      >
                        <div className="max-h-80 overflow-y-auto p-6">
                          {Object.entries(groupedModels).map(
                            ([provider, models]) => (
                              <div key={provider} className="mb-5">
                                <div className="px-4 py-2 text-sm font-bold text-indigo-200 uppercase tracking-wider bg-indigo-950/60 rounded-lg border border-indigo-500/30 mb-3">
                                  {provider}
                                </div>
                                {models.map((model) => (
                                  <button
                                    key={model.id}
                                    type="button"
                                    onClick={() => handleModelSelect(model.id)}
                                    className={`w-full rounded-xl px-4 py-3 text-left text-sm mb-2 border-2 transition-all duration-200 hover:scale-[1.02] ${
                                      selectedModel === model.id
                                        ? "bg-gradient-to-r from-indigo-600/30 to-indigo-500/20 border-indigo-400/60 shadow-lg shadow-indigo-500/20"
                                        : "bg-zinc-800/60 border-zinc-700/40 hover:bg-zinc-700/70 hover:border-indigo-500/40 hover:shadow-md"
                                    }`}
                                  >
                                    <div className="text-white font-semibold">
                                      {model.name}
                                    </div>
                                    <div className="text-xs text-gray-300 mt-0.5">
                                      {model.description}
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleWebSearchToggle}
                    className={`flex items-center gap-1 transition-colors duration-200 border border-zinc-700/40 rounded-3xl px-2 py-2 ${
                      webSearch
                        ? "text-indigo-400 hover:text-indigo-300"
                        : "text-zinc-400 hover:text-zinc-300"
                    }`}
                    aria-label="Web Search"
                  >
                    <Globe className="h-4 w-4" />
                    <span
                      className={`text-xs ${webSearch ? "text-indigo-400" : "text-zinc-400"}`}
                    >
                      Search
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAttachmentClick}
                    className="flex items-center gap-1 text-zinc-400 hover:text-zinc-300 transition-colors duration-200 border border-zinc-700/40 rounded-3xl px-3 py-2"
                    aria-label="Add attachment"
                    disabled={isUploading}
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  {isStreaming && (
                    <button
                      type="button"
                      onClick={onStop}
                      className="px-3 py-1.5 rounded-full bg-indigo-500/20 text-white text-sm
                               hover:bg-indigo-500/30 transition-all duration-200"
                      aria-label="Stop"
                    >
                      Stop
                    </button>
                  )}

                  {/* Send button - sleek design */}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`h-8 w-8 ${submitButtonClasses}`}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default memo(MessageBox, (prevProps, nextProps) => {
  return (
    prevProps.input === nextProps.input &&
    prevProps.selectedModel === nextProps.selectedModel &&
    prevProps.isDropdownOpen === nextProps.isDropdownOpen &&
    prevProps.status === nextProps.status &&
    prevProps.error === nextProps.error &&
    prevProps.webSearch === nextProps.webSearch &&
    prevProps.attachments.length === nextProps.attachments.length &&
    prevProps.currentModel?.id === nextProps.currentModel?.id &&
    JSON.stringify(prevProps.attachments) === JSON.stringify(nextProps.attachments)
  );
});
