import { ArrowUp, ChevronDown } from "lucide-react"
import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"

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
  onModelSelect: (modelId: string) => void
  onDropdownToggle: () => void
  onDropdownClose: () => void
}

export default function MessageBox({ 
  input, 
  isLoading, 
  currentModel, 
  selectedModel,
  groupedModels,
  isDropdownOpen,
  onInputChange, 
  onSubmit,
  onModelSelect,
  onDropdownToggle,
  onDropdownClose
}: MessageBoxProps) {
  const [isFocused, setIsFocused] = useState(false)
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
    <div className="inset-x-16 bottom-0 z-40 px-40">
      {/* Outer container with blur effect */}
      <div className="backdrop-blur-md bg-[#2b2832]/40 border-t border-purple-800/20">
        <div className="w-full px-4 py-4 pb-0">
          {/* Inner container with slight transparency */}
          <div className="w-full rounded-t-2xl border border-purple-800/30 bg-[#3a3a4a]/70 backdrop-blur-sm p-4">
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Text Input Area */}
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={onInputChange}
                  placeholder="Type your message here..."
                  disabled={isLoading}
                  rows={3}
                  className="w-full resize-none bg-transparent text-base text-gray-200
                           placeholder-gray-400 focus:outline-none
                           disabled:cursor-not-allowed disabled:opacity-50"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isLoading && input.trim()) {
                      e.preventDefault()
                      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
                    }
                  }}
                />
              </div>

              {/* Bottom Controls - Only Model Selector and Send Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {/* Model Selector */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={onDropdownToggle}
                      disabled={isLoading}
                      className="flex items-center gap-2 rounded-lg bg-[#2a2a3a]/60 backdrop-blur-sm px-3 py-2
                               text-sm text-gray-200 hover:bg-[#323242]/70
                               focus:outline-none focus:ring-1 focus:ring-purple-500
                               disabled:opacity-50 transition-all duration-200"
                    >
                      <span>{currentModel?.name || "Gemini 2.5 Pro"}</span>
                      <ChevronDown className="h-4 w-4" />
                    </button>

                    {/* Dropdown */}
                    {isDropdownOpen && (
                      <div
                        className="absolute bottom-full mb-2 w-64 rounded-lg border border-purple-800/30
                                     bg-[#3a3a4a]/90 backdrop-blur-md shadow-lg"
                      >
                        <div className="max-h-48 overflow-y-auto p-2">
                          {Object.entries(groupedModels).map(([provider, models]) => (
                            <div key={provider} className="mb-2">
                              <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase">{provider}</div>
                              {models.map((model) => (
                                <button
                                  key={model.id}
                                  type="button"
                                  onClick={() => {
                                    onModelSelect(model.id)
                                    onDropdownClose()
                                  }}
                                  className={`w-full rounded-md px-2 py-1.5 text-left text-sm
                                            hover:bg-[#2a2a3a]/60 transition-colors duration-150 ${
                                              selectedModel === model.id ? "bg-purple-600/20" : ""
                                            }`}
                                >
                                  <div className="text-gray-200">{model.name}</div>
                                  <div className="text-xs text-gray-400">{model.description}</div>
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg
                            focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all duration-200 ${
                              input.trim() && !isLoading
                                ? "bg-purple-600/80 backdrop-blur-sm text-white hover:bg-purple-500/90"
                                : "bg-[#2a2a3a]/60 backdrop-blur-sm text-gray-500 cursor-not-allowed"
                            }`}
                >
                  <ArrowUp className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}