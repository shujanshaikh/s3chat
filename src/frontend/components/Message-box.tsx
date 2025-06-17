"use client";

import { ArrowUp, ChevronDown } from "lucide-react";
import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";

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
}: MessageBoxProps) {
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle clicking outside dropdown
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

  // Auto-resize textarea
  const autoResize = useCallback((ta: HTMLTextAreaElement) => {
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, []);

  useEffect(() => {
    if (inputRef.current) autoResize(inputRef.current);
  }, [input, autoResize]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Outer container with blur effect */}
      
      <div className="backdrop-blur-md bg-[#2b2832]/30 border-t border-purple-800/20">
        <div className="w-full px-2 sm:px-4 py-2 sm:py-4 pb-0">
          {/* Inner container with slight transparency */}
          <div className="w-full rounded-t-xl sm:rounded-t-2xl border border-purple-800/30 bg-[#3a3a4a]/60 backdrop-blur-md p-3 sm:p-4">
            <form onSubmit={onSubmit} className="space-y-3 sm:space-y-4">
              
              {/* Text Input Area */}
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={onInputChange}
                  placeholder="Type your message here..."
                  disabled={isLoading || error !== null}
                  rows={3}
                  className="w-full resize-none bg-transparent text-sm sm:text-base text-gray-200
                           placeholder-gray-400 focus:outline-none
                           disabled:cursor-not-allowed disabled:opacity-50"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !isLoading &&
                      input.trim()
                    ) {
                      e.preventDefault();
                      onSubmit(
                        e as unknown as React.FormEvent<HTMLFormElement>
                      );
                    }
                  }}
                />
              </div>

              {/* Bottom Controls - Only Model Selector and Send Button */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center flex-1">
                  {/* Model Selector */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={onDropdownToggle}
                      disabled={isLoading}
                      className="flex items-center gap-1 sm:gap-2 rounded-lg bg-[#2a2a3a]/50 backdrop-blur-sm 
                               px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-200 
                               hover:bg-[#323242]/60 focus:outline-none focus:ring-1 focus:ring-purple-500
                               disabled:opacity-50 transition-all duration-200 max-w-[140px] sm:max-w-none"
                    >
                      <span className="truncate">
                        {currentModel?.name || "Gemini 2.5 Pro"}
                      </span>
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                      <div
                        className="absolute bottom-full mb-2 w-56 sm:w-64 max-w-[calc(100vw-2rem)] 
                                   rounded-lg border border-purple-800/30 bg-[#3a3a4a]/85 backdrop-blur-md shadow-lg
                                   left-0 sm:left-auto"
                      >
                        <div className="max-h-40 sm:max-h-48 overflow-y-auto p-2">
                          {Object.entries(groupedModels).map(
                            ([provider, models]) => (
                              <div key={provider} className="mb-2">
                                <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">
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
                                    className={`w-full rounded-md px-2 py-1.5 text-left text-xs sm:text-sm
                                            hover:bg-[#2a2a3a]/50 transition-colors duration-150 ${
                                              selectedModel === model.id
                                                ? "bg-purple-600/20"
                                                : ""
                                            }`}
                                  >
                                    <div className="text-gray-200 truncate">
                                      {model.name}
                                    </div>
                                    <div className="text-xs text-gray-400 truncate">
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

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg
                            focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200 flex-shrink-0 ${
                              input.trim() && !isLoading
                                ? "bg-purple-600/70 backdrop-blur-sm text-white hover:bg-purple-500/80"
                                : "bg-[#2a2a3a]/50 backdrop-blur-sm text-gray-500 cursor-not-allowed"
                            }`}
                >
                  <ArrowUp className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                {/* Stop Button */}
                {(status === "streaming" || status === "submitted") && (
                  <button
                    type="button"
                    onClick={onStop}
                    className="ml-2 flex items-center px-3 py-1.5 rounded-lg bg-purple-600/80 text-white text-xs sm:text-sm hover:bg-purple-500/80 transition-all"
                    aria-label="Stop"
                    disabled={isLoading === false}
                  >
                    Stop
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
