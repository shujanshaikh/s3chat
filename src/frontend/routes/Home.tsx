import { Authenticated, Unauthenticated } from "convex/react";
import { UserMenu } from "../components/auth/UserMenu";
import { UnauthenticatedLayout } from "../components/auth/UnauthenticatedLayout";
import ChatPage from "./ChatPage";

export default function Home() {
  return (
    <>
      <Authenticated>
        <ChatPage />
      </Authenticated>
      <Unauthenticated>
        <UnauthenticatedLayout />
      </Unauthenticated>
    </>
  );
}