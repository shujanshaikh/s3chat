import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function RedirectToThread() {
  const navigate = useNavigate();
  const threads = useQuery(api.threads.getThreads);
  const createThread = useMutation(api.threads.create);

  useEffect(() => {
    async function go() {
      if (threads === undefined) return;
      if (threads.length > 0) {
        navigate(`/chat/${threads[0].threadId}`);
      } else {
        const uuid = crypto.randomUUID();
        const threadId = await createThread({ 
          title: "New Chat",
          threadId: uuid 
        });
        navigate(`/chat/${threadId}`);
      }
    }
    go();
  }, [threads, navigate, createThread]);

  return null;
}
