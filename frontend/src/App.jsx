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

// ===== Teacher Module Imports =====
import TeacherDashboardLayout from "./components/teacherDashboard/TeacherDashboardLayout";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClasses from "./pages/teacher/TeacherClasses";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherExams from "./pages/teacher/TeacherExams";
import TeacherQuestionBank from "./pages/teacher/TeacherQuestionBank";
import TeacherAIAssistant from "./pages/teacher/TeacherAIAssistant";
import TeacherAttendance from "./pages/teacher/TeacherAttendance";
import TeacherAnnouncements from "./pages/teacher/TeacherAnnouncements";
import TeacherResources from "./pages/teacher/TeacherResources";
import TeacherAnalytics from "./pages/teacher/TeacherAnalytics";
import TeacherProfilePage from "./pages/teacher/TeacherProfile";
import TeacherSettings from "./pages/teacher/TeacherSettings";
import AdminDashboardLayout from "./components/admin/AdminDashboardLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCollectionPage from "./pages/admin/AdminCollectionPage";
import { AdminAnnouncements, AdminOperationsPage } from "./pages/admin/AdminOperations";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />

          {/* ===== Student Routes (FROZEN — DO NOT MODIFY) ===== */}
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

          {/* ===== Teacher Routes ===== */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="classes" element={<TeacherClasses />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="assignments" element={<TeacherAssignments />} />
            <Route path="exams" element={<TeacherExams />} />
            <Route path="question-bank" element={<TeacherQuestionBank />} />
            <Route path="ai-assistant" element={<TeacherAIAssistant />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="announcements" element={<TeacherAnnouncements />} />
            <Route path="resources" element={<TeacherResources />} />
            <Route path="analytics" element={<TeacherAnalytics />} />
            <Route path="profile" element={<TeacherProfilePage />} />
            <Route path="settings" element={<TeacherSettings />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<AdminCollectionPage kind="students" users />} />
            <Route path="teachers" element={<AdminCollectionPage kind="teachers" users />} />
            <Route path="classes" element={<AdminCollectionPage kind="classes" />} />
            <Route path="assignments" element={<AdminCollectionPage kind="assignments" />} />
            <Route path="exams" element={<AdminCollectionPage kind="exams" />} />
            <Route path="question-bank" element={<AdminCollectionPage kind="questions" />} />
            <Route path="resources" element={<AdminCollectionPage kind="resources" />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="analytics" element={<AdminOperationsPage mode="analytics" />} />
            <Route path="ai-monitoring" element={<AdminOperationsPage mode="ai" />} />
            <Route path="logs" element={<AdminOperationsPage mode="logs" />} />
            <Route path="profile" element={<AdminOperationsPage mode="profile" />} />
            <Route path="settings" element={<AdminOperationsPage mode="settings" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
