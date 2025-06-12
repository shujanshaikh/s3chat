import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

// Custom provider for Llama (via Together AI)
const together = createOpenAI({
  name: "together",
  apiKey: process.env.TOGETHER_API_KEY,
  baseURL: "https://api.together.xyz/v1",
});

// Model definitions
export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  category: string;
  description: string;
}

export const models: ModelInfo[] = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    provider: "Google",
    category: "Fast",
    description: "Fast, efficient, and capable - great for most tasks",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    category: "Fast",
    description: "Smaller, faster version of GPT-4o with great performance",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    category: "Premium",
    description: "Latest GPT-4 with multimodal capabilities",
  },
  {
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    category: "Premium",
    description: "Latest Claude with excellent reasoning and coding",
  },
  {
    id: "claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    category: "Fast",
    description: "Fastest Claude model with good performance",
  },
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    category: "Standard",
    description: "Popular, cost-effective model for general use",
  },
  {
    id: "claude-3.5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    category: "Premium",
    description: "Latest Claude with excellent reasoning and coding",
  },
  {
    id: "claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    category: "Premium",
    description: "Latest Claude with excellent reasoning and coding",
  },
  {
    id: "llama-3.1-70b",
    name: "Llama 3.1 70B",
    provider: "Meta",
    category: "Premium",
    description: "High-performance open-source model",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    category: "Premium",
    description: "Most capable Google model with 1M token context",
  }
];

// Default model
export const DEFAULT_MODEL = "llama-3.1-70b";

// Model selection function
export const getModel = (modelName: string) => {
  switch (modelName) {
    // OpenAI Models
    case "gpt-4o":
      return openai("gpt-4o");
    case "gpt-4o-mini":
      return openai("gpt-4o-mini");
    case "gpt-3.5-turbo":
      return openai("gpt-3.5-turbo");

    // Anthropic Models
    case "claude-3.5-sonnet":
      return anthropic("claude-3-5-sonnet-20241022");
    case "claude-3-haiku":
      return anthropic("claude-3-haiku-20240307");
    case "claude-3.7-sonnet":
      return anthropic("claude-3-7-sonnet-20250219");
    case "claude-4-sonnet":
      return anthropic("claude-4-sonnet-20250219");
    case "claude-4-haiku":
      return anthropic("claude-4-haiku-20250219");
    case "claude-4-opus":
      return anthropic("claude-4-opus-20250219");


    // Google Models
    case "gemini-2.5-flash":
      return google("gemini-2.5-flash-preview-04-17");
    case "gemini-2.5-pro":
      return google("gemini-2.5-pro-exp-04-24");
    case "gemini-1.5-flash":
      return google("gemini-1.5-flash");

    // Llama Models
    case "llama-3.1-70b":
      return together("meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo");

    // Default to Gemini 1.5 Flash
    default:
      return google(DEFAULT_MODEL);
  }
};

// Utility functions
export const getModelInfo = (modelId: string): ModelInfo | undefined => {
  return models.find((model) => model.id === modelId);
};


export const groupModelsByProvider = (): Record<string, ModelInfo[]> => {
  return models.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, ModelInfo[]>);
};