import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './output.css';
import './index.css';

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import ChatApp from "./pages/ChatApp";
import NotFound from "./pages/404";

export default function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<ChatApp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}
