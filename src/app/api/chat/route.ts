import { NextRequest } from "next/server";
import { LanguageModelV1, smoothStream, streamText } from "ai";
import { systemprompt } from "@/lib/systemprompt";
import { DEFAULT_MODEL, getModel } from "@/lib/models";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { AIModel, getModelConfig } from "@/lib/modelConfig";
import { headers } from "next/headers";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

const FREE_LIMIT = 1000;

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

    const converUser = await convex.query(api.user.getUserById, {
      userId: convexUserId,
    });

    const userUsage = await convex.query(api.usage.getUsage, {
      userId: convexUserId,
    });

    const { messages, model } = await req.json();

    const headersList = await headers();

    const modelConfig = getModelConfig(model || (DEFAULT_MODEL as AIModel));

    if (!modelConfig) {
      console.log("Invalid model", model);
      return new Response("Invalid model", { status: 400 });
    }

    const apiKeyfromHeaders =
      headersList.get(modelConfig.headerKey) || undefined;

    const skipUsageTracking = !!apiKeyfromHeaders;

    if (
      !skipUsageTracking &&
      converUser?.plan === "free" &&
      userUsage &&
      userUsage.totalTokens >= FREE_LIMIT
    ) {
      return new Response("Free limit reached", { status: 403 });
    }

    const result = streamText({
      model: getModel(
        model || DEFAULT_MODEL,
        apiKeyfromHeaders
      ) as LanguageModelV1,
      messages,
      system: systemprompt,
      experimental_transform: [smoothStream({ chunking: "word" })],
      abortSignal: req.signal,
      onFinish: async (result) => {
        if (!skipUsageTracking) {
          await convex.mutation(api.usage.createUsage, {
            userId: convexUserId,
            model: model,
            totalTokens:
              result.steps[result.steps.length - 1].usage.completionTokens,
          });
        }
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
