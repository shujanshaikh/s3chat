export const AI_MODELS = [
    "Gemini 2.5 Pro",
    "Gemini 2.5 Flash", 
    "Gemini 2.0 Flash Lite",
    "Claude 3.5 Sonnet",
    "Claude 3.7 Sonnet",
    "Claude 4 Sonnet",
    "GPT-4o",
    "GPT-4.1",
    "Llama 4 Scout 17B",
    "DeepSeek R1 Distill Llama 70B",
    "Gemini 1.5 Flash Latest",
    "Gemini 1.5 Pro Latest",
    "Llama 3.3 70B Versatile",
  ] as const;
  
  export type AIModel = (typeof AI_MODELS)[number];
  
  export type ModelConfig = {
    modelId: string;
    provider: "google" | "anthropic" | "openai" | "groq";
    headerKey: string;
  };
  
  export const MODEL_CONFIGS: Record<AIModel, ModelConfig> = {
    "Gemini 2.5 Pro": {
      modelId: "gemini-2.5-pro",
      provider: "google",
      headerKey: "x-google-api-key",
    },
    "Gemini 2.5 Flash": {
      modelId: "gemini-2.5-flash",
      provider: "google", 
      headerKey: "x-google-api-key",
    },
    "Gemini 2.0 Flash Lite": {
      modelId: "gemini-2.0-flash-lite",
      provider: "google",
      headerKey: "x-google-api-key",
    },
    "Claude 3.5 Sonnet": {
      modelId: "claude-3.5-sonnet",
      provider: "anthropic",
      headerKey: "x-anthropic-api-key",
    },
    "Claude 3.7 Sonnet": {
      modelId: "claude-3.7-sonnet",
      provider: "anthropic",
      headerKey: "x-anthropic-api-key",
    },
    "Claude 4 Sonnet": {
      modelId: "claude-4-sonnet",
      provider: "anthropic",
      headerKey: "x-anthropic-api-key",
    },
    "GPT-4o": {
      modelId: "gpt-4o",
      provider: "openai",
      headerKey: "x-openai-api-key",
    },
    "GPT-4.1": {
      modelId: "gpt-4.1",
      provider: "openai",
      headerKey: "x-openai-api-key",
    },
    "Llama 4 Scout 17B": {
      modelId: "meta-llama/llama-4-scout-17b-16e-instruct",
      provider: "groq",
      headerKey: "x-groq-api-key",
    },
    "DeepSeek R1 Distill Llama 70B": {
      modelId: "deepseek-r1-distill-llama-70b",
      provider: "groq",
      headerKey: "x-groq-api-key",
    },
    "Gemini 1.5 Flash Latest": {
      modelId: "gemini-1.5-flash-latest",
      provider: "google",
      headerKey: "x-google-api-key",
    },
    "Gemini 1.5 Pro Latest": {
      modelId: "gemini-1.5-pro-latest",
      provider: "google",
      headerKey: "x-google-api-key",  
    },
    "Llama 3.3 70B Versatile": {
      modelId: "llama-3.3-70b-versatile",
      provider: "groq",
      headerKey: "x-groq-api-key",
    },
  };
  
  export const MODEL_ID_TO_CONFIG_KEY: Record<string, AIModel> = {
    "gemini-2.5-pro": "Gemini 2.5 Pro",
    "gemini-2.5-flash": "Gemini 2.5 Flash",
    "gemini-2.0-flash-lite": "Gemini 2.0 Flash Lite",
    "claude-3.5-sonnet": "Claude 3.5 Sonnet", 
    "claude-3.7-sonnet": "Claude 3.7 Sonnet",
    "claude-4-sonnet": "Claude 4 Sonnet",
    "gpt-4o": "GPT-4o",
    "gpt-4.1": "GPT-4.1",
    "meta-llama/llama-4-scout-17b-16e-instruct" : "Llama 4 Scout 17B",
    "deepseek-r1-distill-llama-70b": "DeepSeek R1 Distill Llama 70B",
    "gemini-1.5-flash-latest": "Gemini 1.5 Flash Latest",
    "gemini-1.5-pro-latest": "Gemini 1.5 Pro Latest",
    "llama-3.3-70b-versatile": "Llama 3.3 70B Versatile",
  };
  

  export function getModelConfig(modelId: string): ModelConfig | undefined {
    const configKey = MODEL_ID_TO_CONFIG_KEY[modelId];
    if (!configKey) return undefined;
    return MODEL_CONFIGS[configKey];
  }