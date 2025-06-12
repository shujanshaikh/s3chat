import { BrowserRouter, Route, Routes } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './routes/Home';
import ChatLayout from './components/ChatLayout';
import ChatPage from './components/ChatPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="chat" element={<ProtectedRoute><ChatLayout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path=":threadId" element={<ChatPage />} />
        </Route>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
