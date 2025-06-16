import { useCompletion } from "@ai-sdk/react";
import { Id } from "../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { NextResponse } from "next/server";

interface MessageSummary {
  title: string;
  isTitle?: boolean;
  threadId: Id<"threads">;
  messageId: Id<"messages">;
}

export const useMessageSummary = () => {
  const createMessageSummary = useMutation(api.messagesummary.createMessageSummary);
  const updateThread = useMutation(api.threads.updateThreads);

  const { complete, isLoading } = useCompletion({
    api: "/api/generatetitle",
    onResponse: async (response) => {
      try {
        const payload: MessageSummary = await response.json();

        if (response.ok) {
          const { title, isTitle, threadId } = payload;
          if (isTitle) {
            await updateThread({
              threadId,
              newTitle: title,
            });
            await createMessageSummary({
              threadId,
              title,
            });
          } else {
            await createMessageSummary({
              title,
              threadId,
            });
          }
        }
      } catch (error) {
        console.error(error);
        NextResponse.json(
          {
            error: "Internal Server Error",
          },
          {
            status: 500,
          }
        );
      }
    },
  });

  return {
    complete,
    isLoading,
  };
};
