import { useParams } from "react-router-dom";
import { Authenticated, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Attachment, UIMessage } from "ai";
import ResizableChatLayout from "../components/ResizableChatLayout";

function convertToUIMessages(messages: any[] | undefined): Array<UIMessage> {
  if (!messages) return [];
  return messages.map((message) => ({
    id: message._id,
    parts: message.parts as UIMessage["parts"],
    role: message.role,
    content: message.content,
    createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
    experimental_attachments: (message.attachments as Array<Attachment>) ?? [],
  }));
}

export default function ChatPageComponent() {
  const { threadId } = useParams();
  const dbMessages = useQuery(api.messages.getMessages, {
    threadId: threadId!,
  });

  const initialMessages = convertToUIMessages(dbMessages);


  return (
    <Authenticated> 
    <ResizableChatLayout
      threadId={threadId!}
      initialMessages={initialMessages}
    />
    </Authenticated>
  );
}
