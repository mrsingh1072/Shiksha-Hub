import React, { useState, useEffect } from "react";
import { Plus, Sparkles, Trash2, Eye, Clock, CheckCircle, HelpCircle, FileText, Play, Edit3, Save, X, AlertTriangle, User, Monitor, Mic, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import teacherService from "../../services/teacherService";

import { motion, AnimatePresence } from "framer-motion";

export default function TeacherExamsTab({ classId }) {
  const [exams, setExams] = useState([]);
  const [examMode, setExamMode] = useState("list"); // list | preview | submissions
  const [selectedExam, setSelectedExam] = useState(null);
  const [examSubmissions, setExamSubmissions] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Create Exam State
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', subject: '', duration_minutes: 30, total_marks: 10, questions: [], start_time: '', end_time: '' });
  const [newQ, setNewQ] = useState({ question_text: '', type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 });

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

  const handlePublishExam = async (examId) => {
    if (!window.confirm("Publish this exam? It will become visible to all students.")) return;
    try {
      await teacherService.publishClassExam(classId, examId);
      loadExams();
      setExamMode("list");
    } catch (err) {
      alert("Failed to publish exam.");
    }
  };

  const handlePublishResults = async (examId) => {
    if (!window.confirm("Publish results to students? They will be able to see their scores.")) return;
    try {
      await teacherService.publishExamResults(classId, examId);
      loadExams();
      alert("Results published successfully.");
      const updatedExam = { ...selectedExam, results_published: true };
      setSelectedExam(updatedExam);
    } catch (err) {
      alert("Failed to publish results.");
    }
  };

  const handleCreate = async (e, status = "draft") => {
    if (e) e.preventDefault();
    
    let finalQuestions = [...formData.questions];
    if (newQ.question_text.trim()) {
      finalQuestions.push({ ...newQ });
    }

    if (finalQuestions.length === 0) {
      alert("Please add at least one question to the exam.");
      return;
    }

    try {
      const payload = { ...formData, questions: finalQuestions, status };
      await teacherService.createClassExamManual(classId, payload);
      setFormData({ title: '', description: '', subject: '', duration_minutes: 30, total_marks: 10, questions: [], start_time: '', end_time: '' });
      setNewQ({ question_text: '', type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 });
      setShowCreate(false);
      loadExams();
      alert(`Exam successfully ${status === 'published' ? 'published' : 'saved as draft'}.`);
    } catch (err) {
      alert("Failed to create exam.");
      console.error(err);
    }
  };

  const addQuestion = () => {
    if (!newQ.question_text.trim()) return;
    setFormData({ ...formData, questions: [...formData.questions, { ...newQ }] });
    setNewQ({ question_text: '', type: 'mcq', options: ['', '', '', ''], correct_answer: '', marks: 1 });
  };

  const removeQuestion = (idx) => {
    const updated = formData.questions.filter((_, i) => i !== idx);
    setFormData({ ...formData, questions: updated });
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
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-green-primary hover:bg-green-secondary text-white rounded-lg transition font-semibold">
              <Plus size={18} /> Create Exam
            </button>
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
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          exam.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {exam.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                        {exam.status === 'published' && (() => {
                          if (!exam.start_time || !exam.end_time) return (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-600">
                              ALWAYS ACTIVE
                            </span>
                          );
                          const now = new Date();
                          const start = new Date(exam.start_time);
                          const end = new Date(exam.end_time);
                          if (now < start) return <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-600">NOT STARTED</span>;
                          if (now > end) return <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-100 text-red-600">ENDED</span>;
                          return <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-green-100 text-green-700 animate-pulse">ACTIVE NOW</span>;
                        })()}
                      </div>
                    </div>
                    <div className="flex gap-4 mb-4">
                      <span className="flex items-center gap-1 text-xs text-gray-500"><HelpCircle size={12}/> {exam.questions?.length || 0} Qs</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500"><Clock size={12}/> {exam.duration_minutes} min</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500"><CheckCircle size={12}/> {exam.total_marks} marks</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t text-xs text-gray-600">
                    {exam.start_time && exam.end_time && (
                      <div className="flex justify-between">
                        <span><strong>Start:</strong> {new Date(exam.start_time).toLocaleString()}</span>
                        <span><strong>End:</strong> {new Date(exam.end_time).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <button onClick={() => loadSubmissions(exam)} className="text-green-primary font-semibold text-sm hover:underline">
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
                <button onClick={() => handlePublishExam(selectedExam._id)} className="px-4 py-2 bg-green-primary text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-secondary">
                  <CheckCircle size={16} /> Publish Exam
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
              {!selectedExam.results_published && (
                <button onClick={() => handlePublishResults(selectedExam._id)} className="px-4 py-2 bg-green-primary text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-green-secondary">
                  <CheckCircle size={16} /> Publish Results
                </button>
              )}
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

      {/* CREATE EXAM MODAL */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-gray-800">Create Class Exam</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"><X size={20} /></button>
              </div>
              <form onSubmit={handleCreate} className="p-6 space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title *</label>
                    <input className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-primary focus:border-green-primary outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Subject *</label>
                    <input className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-primary focus:border-green-primary outline-none" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Duration (min)</label>
                    <input className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-primary focus:border-green-primary outline-none" type="number" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Total Marks</label>
                    <input className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-primary focus:border-green-primary outline-none" type="number" value={formData.total_marks} onChange={e => setFormData({...formData, total_marks: Number(e.target.value)})} />
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-700 mb-3 font-semibold flex items-center gap-1">
                    <Clock size={14} /> Exam will automatically open and close based on schedule. All times are in IST (India).
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Start Time (IST)</label>
                      <input type="datetime-local" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-primary outline-none" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">End Time (IST)</label>
                      <input type="datetime-local" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-green-primary outline-none" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                    </div>
                  </div>
                </div>

                {/* Add Question Section */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Questions ({formData.questions.length})</h3>
                  
                  {formData.questions.map((q, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl mb-3 flex justify-between items-start border">
                      <div>
                        <span className="font-bold text-green-primary mr-2">Q{i + 1}.</span> 
                        <span className="text-gray-800">{q.question_text}</span>
                      </div>
                      <button type="button" onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  ))}

                  <div className="p-4 bg-green-50 rounded-xl space-y-3 border border-green-200">
                    <input className="w-full px-4 py-2 border rounded-xl outline-none" placeholder="Question text" value={newQ.question_text} onChange={e => setNewQ({...newQ, question_text: e.target.value})} />
                    
                    <div className="grid grid-cols-2 gap-3">
                      {newQ.options.map((opt, oi) => (
                        <input key={oi} className="w-full px-4 py-2 border rounded-xl outline-none" placeholder={`Option ${oi + 1}`} value={opt}
                          onChange={e => { const opts = [...newQ.options]; opts[oi] = e.target.value; setNewQ({...newQ, options: opts}) }} />
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <input className="w-2/3 px-4 py-2 border rounded-xl outline-none" placeholder="Exact Correct Answer" value={newQ.correct_answer} onChange={e => setNewQ({...newQ, correct_answer: e.target.value})} />
                      <input className="w-1/3 px-4 py-2 border rounded-xl outline-none" type="number" placeholder="Marks" value={newQ.marks} onChange={e => setNewQ({...newQ, marks: Number(e.target.value)})} />
                    </div>
                    
                    <button type="button" onClick={addQuestion} className="px-4 py-2 bg-white text-green-primary border border-green-primary rounded-xl font-semibold hover:bg-green-50 w-full transition">
                      + Add Question
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
                  <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition">Cancel</button>
                  <button type="button" onClick={(e) => handleCreate(e, "draft")} className="px-6 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 font-semibold rounded-xl hover:bg-yellow-100 transition">Save Draft</button>
                  <button type="button" onClick={(e) => handleCreate(e, "published")} className="px-6 py-2 bg-green-primary text-white font-semibold rounded-xl hover:bg-green-secondary transition">Publish Exam</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
