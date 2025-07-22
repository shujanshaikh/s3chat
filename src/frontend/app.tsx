import { BrowserRouter, Route, Routes } from "react-router-dom";
import ChatPageComponent from "./routes/ChatPage";
import Setting from "./routes/Setting";
import Home from "./routes/Home";
import { ChatInit } from "./components/ChatInit";
import ProtectedRoute from "./components/ProtectedRoute";
import { UnauthenticatedLayout } from "./components/auth/UnauthenticatedLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <ProtectedRoute fallback={<UnauthenticatedLayout />}>
              <ChatInit />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat/:threadId" 
          element={
            <ProtectedRoute fallback={<UnauthenticatedLayout />}>
              <ChatPageComponent />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/setting" 
          element={
            <ProtectedRoute fallback={<UnauthenticatedLayout />}>
              <Setting />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
