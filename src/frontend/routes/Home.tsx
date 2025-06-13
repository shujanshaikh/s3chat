import { Authenticated } from "convex/react";
import { UserMenu } from "../components/auth/UserMenu";
import { UnauthenticatedLayout } from "../components/auth/UnauthenticatedLayout";
import ChatPage from "./ChatPage";


export default function Home() {


  return (
    <>
      <Authenticated>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 flex flex-col">
          <header className="flex justify-end p-6">
            <UserMenu />
          </header>
          <main className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-3xl bg-gray-800 rounded-lg shadow-lg p-8">
              <ChatPage />
            </div>
          </main>
        </div>
      </Authenticated>
      <UnauthenticatedLayout />
    </>
  );
}