
export function getApiKey(
    provider: string,
    headerKey?: string | undefined
  ): string | undefined {
    // If headerKey is provided (from user), use it
    if (headerKey) {
      console.log(`Using user's ${provider} API key`);
      return headerKey;
    }
  
    // Fallback to your env variables
    console.log(`Using default ${provider} API key from env`);
    switch (provider) {
      case "OpenAI":
        return process.env.OPENAI_API_KEY;
      case "Anthropic":
        return process.env.ANTHROPIC_API_KEY;
      case "Google":
        return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      case "Groq":
        return process.env.GROQ_API_KEY;
      default:
        return undefined;
    }
  }