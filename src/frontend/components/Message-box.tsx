import { useUploadThing } from "@/utils/uploadthings";
import { ArrowUp, ChevronDown, Paperclip, X } from "lucide-react";
import type React from "react";
import { useRef, useEffect, useCallback, useState } from "react";

interface Attachment {
  url: string;
  name?: string;
  contentType?: string;
}

interface MessageBoxProps {
  input: string;
  isLoading: boolean;
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
}

export default function MessageBox({
  input,
  isLoading,
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
}: MessageBoxProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

// Copy the exact approach from the first code
const { startUpload, isUploading } = useUploadThing("imageUploader", {
  onClientUploadComplete: (res) => {
    if (!res) return;
    const newAttachments = res.map((file) => ({
      url: file.url,
      name: file.name,
      contentType: file.type,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    // You can add toast notification here if you have it
    // toast.success("File uploaded successfully!");
    setUploadProgress(0);
  },
  onUploadError: (error: Error) => {
    // You can add toast notification here if you have it
    // toast.error(`Upload failed: ${error.message}`);
    console.error('Upload failed:', error.message);
    setUploadProgress(0);
  },
  onUploadProgress: setUploadProgress,
});

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onDropdownClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDropdownClose();
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [onDropdownClose]);

  const autoResize = useCallback((ta: HTMLTextAreaElement) => {
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, []);

  useEffect(() => {
    if (inputRef.current) autoResize(inputRef.current);
  }, [input, autoResize]);

  return (
    <>
      {/* Mobile: Fixed bottom container - no background */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-3">
        <div className="relative">
          {/* Display current attachments - mobile optimized */}
          {attachments.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="relative">
                    {attachment.contentType?.startsWith("image/") ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name || "Attachment"}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-600"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600">
                        <span className="text-xs text-gray-300 text-center px-1 truncate">
                          {attachment.name?.split('.')[0]?.substring(0, 4) || "File"}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload progress - mobile */}
          {isUploading && (
            <div className="mb-3">
              <div className="flex items-center gap-2 text-xs text-pink-200/80">
                <div className="flex-1 bg-pink-400/20 rounded-full h-1.5">
                  <div 
                    className="bg-pink-400 h-1.5 rounded-full transition-all duration-300"
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
            <div className="bg-pink-300/15 backdrop-blur-md rounded-2xl border border-pink-200/20 p-1">
              {/* Text input area */}
              <div className="px-4 pt-3 pb-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={onInputChange}
                  placeholder="Type your message..."
                  disabled={isLoading || error !== null}
                  rows={1}
                  className="w-full resize-none bg-transparent text-gray-200 placeholder-gray-400 
                           focus:outline-none text-sm leading-relaxed
                           disabled:cursor-not-allowed disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !isLoading &&
                      input.trim()
                    ) {
                      e.preventDefault();
                      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                    }
                  }}
                />
              </div>

              {/* Bottom controls - mobile */}
              <div className="flex items-center justify-between px-3 pb-2">
                {/* Left controls */}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files) {
                        startUpload(Array.from(e.target.files));
                      }
                    }}
                    className="hidden"
                    multiple
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-gray-300 transition-colors duration-200 p-1"
                    aria-label="Add attachment"
                    disabled={isUploading}
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  
                  {/* Model selector - mobile optimized */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={onDropdownToggle}
                      disabled={isLoading}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 
                               transition-colors duration-200 disabled:opacity-80 p-1"
                    >
                      <span className="truncate max-w-[80px]">{currentModel?.name || "GPT-4.1"}</span>
                      <ChevronDown className="h-3 w-3 flex-shrink-0" />
                    </button>

                    {/* Mobile Dropdown - full screen overlay */}
                    {isDropdownOpen && (
                      <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm">
                        <div className="absolute bottom-0 left-0 right-0 bg-black/90 rounded-t-2xl border-t border-pink-200/30 max-h-[70vh] overflow-hidden">
                          <div className="p-4 border-b border-pink-200/20">
                            <div className="flex items-center justify-between">
                              <h2 className="text-lg font-semibold text-white">Select Model</h2>
                              <button
                                onClick={onDropdownClose}
                                className="text-gray-400 hover:text-white p-1"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="overflow-y-auto max-h-[calc(70vh-80px)] p-4">
                            <div className="text-pink-700 text-lg font-bold mb-4 text-center">
                              Provide your own API Key to use Anthropic & OpenAI models in Settings
                            </div>
                            {Object.entries(groupedModels).map(
                              ([provider, models]) => (
                                <div key={provider} className="mb-4">
                                  <div className="px-2 py-1.5 text-xs font-semibold text-pink-300 uppercase tracking-wide border-b border-pink-400/20 mb-2">
                                    {provider}
                                  </div>
                                  {models.map((model) => (
                                    <button
                                      key={model.id}
                                      type="button"
                                      onClick={() => {
                                        onModelSelect(model.id);
                                        onDropdownClose();
                                      }}
                                      className={`w-full rounded-lg px-3 py-3 text-left text-sm mb-2
                                              hover:bg-pink-400/20 transition-all duration-200 ${
                                                selectedModel === model.id
                                                  ? "bg-pink-400/25 border border-pink-400/40"
                                                  : "hover:border hover:border-pink-400/20"
                                              }`}
                                    >
                                      <div className="text-white font-medium">
                                        {model.name}
                                      </div>
                                      <div className="text-xs text-pink-200/70 mt-1">
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
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  {(status === "streaming" || status === "submitted") && (
                    <button
                      type="button"
                      onClick={onStop}
                      className="px-2 py-1 rounded-full bg-pink-400/20 text-white text-xs
                               hover:bg-pink-400/30 transition-all duration-200"
                      aria-label="Stop"
                      disabled={isLoading === false}
                    >
                      Stop
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={`h-7 w-7 rounded-full flex items-center justify-center
                              transition-all duration-200 ${
                                input.trim() && !isLoading
                                  ? "bg-pink-400/30 text-gray-200 hover:bg-pink-400/40 hover:scale-105"
                                  : "bg-pink-200/10 text-gray-500 cursor-not-allowed"
                              }`}
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
          {/* Main input container */}
          <div className="bg-pink-300/15 backdrop-blur-md rounded-t-2xl border border-pink-200/20 p-1">
            {/* Display current attachments */}
            {attachments.length > 0 && (
              <div className="px-5 pt-3">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="relative">
                      {attachment.contentType?.startsWith("image/") ? (
                        <img
                          src={attachment.url}
                          alt={attachment.name || "Attachment"}
                          className="w-16 h-16 rounded-lg object-cover border border-gray-600"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center border border-gray-600">
                          <span className="text-xs text-gray-300 text-center px-1">
                            {attachment.name || "File"}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, i) => i !== index)
                        )
                        }
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isUploading && (
              <div className="px-5 pt-3 pb-1">
                <div className="flex items-center gap-3 text-xs text-pink-200/80">
                  <div className="flex-1 bg-pink-400/20 rounded-full h-1.5">
                    <div 
                      className="bg-pink-400 h-1.5 rounded-full transition-all duration-300"
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
                  disabled={isLoading || error !== null}
                  rows={1}
                  className="w-full resize-none bg-transparent text-gray-200 placeholder-gray-400 
                           focus:outline-none text-base leading-relaxed
                           disabled:cursor-not-allowed disabled:opacity-50"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !isLoading &&
                      input.trim()
                    ) {
                      e.preventDefault();
                      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
                    }
                  }}
                />
              </div>

              {/* Bottom controls - desktop */}
              <div className="flex items-center justify-between px-3 pb-3">
                {/* Left controls */}
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => {
                      if (e.target.files) {
                        startUpload(Array.from(e.target.files));
                      }
                    }}
                    className="hidden"
                    multiple
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
                    aria-label="Add attachment"
                    disabled={isUploading}
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  {/* Model selector - desktop */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={onDropdownToggle}
                      disabled={isLoading}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 
                               transition-colors duration-200 disabled:opacity-80"
                    >
                      <span>{currentModel?.name || "GPT-4.1"}</span>
                      <ChevronDown className="h-3 w-3" />
                    </button>

                    {/* Desktop Dropdown */}
                    {isDropdownOpen && (
                      <div
                        className="absolute bottom-full mb-2 w-[480px] rounded-2xl border border-pink-200/30 
                                     bg-black/90 shadow-2xl z-20 overflow-hidden"
                      >
                        <div className="max-h-80 overflow-y-auto p-6">
                          <h1 className="text-pink-700 text-lg font-bold mb-4 text-center">
                            Provide your own API Key to use Anthropic & OpenAI models in Settings
                          </h1>
                          {Object.entries(groupedModels).map(
                            ([provider, models]) => (
                              <div key={provider} className="mb-3">
                                <div className="px-2 py-1.5 text-xs font-semibold text-pink-300 uppercase tracking-wide border-b border-pink-400/20 mb-2">
                                  {provider}
                                </div>
                                {models.map((model) => (
                                  <button
                                    key={model.id}
                                    type="button"
                                    onClick={() => {
                                      onModelSelect(model.id);
                                      onDropdownClose();
                                    }}
                                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm mb-1
                                            hover:bg-pink-400/20 transition-all duration-200 hover:scale-[1.02] ${
                                              selectedModel === model.id
                                                ? "bg-pink-400/25 border border-pink-400/40"
                                                : "hover:border hover:border-pink-400/20"
                                            }`}
                                  >
                                    <div className="text-white font-medium">
                                      {model.name}
                                    </div>
                                    <div className="text-xs text-pink-200/70 mt-0.5">
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
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2">
                  {(status === "streaming" || status === "submitted") && (
                    <button
                      type="button"
                      onClick={onStop}
                      className="px-3 py-1.5 rounded-full bg-pink-400/20 text-white text-sm
                               hover:bg-pink-400/30 transition-all duration-200"
                      aria-label="Stop"
                      disabled={isLoading === false}
                    >
                      Stop
                    </button>
                  )}

                  {/* Send button - sleek design */}
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className={`h-8 w-8 rounded-full flex items-center justify-center
                              transition-all duration-200 ${
                                input.trim() && !isLoading
                                  ? "bg-pink-400/30 text-gray-200 hover:bg-pink-400/40 hover:scale-105"
                                  : "bg-pink-200/10 text-gray-500 cursor-not-allowed"
                              }`}
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