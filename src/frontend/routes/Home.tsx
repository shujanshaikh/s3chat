import { Authenticated, Unauthenticated } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Id } from "../../../convex/_generated/dataModel";
import { useParams } from "react-router-dom";
import ChatPage from "../components/ChatPage";

export default function Home() {
    const { threadId } = useParams<{ threadId: Id<"threads"> }>();
    console.log(threadId);  
  return (
    <>
      <Authenticated>
        <UserButton />
        <ChatPage />
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
    </>
  );
}