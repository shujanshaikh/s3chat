"use client"

import { ArrowUp, ChevronDown, Paperclip } from "lucide-react"
import type React from "react"
import { useRef, useEffect, useCallback } from "react"

interface MessageBoxProps {
  input: string
  isLoading: boolean
  currentModel?: { name: string; id: string }
  selectedModel: string
  groupedModels: Record<string, Array<{ id: string; name: string; description: string; category: string }>>
  isDropdownOpen: boolean
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  onStop: () => void
  status: string
  onModelSelect: (modelId: string) => void
  onDropdownToggle: () => void
  onDropdownClose: () => void
  error: string | null
  reload: () => void
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
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Handle clicking outside dropdown
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onDropdownClose()
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onDropdownClose()
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [onDropdownClose])

  // Auto-resize textarea
  const autoResize = useCallback((ta: HTMLTextAreaElement) => {
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px"
  }, [])

  useEffect(() => {
    if (inputRef.current) autoResize(inputRef.current)
  }, [input, autoResize])

  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      {/* Simple, unique message box */}
      <div className="relative">
        {/* Main input container */}
        <div className="bg-pink-300/15 backdrop-blur-md rounded-t-2xl border border-pink-200/20 p-1">
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
                  if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim()) {
                    e.preventDefault()
                    onSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
                  }
                }}
              />
            </div>

            {/* Bottom controls - inline and minimal */}
            <div className="flex items-center justify-between px-3 pb-3">
              {/* Left controls */}
              <div className="flex items-center gap-3">
                {/* Model selector - minimal */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={onDropdownToggle}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 
                             transition-colors duration-200 disabled:opacity-50"
                  >
                    <span>{currentModel?.name || "GPT-4.1"}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>

                  {/* Dropdown */}
                  {isDropdownOpen && (
                    <div
                      className="absolute bottom-full mb-2 w-72 rounded-2xl border border-pink-200/30 
                                   bg-gray-800 backdrop-blur-xl shadow-2xl z-20 no-scrollbar"
                    >
                      <div className="max-h-40 overflow-y-auto no-scrollbar p-3">
                        {Object.entries(groupedModels).map(([provider, models]) => (
                          <div key={provider} className="mb-3">
                            <div className="px-2 py-1.5 text-xs font-semibold text-pink-300 uppercase tracking-wide border-b border-pink-400/20 mb-2">
                              {provider}
                            </div>
                            {models.map((model) => (
                              <button
                                key={model.id}
                                type="button"
                                onClick={() => {
                                  onModelSelect(model.id)
                                  onDropdownClose()
                                }}
                                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm mb-1
                                          hover:bg-pink-400/20 transition-all duration-200 hover:scale-[1.02] ${
                                            selectedModel === model.id ? "bg-pink-400/25 border border-pink-400/40" : "hover:border hover:border-pink-400/20"
                                          }`}
                              >
                                <div className="text-white font-medium">{model.name}</div>
                                <div className="text-xs text-pink-200/70 mt-0.5">{model.description}</div>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Attach button - minimal */}
                <button type="button" className="text-gray-400 hover:text-gray-300 transition-colors duration-200">
                  <Paperclip className="h-4 w-4" />
                </button>
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-2">
                {(status === "streaming" || status === "submitted") && (
                  <button
                    type="button"
                    onClick={onStop}
                    className="px-3 py-1.5 rounded-full bg-pink-400/20 text-gray-300 text-xs 
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
  )
}
