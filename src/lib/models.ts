import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { deepseek } from "@ai-sdk/deepseek";
import {groq} from "@ai-sdk/groq"

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
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    category: "Standard",
    description: "Popular, cost-effective model for general use",
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
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek R1",
    provider: "DeepSeek",
    category: "Premium",
    description: "High-performance open-source model",
  } ,
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    provider: "Google",
    category: "Premium",
    description: "High-performance open-source model",
  } ,
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    name: "Llama 4 Scout 17B 16E Instruct",
    provider: "Groq",
    category: "Premium",
    description: "High-performance open-source model",
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
      return anthropic("claude-3-5-sonnet-20241022")
    case "claude-3.7-sonnet":
      return anthropic("claude-3-7-sonnet-20250219");
    case "claude-4-sonnet":
      return anthropic("claude-4-sonnet-20250514");


    // Google Models
    case "gemini-2.5-flash":
      return google("gemini-2.5-flash-preview-04-17");
    case "gemini-2.5-pro":
      return google("gemini-2.5-pro-exp-04-24");
    case "gemini-2.0-flash-lite":
      return google("gemini-2.0-flash-lite");


    // Llama Models
    case "llama-3.1-70b":
      return together("meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo");

    // DeepSeek Models
    case "deepseek-r1":
      return deepseek("deepseek-chat");

    // Groq Models
    case "meta-llama/llama-4-scout-17b-16e-instruct":
      return groq("meta-llama/llama-4-scout-17b-16e-instruct");

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