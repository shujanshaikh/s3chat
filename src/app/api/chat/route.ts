import { NextRequest, NextResponse } from "next/server";
import { LanguageModelV1, Message, smoothStream, streamText } from "ai";
import { systemprompt } from "@/lib/systemprompt";
import { DEFAULT_MODEL, getModel } from "@/lib/models";
import { auth } from "@clerk/nextjs/server";
import { AIModel, getModelConfig } from "@/lib/modelConfig";
import { headers } from "next/headers";
import { webSearch } from "@/lib/webSearch";
import { api } from "../../../../convex/_generated/api";
import { CONVEX_HTTP_CLIENT } from "@/frontend/localdb/convex/convex-http";


const FREE_MESSAGES_LIMIT = 1000;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({
        message: "No user found"
      }, { status: 401 });
    }

    const usage = await CONVEX_HTTP_CLIENT.query(api.usage.getUsage, {
      clerkId: session.userId!,
    }); 

    const { messages, model, webSearch: isWebSearchEnabled } : { messages: Message[], model: string, webSearch: boolean } = await req.json();
    
    const webSearchEnabled = Boolean(isWebSearchEnabled);
    
    const headersList = await headers();

    const modelConfig = getModelConfig(model || (DEFAULT_MODEL as AIModel));

    const apiKeyfromHeaders =
      headersList.get(modelConfig!.headerKey) || undefined;

    
      const skipUsageTracking = !!apiKeyfromHeaders;

      if (
        !skipUsageTracking &&
        usage &&
        usage.messagesCount >= FREE_MESSAGES_LIMIT
      ) {
        console.log("Free limit reached");
        return new Response("Free limit reached", { status: 403 });
      }

    const result = streamText({
      model: getModel(
        model || DEFAULT_MODEL,
        apiKeyfromHeaders
      ) as LanguageModelV1,
      messages,
      experimental_transform: [smoothStream({ chunking: "word" })],
      maxSteps: 3,
      system: systemprompt,
      tools: webSearchEnabled ? {
        webSearch,
      } : undefined,
      toolCallStreaming: true,
      abortSignal: req.signal,
      onFinish: async (result) => {
        if(!skipUsageTracking) {
        await CONVEX_HTTP_CLIENT.mutation(api.usage.createUsage, {
            clerkId: session.userId!,
            messagesCount: result.usage.totalTokens,
          });
        }
      }
    });

    return result.toDataStreamResponse({
      sendReasoning: true,
    });

  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
