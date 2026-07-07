import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  ClipboardList,
  Megaphone,
  FileText,
  Video,
  Mic,
  AlertTriangle,
  Monitor,
  Shield,
} from "lucide-react";
import { useParams } from "react-router-dom";
import teacherService from "../../services/teacherService";
import TeacherResources from "./TeacherResources";
import TeacherExamsTab from "./TeacherExamsTab";
import TeacherLiveClassTab from "./TeacherLiveClassTab";
import TeacherAssignments from "./TeacherAssignments";
import TeacherAnnouncements from "./TeacherAnnouncements";

export default function TeacherClassWorkspace() {
  const { classId } = useParams();

  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);

  const [pendingRequests, setPendingRequests] = useState([]);

  // ===== EXAM STATE =====
  const [exams, setExams] = useState([]);
  const [examMode, setExamMode] = useState("list"); // list | create-manual | create-ai | preview | submissions
  const [selectedExam, setSelectedExam] = useState(null);
  const [examSubmissions, setExamSubmissions] = useState(null);
  const [examForm, setExamForm] = useState(null);

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadClass();
    loadRequests();
  }, []);

  const loadClass = async () => {
  try {
    const res = await teacherService.getClass(classId);
    setClassData(res.data);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};

const loadRequests = async () => {
  try {
    const res = await teacherService.getPendingRequests(classId);
    setPendingRequests(res.data);
  } catch (err) {
    console.error(err);
  }
};

const approveStudent = async (requestId) => {
  try {
    await teacherService.approveStudent(classId, requestId);

    loadRequests();
    loadClass();
  } catch (err) {
    console.error(err);
  }
};

const rejectStudent = async (requestId) => {
  try {
    await teacherService.rejectStudent(classId, requestId);

    loadRequests();
  } catch (err) {
    console.error(err);
  }
};

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
            {classData.student_details.length}
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

  <div className="p-8">

    {activeTab === "overview" && (
      <h2 className="text-xl font-semibold">
        Overview
      </h2>
    )}

    {activeTab === "students" && (
  <div className="space-y-8">

    <div>
      <h2 className="text-2xl font-bold mb-4">
        Pending Requests
      </h2>

      {pendingRequests.length === 0 ? (
        <p className="text-gray-500">
          No pending requests.
        </p>
      ) : (
        <div className="space-y-4">

          {pendingRequests.map((student) => (

            <div
              key={student.request_id}
              className="rounded-xl border p-5 flex justify-between items-center"
            >
              <div>

                <h3 className="font-bold">
                  {student.name}
                </h3>

                <p className="text-gray-500">
                  {student.email}
                </p>

                <p className="text-sm text-gray-400">
                  {student.course} • {student.semester}
                </p>

              </div>

              <div className="flex gap-3">

                <button
                  onClick={() => approveStudent(student.request_id)}
                  className="bg-green-primary text-white px-4 py-2 rounded-lg"
                >
                  Approve
                </button>

                <button
                  onClick={() => rejectStudent(student.request_id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg"
                >
                  Reject
                </button>

              </div>

            </div>

          ))}

        </div>
      )}
    </div>

    <div>

      <h2 className="text-2xl font-bold mb-4">
        Enrolled Students
      </h2>

      {classData.student_details.length === 0 ? (
        <p className="text-gray-500">
          No students enrolled.
        </p>
      ) : (
        <div className="space-y-3">

          {classData.student_details.map((student) => (

            <div
              key={student.email}
              className="rounded-xl border p-4"
            >

              <h3 className="font-semibold">
                {student.name}
              </h3>

              <p className="text-gray-500">
                {student.email}
              </p>

              <p className="text-sm text-gray-400">
                {student.course} • {student.semester}
              </p>

            </div>

          ))}

        </div>
      )}

    </div>

  </div>
)}

    {activeTab === "resources" && (
      <TeacherResources classId={classId} />
    )}

    {activeTab === "assignments" && (
      <TeacherAssignments classId={classId} />
    )}

    {activeTab === "announcements" && (
      <TeacherAnnouncements classId={classId} />
    )}

    {activeTab === "exams" && (
      <TeacherExamsTab classId={classId} />
    )}

    {activeTab === "live" && (
      <TeacherLiveClassTab classId={classId} />
    )}

  </div>

</div>
    </div>
  );
}