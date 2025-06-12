import { useParams } from "react-router-dom";
import Chat from "./Chat"; // Adjust path to your Chat component
import { Id } from "../../../convex/_generated/dataModel"; // Adjust path

export default function ChatPage() {
  // Get the threadId from the URL
  const { threadId } = useParams<{ threadId: Id<"threads"> }>();

  // This is a safeguard in case the URL is somehow invalid
  if (!threadId) {
    return <div>Invalid Chat ID</div>;
  }

  // Render the Chat component and pass the threadId as both a prop AND the key.
  // The `key` is what forces React to create a new component instance on change.
  return <Chat key={threadId} threadId={threadId} />;
}