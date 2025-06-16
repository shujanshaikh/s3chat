import { NextRequest, NextResponse } from "next/server";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export async function POST(req: NextRequest) {
  try {
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY,
    });

    const { prompt, isTitle, threadId } = await req.json();

    const { text: title } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      system: `\n
      - you will generate a short title based on the first message a user begins a conversation with
      - ensure it is not more than 80 characters long
      - the title should be a summary of the user's message
      - you should NOT answer the user's message, you should only generate a summary/title
      - do not use quotes or colons`,
      maxTokens: 100,
      temperature: 0.5,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });

    return NextResponse.json({ title, isTitle, threadId });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
