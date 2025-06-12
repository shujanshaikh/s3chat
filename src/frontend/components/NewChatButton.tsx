import { useMutation } from "convex/react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../convex/_generated/api"; // Adjust path

export function NewChatButton() {
  const createThread = useMutation(api.threads.create);
  const navigate = useNavigate();

  const handleNewChat = async () => {
    try {
      const newThreadId = await createThread({
        title: "New Chat",
      });
      // Navigate to the new chat's URL
      navigate(`/chat/${newThreadId}`);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  return (
    <button
      onClick={handleNewChat}
      className="w-full rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:from-purple-400 hover:to-purple-500"
    >
      + New Chat
    </button>
  );
}