import { NextRequest } from "next/server";
import { smoothStream, streamText } from "ai";
import { systemprompt } from "@/lib/systemprompt";
import { DEFAULT_MODEL, getModel } from "@/lib/models";

export async function POST(req: NextRequest) {
  try {
    const { messages, model } = await req.json();

    const result = streamText({
      model: getModel(model || DEFAULT_MODEL),
      messages,
      system: systemprompt,
      experimental_transform: [smoothStream({ chunking: "word" })],
      abortSignal: req.signal,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
