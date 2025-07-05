import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api"; 

export function NewChatButton() {
  const createThread = useMutation(api.threads.create);
  const navigate = useNavigate();

  const threadId = crypto.randomUUID();

  const handleNewChat = async () => {
    try {
      await createThread({
        title: "New Chat",
        threadId: threadId,
      });
      
      navigate(`/chat/${threadId}`);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  return (
    <button
      onClick={handleNewChat}
      className="w-full rounded-lg bg-gradient-to-br from-indigo-800/15 to-indigo-600/30 px-4 py-2 text-sm font-extrabold text-white shadow-lg transition-all duration-200 hover:bg-indigo-700"
    >
      New Chat
    </button>
  );
}