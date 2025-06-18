import { useAPIKeyStore } from "../store/apiKey"
import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card" // Keep imports but remove usage of CardHeader content
import { Separator } from "./ui/separator"
import { Badge } from "./ui/badge"
import { Eye, EyeOff, Key, Trash2, Shield, CheckCircle2 } from "lucide-react"

export function StoreApiKeyForm() {
  const { keys, setKeys, hasRequiredKeys, getKey } = useAPIKeyStore()

  const [openai, setOpenai] = useState(getKey("openai") || "")
  const [anthropic, setAnthropic] = useState(getKey("anthropic") || "")
  const [google, setGoogle] = useState(getKey("google") || "")
  const [groq, setGroq] = useState(getKey("groq") || "")

  const [showKeys, setShowKeys] = useState({
    openai: false,
    anthropic: false,
    google: false,
    groq: false,
  })

  const toggleKeyVisibility = (provider: keyof typeof showKeys) => {
    setShowKeys((prev) => ({ ...prev, [provider]: !prev[provider] }))
  }

  const handleClearAll = () => {
    setKeys({ google: "", openai: "", anthropic: "", groq: "" })
    setOpenai("")
    setAnthropic("")
    setGoogle("")
    setGroq("")
  }

  const providers = [
    {
      id: "openai" as const,
      name: "OpenAI",
      value: openai,
      setValue: setOpenai,
      placeholder: "sk-...",
      description: "GPT-4, GPT-3.5, DALL-E, Whisper",
    },
    {
      id: "anthropic" as const,
      name: "Anthropic",
      value: anthropic,
      setValue: setAnthropic,
      placeholder: "sk-ant-...",
      description: "Claude 3.5 Sonnet, Claude 3 Opus",
    },
    {
      id: "google" as const,
      name: "Google AI",
      value: google,
      setValue: setGoogle,
      placeholder: "AI...",
      description: "Gemini Pro, Gemini Flash",
    },
    {
      id: "groq" as const,
      name: "Groq",
      value: groq,
      setValue: setGroq,
      placeholder: "gsk_...",
      description: "Llama 3, Mixtral, Gemma",
    },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto h-full">
      {/* Made the Card transparent and removed shadow/border */}
      <Card className="bg-transparent border-0 shadow-none">

        {/* Adjusted padding slightly if needed, but space-y-6 inside is good */}
        <CardContent className="space-y-6 pt-0"> {/* Added pt-0 to remove top padding from CardContent */}
          <div className="grid gap-6">
            {providers.map((provider) => (
              <div key={provider.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={provider.id} className="text-white font-medium flex items-center gap-2">
                    <Key className="w-4 h-4 text-purple-400" />
                    {provider.name}
                  </Label>
                  {provider.value && (
                    <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                      Connected
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-2">{provider.description}</p>
                <div className="relative">
                  <Input
                    id={provider.id}
                    type={showKeys[provider.id] ? "text" : "password"}
                    value={provider.value}
                    onChange={(e) => provider.setValue(e.target.value)}
                    onBlur={() => setKeys({ [provider.id]: provider.value })}
                    placeholder={provider.placeholder}
                    className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-500 pr-10 focus:border-purple-500 focus:ring-purple-500/20"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white hover:bg-transparent"
                    onClick={() => toggleKeyVisibility(provider.id)}
                  >
                    {showKeys[provider.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Separator className="bg-gray-600" />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleClearAll}
              variant="outline"
              className="flex-1 bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Keys
            </Button>
          </div>

          <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-600/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-400">Security Notice</p>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Your API keys are stored locally in your browser and never sent to our servers. Keep your keys secure
                  and never share them publicly.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
