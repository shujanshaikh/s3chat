import { useMemo } from "react";
import ResizableChatLayout from "./ResizableChatLayout";

export function ChatInit(){
  // Generate a fresh UUID every time this component renders
  // This ensures each new chat gets a unique thread ID
  const threadId = useMemo(() => crypto.randomUUID(), []);

  
  return (
    <ResizableChatLayout 
      threadId={threadId} 
      initialMessages={[]} 
    />
  );
}
