import { useParams } from "react-router-dom";
import Chat from "../components/Chat"; // Adjust path to your Chat component
import { Id } from "../../../convex/_generated/dataModel"; // Adjust path
import RedirectToNewThread from "../components/RedirectToNewThread";

export default function ChatPage() {
  // Get the threadId from the URL
  const { threadId } = useParams<{ threadId: string }>();

  // This is a safeguard in case the URL is somehow invalid
  if (!threadId) {
    return <RedirectToNewThread />;
  }

  // Render the Chat component and pass the threadId as both a prop AND the key.
  // The `key` is what forces React to create a new component instance on change.
  return <Chat key={threadId} threadId={threadId} />;
}