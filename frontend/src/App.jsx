import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAnalytics from "./pages/student/StudentAnalytics";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentExams from "./pages/student/StudentExams";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentProfile from "./pages/student/StudentProfile";
import StudentTutor from "./pages/student/StudentTutor";
import StudentVoiceLearning from "./pages/student/StudentVoiceLearning";
import StudentHistory from "./pages/student/StudentHistory";
import Login from "./components/Auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Register from "./components/Auth/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import StudentDashboardLayout from "./components/studentDashboard/StudentDashboardLayout";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/student"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="tutor" element={<StudentTutor />} />
            <Route path="voice-learning" element={<StudentVoiceLearning />} />
            <Route path="history" element={<StudentHistory />} />
            <Route path="analytics" element={<StudentAnalytics />} />
            <Route path="notifications" element={<StudentNotifications />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
