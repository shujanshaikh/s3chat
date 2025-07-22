import { ChatInit } from "../components/ChatInit";
import ProtectedRoute from "../components/ProtectedRoute";
import { UnauthenticatedLayout } from "../components/auth/UnauthenticatedLayout";

export default function Home() {
  return (
    <ProtectedRoute
      fallback={<UnauthenticatedLayout />}
    >
      <ChatInit />
    </ProtectedRoute>
  );
}
