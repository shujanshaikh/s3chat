import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createGroq } from "@ai-sdk/groq";
import { getApiKey } from "./getApiKey";


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
    id: "gpt-4.1",
    name: "GPT-4.1",
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
    id: "claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet",
    provider: "Anthropic",
    category: "Premium",
    description: "Latest Claude with excellent reasoning and coding",
  },
  {
    id: "claude-4-sonnet",
    name: "Claude 4 Sonnet",
    provider: "Anthropic",
    category: "Premium",
    description: "Latest Claude with excellent reasoning and coding",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    provider: "Google",
    category: "Premium",
    description: "Most capable Google model with 1M token context",
  }, 
  {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    provider: "Google",
    category: "Premium",
    description: "High-performance open-source model",
  },
  {
    id: "meta-llama/llama-4-scout-17b-16e-instruct",
    name: "Llama 4 Scout 17B 16E Instruct",
    provider: "Groq",
    category: "Premium",
    description: "High-performance open-source model",
  },
];

// Default model
export const DEFAULT_MODEL = "gemini-2.5-flash";

// Model selection function
export const getModel = (modelName: string, apiKeyOverride?: string) => {
  switch (modelName) {
    // OpenAI Models
    case "gpt-4o":
      return createOpenAI({
        apiKey: getApiKey("OpenAI", apiKeyOverride),
      })("gpt-4o");
    case "gpt-4o-mini":
      return createOpenAI({
        apiKey: getApiKey("OpenAI", apiKeyOverride),
      })("gpt-4o-mini");
    case "gpt-4.1" :
      return createOpenAI({
        apiKey: getApiKey("OpenAI", apiKeyOverride),
      })("gpt-4.1");

    // Anthropic Models
    case "claude-3.5-sonnet":
      return createAnthropic({
        apiKey: getApiKey("Anthropic", apiKeyOverride),
      })("claude-3.5-sonnet");
    case "claude-3.7-sonnet":
      return createAnthropic({
        apiKey: getApiKey("Anthropic", apiKeyOverride),
      })("claude-3.7-sonnet");
    case "claude-4-sonnet":
      return createAnthropic({
        apiKey: getApiKey("Anthropic", apiKeyOverride),
      })("claude-4-sonnet");

    // Google Models
    case "gemini-2.5-flash":
      return createGoogleGenerativeAI({
        apiKey: getApiKey("Google", apiKeyOverride),
      })("gemini-2.5-flash-preview-04-17");
    case "gemini-2.5-pro":
      return createGoogleGenerativeAI({
        apiKey: getApiKey("Google", apiKeyOverride),
      })("gemini-2.5-pro-preview-05-06");
    case "gemini-2.0-flash-lite":
      return createGoogleGenerativeAI({
        apiKey: getApiKey("Google", apiKeyOverride ),
      })("gemini-2.0-flash-lite");


    // Groq Models
    case "meta-llama/llama-4-scout-17b-16e-instruct":
      return createGroq({
        apiKey: getApiKey("Groq", apiKeyOverride),
      })("meta-llama/llama-4-scout-17b-16e-instruct");

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
  return models.reduce(
    (acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    },
    {} as Record<string, ModelInfo[]>
  );
};
