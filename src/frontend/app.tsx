import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatLayout from "./components/ChatLayout";
import ChatPage from "./routes/ChatPage";
import RedirectToNewThread from "./components/RedirectToNewThread";
import Home from "./routes/Home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RedirectToNewThread />} />
          <Route path=":threadId" element={<ChatPage />} />
        </Route>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}