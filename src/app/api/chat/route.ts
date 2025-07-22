import { NextRequest, NextResponse } from "next/server";
import { appendClientMessage, appendResponseMessages, LanguageModelV1, smoothStream, streamText, UIMessage } from "ai";
import { systemprompt } from "@/lib/systemprompt";
import { DEFAULT_MODEL, getModel } from "@/lib/models";
import { auth } from "@clerk/nextjs/server";
import { webSearch } from "@/lib/webSearch";
import { api } from "../../../../convex/_generated/api";
import { CONVEX_HTTP_CLIENT } from "@/frontend/localdb/convex/convex-http";
import { generateTitleFromUserMessage } from "@/lib/generateTitle";
import { getTrailingMessageId } from "@/lib/utils";




export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({
        message: "No user found"
      }, { status: 401 });
    }

 

    const { message, model, webSearch: isWebSearchEnabled , threadId } : { message: UIMessage, model: string, webSearch: boolean , threadId: string } = await req.json();

    const thread = await CONVEX_HTTP_CLIENT.query(api.threads.getThreadById, {
      threadId
    });

    if(!thread) {
      try {
        const title = await generateTitleFromUserMessage({
          message: message,
        });
        await CONVEX_HTTP_CLIENT.mutation(api.threads.create, {
          threadId: threadId,
          title: title,
          clerkId: session.userId!,
        });
      } catch (error) {
        console.error(error);
        return NextResponse.json({
          message: "Error generating title"
        }, { status: 500 });
      }
    }

    const previousMessages = await CONVEX_HTTP_CLIENT.query(api.messages.getMessages, {
      threadId: threadId,
    });


    const messages = appendClientMessage({
      // @ts-expect-error: todo add type conversion from DBMessage[] to UIMessage[]
      messages: previousMessages,
      message,
    });

    
    await CONVEX_HTTP_CLIENT.mutation(api.messages.createMessage, {
      assistantId: message.id,
      threadId: threadId,
      role: "user",
      content: "",
      model: model,
      parts: message.parts,
      attachments: message.experimental_attachments ?? [],
    });

    const webSearchEnabled = Boolean(isWebSearchEnabled);
    

  

    const result = streamText({
      model: getModel(
        model || DEFAULT_MODEL,
      ) as LanguageModelV1,
      messages,
      experimental_transform: [smoothStream({ chunking: "word" })],
      maxSteps: 5,
      toolCallStreaming: true,
      system: systemprompt,
      tools: webSearchEnabled ? {
        webSearch,
      } : undefined,
      abortSignal: req.signal,
      onFinish: async ({response}) => {
        
      const assistantId = getTrailingMessageId({
        messages: response.messages.filter(
          (message) => message.role === "assistant",
        ),
      });

      if (!assistantId) {
        throw new Error("No assistant message found!");
      }

      const [, assistantMessage] = appendResponseMessages({
        messages: [message],
        responseMessages: response.messages,
      });

      await CONVEX_HTTP_CLIENT.mutation(api.messages.createMessage, {
        assistantId: assistantId,
        threadId: threadId,
        role: "assistant",
        content: assistantMessage.content,
        model: model,
        parts: assistantMessage.parts,
        attachments: assistantMessage.experimental_attachments ?? [],
      });
    }
    });
    result.consumeStream();

    return result.toDataStreamResponse({
      sendReasoning: true,
    });

  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
