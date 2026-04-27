import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VideoCallPage from "./pages/VideoCallPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/call" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/call"
        element={
          <ProtectedRoute>
            <VideoCallPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;