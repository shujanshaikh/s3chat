import { NextRequest } from "next/server";
import { smoothStream, streamText } from "ai";
import { systemprompt } from "@/lib/systemprompt";
import { DEFAULT_MODEL, getModel } from "@/lib/models";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const convexUserId = await convex.mutation(api.user.upsertUser, {
      clerkId: clerkId,
      email: user.emailAddresses[0].emailAddress,
      name: user.fullName || "",
    });

    const { messages, model } = await req.json();

    const result = streamText({
      model: getModel(model || DEFAULT_MODEL),
      messages,
      system: systemprompt,
      experimental_transform: [smoothStream({ chunking: "word" })],
      abortSignal: req.signal,
      onFinish: async (result) => {
        await convex.mutation(api.usage.createUsage, {
          userId: convexUserId,
          model: model || DEFAULT_MODEL,
          totalTokens: result.usage.completionTokens,
        });
      },
    });

    return result.toDataStreamResponse({
      sendReasoning: true,
      getErrorMessage(error) {
        if (error instanceof Error) {
          return error.message;
        }
        return "An unknown error occurred";
      },
    });
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
