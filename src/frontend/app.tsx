import { BrowserRouter, Route, Routes } from "react-router-dom";

import ChatLayout from "./components/ChatLayout";
import ChatPage from "./routes/ChatPage";
import RedirectToNewThread from "./components/RedirectToNewThread";
import Home from "./routes/Home";
import Setting from "./routes/Setting";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="chat" element={
          <ProtectedRoute>
            <ChatLayout />
          </ProtectedRoute>
        }>
          <Route index element={<RedirectToNewThread />} />
          <Route path=":threadId" element={<ChatPage />} />
        </Route>
        <Route path="/" element={<Home />} />
        <Route path="/setting" element={<Setting />} />
      </Routes>
    </BrowserRouter>
  );
}
