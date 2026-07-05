import React, { useState, useEffect } from "react";
import { Plus, Sparkles, Trash2, Eye, Clock, CheckCircle, HelpCircle, FileText, Play, Edit3, Save, X, AlertTriangle, User, Monitor, Mic, Video } from "lucide-react";
import teacherService from "../../services/teacherService";

export default function TeacherExamsTab({ classId }) {
  const [exams, setExams] = useState([]);
  const [examMode, setExamMode] = useState("list"); // list | preview | submissions
  const [selectedExam, setSelectedExam] = useState(null);
  const [examSubmissions, setExamSubmissions] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExams();
  }, [classId]);

  const loadExams = async () => {
    try {
      const res = await teacherService.getClassExams(classId);
      setExams(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("[Exams] Fetch error:", err);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await teacherService.deleteClassExam(classId, examId);
      loadExams();
    } catch (err) {
      alert("Failed to delete exam.");
    }
  };



  const loadSubmissions = async (exam) => {
    setExamMode("submissions");
    setSelectedExam(exam);
    setLoading(true);
    try {
      const res = await teacherService.getExamSubmissions(classId, exam._id);
      setExamSubmissions(res.data);
    } catch (err) {
      alert("Failed to fetch submissions.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* EXAM LIST */}
      {examMode === "list" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Class Exams</h2>
          </div>

          {exams.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
              No exams created for this class yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {exams.map(exam => (
                <div key={exam._id} className="bg-white rounded-xl border p-5 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{exam.title}</h3>
                      <span className="text-xs px-2 py-1 rounded-full font-bold bg-blue-100 text-blue-700">
                        PUBLISHED
                      </span>
                    </div>
                    <div className="flex gap-4 mb-4">
                      <span className="flex items-center gap-1 text-xs text-gray-500"><HelpCircle size={12}/> {exam.questions?.length || 0} Qs</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={12}/> {exam.duration_minutes} min</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500"><CheckCircle size={12}/> {exam.total_marks} marks</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t pt-3 mt-2">
                    <button onClick={() => loadSubmissions(exam)} className="text-blue-600 font-semibold text-sm hover:underline">
                      View Submissions
                    </button>
                    <div className="flex gap-2">
                      <button onClick={() => { setSelectedExam(exam); setExamMode("preview"); }} className="p-2 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100" title="Preview">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDeleteExam(exam._id)} className="p-2 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PREVIEW MODE */}
      {examMode === "preview" && selectedExam && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border">
            <div>
              <h2 className="text-xl font-bold">{selectedExam.title}</h2>
              <p className="text-sm text-gray-500">{selectedExam.questions?.length} Questions • {selectedExam.duration_minutes} Minutes</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setExamMode("list")} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
                Back
              </button>
              {selectedExam.status !== "published" && (
                <button onClick={() => handlePublishExam(selectedExam._id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-blue-700">
                  <CheckCircle size={16} /> Publish Results
                </button>
              )}
            </div>
          </div>
          
          <div className="space-y-3">
            {selectedExam.questions?.map((q, i) => (
              <div key={i} className="bg-white p-4 rounded-xl border">
                <p className="font-bold text-gray-800 mb-2">Q{i + 1}. {q.question_text}</p>
                {q.type === "mcq" && (
                  <div className="ml-4 space-y-1">
                    {q.options?.map((opt, oi) => (
                      <div key={oi} className={`text-sm ${opt === q.correct_answer ? "text-green-600 font-bold" : "text-gray-600"}`}>
                        {String.fromCharCode(65 + oi)}. {opt} {opt === q.correct_answer && "✓"}
                      </div>
                    ))}
                  </div>
                )}
                {q.type === "descriptive" && (
                  <div className="ml-4 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    <span className="font-semibold text-gray-800">Model Answer: </span> {q.correct_answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBMISSIONS MODE */}
      {examMode === "submissions" && selectedExam && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border">
            <div>
              <h2 className="text-xl font-bold">{selectedExam.title} - Submissions</h2>
              {examSubmissions && (
                <p className="text-sm text-gray-500">
                  {examSubmissions.submitted_count} submitted • {examSubmissions.auto_submitted_count} auto-submitted • {examSubmissions.pending_count} pending
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setExamMode("list")} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200">
                Back to Exams
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-10 bg-white rounded-xl border text-gray-500">Loading submissions...</div>
          ) : examSubmissions ? (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-sm text-gray-600">Student</th>
                    <th className="p-4 font-semibold text-sm text-gray-600">Status</th>
                    <th className="p-4 font-semibold text-sm text-gray-600">Submitted At</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {examSubmissions.map((sub, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="p-4 text-sm font-medium text-gray-800">
                        {sub.student_email}
                      </td>
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          sub.status === "submitted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {sub.status.replace("_", " ").toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-xl border text-gray-500">Failed to load data.</div>
          )}
        </div>
      )}
    </div>
  );
}
