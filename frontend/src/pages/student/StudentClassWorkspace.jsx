import { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  ClipboardList,
  Megaphone,
  FileText,
  Video,
  Clock,
  Play,
  CheckCircle,
  Send,
  Mic,
  AlertTriangle,
  Monitor,
  Shield,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  getStudentClass,
  getClassAnnouncements,
  getStudentClassExams,
  getStudentExamResults,
  startStudentExam,
  saveExamAnswer,
  submitStudentExam,
} from "../../services/studentDashboardService";

export default function StudentClassWorkspace() {
  const { classId } = useParams();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [announcements, setAnnouncements] = useState([]);

  const [activeTab, setActiveTab] = useState("overview");

  const [search, setSearch] = useState("");

  // ===== EXAM STATE =====
  const [exams, setExams] = useState([]);
  const [examView, setExamView] = useState("list"); // list | attempt
  const [currentExam, setCurrentExam] = useState(null); // { attempt, questions, title, duration_minutes, total_marks }
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { question_id: { answer, selected_option } }
  const [timeLeft, setTimeLeft] = useState(0); // seconds
  const [examStarting, setExamStarting] = useState(false);
  const [examSubmitting, setExamSubmitting] = useState(false);
  const [startError, setStartError] = useState("");
  const [cameraOk, setCameraOk] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const [screenOk, setScreenOk] = useState(false);
  const [fullscreenOk, setFullscreenOk] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [proctorWarning, setProctorWarning] = useState("");

  const timerRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  useEffect(() => {
    loadClass();
  }, []);

  useEffect(() => {
    if (activeTab === "exams") {
      loadExams();
    }
  }, [activeTab]);


  // ===== TIMER =====
  useEffect(() => {
    if (examView === "attempt" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [examView, timeLeft > 0]);


  // ===== CLEANUP MEDIA ON UNMOUNT =====
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const loadClass = async () => {
  try {
    const data = await getStudentClass(classId);
    setClassData(data);
    const announcementData = await getClassAnnouncements(classId);
    console.log("[Student Announcements] Loaded:", announcementData);
    setAnnouncements(Array.isArray(announcementData) ? announcementData : []);
  } catch (err) {
    console.error("[Student Announcements] Load error:", err);
  } finally {
    setLoading(false);
  }
};

// ===== EXAM FUNCTIONS =====
const loadExams = async () => {
  try {
    const [data, resultData] = await Promise.all([
      getStudentClassExams(classId),
      getStudentExamResults(classId),
    ]);
    const resultsByExam = new Map((Array.isArray(resultData) ? resultData : []).map((result) => [result.exam_id, result]));
    const merged = (Array.isArray(data) ? data : []).map((exam) => ({
      ...exam,
      result: resultsByExam.get(exam._id) || null,
    }));
    console.log("STUDENT EXAMS:", merged);
    setExams(merged);
  } catch (err) {
    console.error("[Student Exams] Load error:", err);
  }
};

const handleStartExam = async (examId) => {
  setExamStarting(true);
  try {
    const data = await startStudentExam(examId);
    console.log("[Student Exams] Start response:", data);

    // Reconstruct answers from existing attempt
    const existingAnswers = {};
    if (data.attempt?.answers) {
      data.attempt.answers.forEach(a => {
        existingAnswers[a.question_id] = {
          answer: a.answer || "",
          selected_option: a.selected_option || ""
        };
      });
    }

    // Calculate remaining time
    let remainingSeconds = (data.duration_minutes || 30) * 60;
    if (data.attempt?.started_at) {
      const startedAt = new Date(data.attempt.started_at).getTime();
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      remainingSeconds = Math.max(0, remainingSeconds - elapsed);
    }

    setCurrentExam({
      ...data,
      examId: examId
    });
    setAnswers(existingAnswers);
    setTimeLeft(remainingSeconds);
    setCurrentQuestionIdx(0);
    setExamView("attempt");
  } catch (err) {
    console.error("[Student Exams] Start error:", err);
    alert(err.response?.data?.detail || "Failed to start exam.");
  } finally {
    setExamStarting(false);
  }
};

const handleSaveAnswer = async (questionId, answer, selectedOption) => {
  const examId = currentExam?.attempt?.exam_id || currentExam?.examId;
  if (!examId) return;

  setAnswers(prev => ({
    ...prev,
    [questionId]: { answer: answer || "", selected_option: selectedOption || "" }
  }));

  try {
    await saveExamAnswer(examId, {
      question_id: questionId,
      answer: answer || "",
      selected_option: selectedOption || ""
    });
  } catch (err) {
    console.error("[Student Exams] Save answer error:", err);
  }
};

const handleSubmitExam = async () => {
  if (!window.confirm("Are you sure you want to submit this exam? You cannot change answers after submission.")) return;
  setExamSubmitting(true);
  const examId = currentExam?.attempt?.exam_id || currentExam?.examId;
  try {
    await submitStudentExam(examId, {
      answers: Object.entries(answers).map(([questionId, value]) => ({
        question_id: Number(questionId),
        answer: value.answer || "",
        selected_option: value.selected_option || ""
      }))
    });
    alert("Exam submitted successfully!");
    cleanupExam();
  } catch (err) {
    console.error("[Student Exams] Submit error:", err);
    alert("Failed to submit exam.");
  } finally {
    setExamSubmitting(false);
  }
};


const cleanupExam = () => {
  clearInterval(timerRef.current);
  if (mediaStreamRef.current) {
    mediaStreamRef.current.getTracks().forEach(t => t.stop());
    mediaStreamRef.current = null;
  }
  if (screenStreamRef.current) {
    screenStreamRef.current.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;
  }
  setExamView("list");
  setCurrentExam(null);
  setAnswers({});
  setTimeLeft(0);
  setTabSwitchCount(0);
  setCameraOk(false);
  setMicOk(false);
  setScreenOk(false);
  setProctorWarning("");
  loadExams();
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const filteredStudents =
  classData?.student_details?.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-20">
        Class not found
      </div>
    );
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          {classData.class_name}
        </h1>

        <p className="text-gray-500 mt-2">
          {classData.subject}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">

        <div className="rounded-xl bg-white p-5 border">
          <p className="text-sm text-gray-500">
            Students
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {classData.student_count}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 border">
          <p className="text-sm text-gray-500">
            Semester
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {classData.semester || "-"}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 border">
          <p className="text-sm text-gray-500">
            Section
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {classData.section || "-"}
          </h2>
        </div>

        <div className="rounded-xl bg-white p-5 border">
          <p className="text-sm text-gray-500">
            Class Code
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {classData.class_code}
          </h2>
        </div>

      </div>
      <div className="rounded-2xl bg-white border mt-8">

  <div className="flex gap-2 p-4 border-b overflow-x-auto">

    <button
      onClick={() => setActiveTab("overview")}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
        activeTab === "overview"
          ? "bg-green-primary text-white"
          : "hover:bg-slate-100"
      }`}
    >
      <LayoutDashboard size={18}/>
      Overview
    </button>

    <button
      onClick={() => setActiveTab("students")}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
        activeTab === "students"
          ? "bg-green-primary text-white"
          : "hover:bg-slate-100"
      }`}
    >
      <Users size={18}/>
      Students
    </button>

    <button
      onClick={() => setActiveTab("resources")}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
        activeTab === "resources"
          ? "bg-green-primary text-white"
          : "hover:bg-slate-100"
      }`}
    >
      <FolderOpen size={18}/>
      Resources
    </button>

    <button
      onClick={() => setActiveTab("assignments")}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
        activeTab === "assignments"
          ? "bg-green-primary text-white"
          : "hover:bg-slate-100"
      }`}
    >
      <ClipboardList size={18}/>
      Assignments
    </button>

    <button
      onClick={() => setActiveTab("announcements")}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
        activeTab === "announcements"
          ? "bg-green-primary text-white"
          : "hover:bg-slate-100"
      }`}
    >
      <Megaphone size={18}/>
      Announcements
    </button>

    <button
      onClick={() => setActiveTab("exams")}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
        activeTab === "exams"
          ? "bg-green-primary text-white"
          : "hover:bg-slate-100"
      }`}
    >
      <FileText size={18}/>
      Exams
    </button>

    <button
      onClick={() => setActiveTab("live")}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
        activeTab === "live"
          ? "bg-green-primary text-white"
          : "hover:bg-slate-100"
      }`}
    >
      <Video size={18}/>
      Live Class
    </button>

  </div>

  {activeTab === "overview" && (
  <div className="space-y-6">

    <div className="rounded-xl border bg-white p-6">
      <h2 className="text-2xl font-bold mb-4">
        Class Overview
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        <div>
          <p className="text-gray-500 text-sm">
            Teacher
          </p>

          <p className="font-semibold">
            {classData.teacher_name}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">
            Subject
          </p>

          <p className="font-semibold">
            {classData.subject}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">
            Semester
          </p>

          <p className="font-semibold">
            {classData.semester}
          </p>
        </div>

        <div>
          <p className="text-gray-500 text-sm">
            Section
          </p>

          <p className="font-semibold">
            {classData.section}
          </p>
        </div>

      </div>

      {classData.description && (
        <div className="mt-6">
          <p className="text-gray-500 text-sm">
            Description
          </p>

          <p className="mt-2">
            {classData.description}
          </p>
        </div>
      )}

    </div>

  </div>
)}

    {activeTab === "students" && (
  <div className="space-y-6">

  <div className="flex items-center justify-between">
    <h2 className="text-2xl font-bold">
      Enrolled Students
    </h2>

    <input
      type="text"
      placeholder="Search student..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-72 rounded-xl border px-4 py-2 outline-none focus:ring-2 focus:ring-green-primary"
    />
  </div>

  {filteredStudents.length === 0 ? (

    <div className="rounded-xl border bg-slate-50 p-10 text-center">
      <Users
        size={50}
        className="mx-auto text-gray-400 mb-4"
      />

      <h3 className="text-lg font-semibold">
        No Students Found
      </h3>
    </div>

  ) : (

    <div className="divide-y rounded-xl border bg-white">

      {filteredStudents.map((student) => (
  <div
    key={student.email}
    className="flex items-center justify-between px-6 py-4"
  >
    <div className="flex items-center gap-4">

      <div className="w-12 h-12 rounded-full bg-green-primary text-white flex items-center justify-center font-bold text-lg uppercase">
        {student.name
          ?.split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)}
      </div>

      <div>
        <h3 className="font-semibold text-lg">
          {student.name}
        </h3>

        <p className="text-sm text-gray-500">
          {student.email}
        </p>
      </div>

    </div>

    <button
      className="bg-green-primary hover:bg-green-secondary text-white px-5 py-2 rounded-lg transition"
    >
      Chat
    </button>
  </div>
))}

    </div>

  )}

</div>
)}
{activeTab === "resources" && (
  <div className="space-y-6">

    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">
          Learning Resources
        </h2>

        <p className="text-gray-500 mt-1">
          Resources shared by your teacher.
        </p>
      </div>
    </div>

    <div className="rounded-xl border bg-slate-50 p-10 text-center">
      <FolderOpen
        size={50}
        className="mx-auto text-gray-400 mb-4"
      />

      <h3 className="text-lg font-semibold">
        No Resources Yet
      </h3>

      <p className="text-gray-500 mt-2">
        Your teacher hasn't uploaded any study material.
      </p>
    </div>

  </div>
)}
{activeTab === "assignments" && (
  <div className="space-y-6">

    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold">
          Assignments
        </h2>

        <p className="text-gray-500 mt-1">
          Complete and submit assignments shared by your teacher.
        </p>
      </div>
    </div>

    <div className="rounded-xl border bg-slate-50 p-10 text-center">
      <ClipboardList
        size={50}
        className="mx-auto text-gray-400 mb-4"
      />

      <h3 className="text-lg font-semibold">
        No Assignments Yet
      </h3>

      <p className="text-gray-500 mt-2">
        New assignments will appear here once your teacher publishes them.
      </p>
    </div>

  </div>
)}
{activeTab === "announcements" && (
  <div className="space-y-5">

    <div>
      <h2 className="text-2xl font-bold">
        Announcements
      </h2>

      <p className="text-gray-500">
        Latest updates from your teacher.
      </p>
    </div>

    {announcements.length === 0 ? (

      <div className="bg-slate-50 rounded-xl border p-10 text-center">
        <Megaphone
          size={40}
          className="mx-auto text-gray-400 mb-4"
        />

        <h3 className="text-lg font-semibold">
          No Announcements
        </h3>

        <p className="text-gray-500 mt-2">
          Your teacher hasn't posted anything yet.
        </p>
      </div>

    ) : (

      announcements.map((announcement) => (

        <div
          key={announcement._id}
          className="bg-white border rounded-xl p-5 shadow-sm"
        >

          <div className="flex justify-between items-start">

            <div>
              <h3 className="text-lg font-semibold">
                {announcement.title}
              </h3>

              <p className="text-gray-700 mt-2">
                {announcement.message}
              </p>

              <p className="text-sm text-gray-400 mt-4">
                {new Date(
                  announcement.created_at
                ).toLocaleString()}
              </p>
            </div>

            <div className="text-sm">
              {announcement.type === "class" ? (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                  Class
                </span>
              ) : (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                  Personal
                </span>
              )}
            </div>

          </div>

        </div>

      ))

    )}

  </div>
)}
{activeTab === "exams" && examView === "list" && (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold">Class Exams</h2>
      <p className="text-gray-500 mt-1">{exams.length} exam{exams.length !== 1 ? "s" : ""} available</p>
    </div>


    {startError && (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
        {startError}
      </div>
    )}
    {exams.length === 0 ? (
      <div className="rounded-xl border bg-slate-50 p-10 text-center">
        <FileText size={50} className="mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-500">No Exams Available</h3>
        <p className="text-gray-400 mt-2">Exams will appear here when your teacher publishes them.</p>
      </div>
    ) : (
      <div className="space-y-4">
        {exams.map((exam) => (
          <div key={exam._id} className="rounded-xl border bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{exam.title}</h3>
                {exam.description && <p className="text-sm text-gray-500 mt-1">{exam.description}</p>}
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <FileText size={12} /> {exam.subject || "General"}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} /> {exam.duration_minutes} min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    {exam.question_count} questions
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    {exam.total_marks} marks
                  </span>
                  {exam.difficulty && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      exam.difficulty === "easy" ? "bg-green-100 text-green-700" :
                      exam.difficulty === "hard" ? "bg-red-100 text-red-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>{exam.difficulty}</span>
                  )}
                </div>
              </div>

              <div className="ml-4">
                {exam.attempt_status === "submitted" ? (
                  <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-sm">
                    <CheckCircle size={16} /> {exam.result ? `Score ${exam.result.score}/${exam.result.graded_marks || exam.result.total_marks}` : "Submitted"}
                  </span>
                ) : exam.attempt_status === "in_progress" ? (
                  <button
                    onClick={() => handleStartExam(exam._id)}
                    disabled={examStarting}
                    className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition disabled:opacity-50"
                  >
                    <Play size={16} /> Resume
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartExam(exam._id)}
                    disabled={examStarting}
                    className="flex items-center gap-2 bg-green-primary text-white px-4 py-2 rounded-lg hover:bg-green-secondary transition disabled:opacity-50"
                  >
                    {examStarting ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Starting...</>
                    ) : (
                      <><Play size={16} /> Start Exam</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
</div>
)}

{/* ===== EXAM ATTEMPT SCREEN ===== */}
{activeTab === "exams" && examView === "attempt" && currentExam && (
  <div className="space-y-4">

    {/* Top Bar: Timer + Submit */}
    <div className="flex items-center justify-between bg-white rounded-xl border p-4 shadow-sm sticky top-0 z-10">
      <div>
        <h2 className="text-lg font-bold text-gray-800">{currentExam.title}</h2>
        <p className="text-xs text-gray-400">{currentExam.questions?.length} questions • {currentExam.total_marks} marks</p>
      </div>

      {/* Timer */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-lg font-bold ${
        timeLeft <= 60 ? "bg-red-100 text-red-700 animate-pulse" :
        timeLeft <= 300 ? "bg-yellow-100 text-yellow-700" :
        "bg-green-100 text-green-700"
      }`}>
        <Clock size={18} />
        {formatTime(timeLeft)}
      </div>
      <button
        onClick={handleSubmitExam}
        disabled={examSubmitting}
        className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50 text-sm"
      >
        {examSubmitting ? (
          <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
        ) : (
          <><Send size={14} /> Submit Exam</>
        )}
      </button>
    </div>

    {/* Main Exam Layout: Question Nav (left) + Answer Panel (right) */}
    <div className="flex gap-4" style={{ minHeight: "60vh" }}>

      {/* LEFT: Question Navigator */}
      <div className="w-64 bg-white rounded-xl border p-5">
        <h3 className="font-bold text-sm text-gray-700">Questions</h3>
        <div className="grid grid-cols-5 gap-2 mt-3">
          {currentExam.questions?.map((q, i) => (
            <button
              key={i}
              onClick={() => setCurrentQuestionIdx(i)}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                currentQuestionIdx === i
                  ? "bg-blue-600 text-white"
                  : answers[q.question_id] && (answers[q.question_id].selected_option || answers[q.question_id].answer)
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="pt-3 border-t space-y-1 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-blue-600" /> Current
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-300" /> Answered
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-gray-100" /> Not answered
          </div>
        </div>

        <div className="pt-3 border-t text-xs text-gray-400">
          Answered: {Object.values(answers).filter(a => a.selected_option || a.answer).length} / {currentExam.questions?.length || 0}
        </div>
      </div>

      {/* RIGHT: Answer Panel */}
      <div className="flex-1 bg-white rounded-xl border p-6">
        {currentExam.questions && currentExam.questions[currentQuestionIdx] && (() => {
          const q = currentExam.questions[currentQuestionIdx];
          const currentAnswer = answers[q.question_id] || {};
          return (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
                    {currentQuestionIdx + 1}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    q.type === "mcq" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                  }`}>{q.type?.toUpperCase()}</span>
                  <span className="text-xs text-gray-400">{q.marks} marks</span>
                </div>
              </div>

              <p className="text-lg text-gray-800 leading-relaxed">{q.question_text}</p>

              {/* MCQ Options */}
              {q.type === "mcq" && q.options?.length > 0 && (
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                        currentAnswer.selected_option === opt
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${q.question_id}`}
                        checked={currentAnswer.selected_option === opt}
                        onChange={() => handleSaveAnswer(q.question_id, "", opt)}
                        className="accent-blue-600"
                      />
                      <span className="font-medium text-sm text-gray-500 w-5">{String.fromCharCode(65 + oi)}.</span>
                      <span className="text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Descriptive Textarea */}
              {q.type === "descriptive" && (
                <textarea
                  className="w-full border rounded-xl p-4 text-sm resize-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 outline-none"
                  rows={6}
                  placeholder="Type your answer here..."
                  value={currentAnswer.answer || ""}
                  onChange={(e) => handleSaveAnswer(q.question_id, e.target.value, "")}
                />
              )}

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t">
                <button
                  onClick={() => setCurrentQuestionIdx(Math.max(0, currentQuestionIdx - 1))}
                  disabled={currentQuestionIdx === 0}
                  className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg disabled:opacity-40 hover:bg-gray-300 transition"
                >
                  Ã¢â€ Â Previous
                </button>
                {currentQuestionIdx < (currentExam.questions?.length || 0) - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Next Ã¢â€ â€™
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitExam}
                    disabled={examSubmitting}
                    className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                  >
                    Submit Exam
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  </div>
)}
{activeTab === "live" && (
  <div className="space-y-6">

    <div>
      <h2 className="text-2xl font-bold">
        Live Class
      </h2>

      <p className="text-gray-500 mt-1">
        Join live sessions conducted by your teacher.
      </p>
    </div>

    <div className="rounded-xl border bg-slate-50 p-10 text-center">
      <Video
        size={50}
        className="mx-auto text-gray-400 mb-4"
      />

      <h3 className="text-lg font-semibold">
        No Live Class Scheduled
      </h3>

      <p className="text-gray-500 mt-2">
        You'll see meeting links here whenever your teacher schedules a live class.
      </p>
    </div>

  </div>
)}

  </div>

</div>

  );
}


