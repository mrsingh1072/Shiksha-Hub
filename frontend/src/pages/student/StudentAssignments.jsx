import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList, Upload, X, FileText, CheckCircle,
  Clock, Star, Eye, Download, ChevronDown, ChevronUp,
  User, MessageSquare, Sparkles, Award
} from 'lucide-react'
import { useStudentWorkspace } from '../../components/studentDashboard/StudentDashboardLayout'
import { DashboardCard, EmptyState, SectionHeader } from '../../components/studentDashboard/DashboardPrimitives'
import { submitAssignment } from '../../services/studentDashboardService'

const statusStyle = {
  Pending: 'bg-gold/15 text-amber-700',
  Submitted: 'bg-green-50 text-green-700',
  Evaluated: 'bg-purple-50 text-purple-700',
  Published: 'bg-green-primary/10 text-green-primary',
  'Under Review': 'bg-amber-50 text-amber-700',
  'Not submitted': 'bg-gray-100 text-gray-600',
}

export default function StudentAssignments() {
  const { dashboard, refetch } = useStudentWorkspace()
  const { assignments } = dashboard

  const [submitModal, setSubmitModal] = useState(null) // assignment object
  const [file, setFile] = useState(null)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const handleSubmit = async () => {
    if (!file && !text.trim()) {
      setSubmitError('Please upload a file or write your submission text.')
      return
    }
    setSubmitError('')
    setSubmitting(true)
    try {
      await submitAssignment({
        assignment_id: submitModal.id,
        submission_text: text,
        file: file || undefined,
      })
      setSubmitModal(null)
      setFile(null)
      setText('')
      refetch()
    } catch (err) {
      setSubmitError(err.response?.data?.detail || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (iso) => {
    if (!iso) return '—'
    try { return new Date(iso).toLocaleString() } catch { return iso }
  }

  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="Assignments" title="Assigned Work" />

      <DashboardCard>
        {!assignments.length ? (
          <EmptyState icon={ClipboardList} title="No assignments assigned" message="Assignments created by teachers will appear here with due dates and evaluation status." />
        ) : (
          <div className="space-y-3">
            {assignments.map((assignment) => {
              const isExpanded = expandedId === assignment.id

              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-green-primary/10 overflow-hidden"
                >
                  {/* Assignment Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-text text-base">{assignment.title}</h3>
                          <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${statusStyle[assignment.status]}`}>
                            {assignment.status}
                          </span>
                          <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${statusStyle[assignment.evaluationStatus]}`}>
                            {assignment.evaluationStatus}
                          </span>
                        </div>

                        {assignment.description && (
                          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{assignment.description}</p>
                        )}

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1"><FileText className="h-3.5 w-3.5" /> {assignment.subject}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Due: {assignment.dueDate || 'Not set'}</span>
                          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Marks: {assignment.totalMarks}</span>
                          {assignment.teacherName && (
                            <span className="flex items-center gap-1 text-green-primary font-semibold">
                              <User className="h-3.5 w-3.5" /> {assignment.teacherName}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Submit button — only for pending */}
                        {assignment.status === 'Pending' && (
                          <button
                            onClick={() => { setSubmitModal(assignment); setSubmitError(''); setFile(null); setText('') }}
                            className="flex items-center gap-1.5 rounded-xl bg-green-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:shadow-md hover:bg-green-primary/90"
                          >
                            <Upload className="h-3.5 w-3.5" /> Submit
                          </button>
                        )}

                        {/* Expand/collapse details */}
                        {assignment.status === 'Submitted' && (
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : assignment.id)}
                            className="flex items-center gap-1 rounded-xl border border-green-primary/20 px-3 py-2 text-xs font-bold text-green-primary transition hover:bg-green-primary/5"
                          >
                            <Eye className="h-3.5 w-3.5" /> Details
                            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline published marks */}
                    {assignment.published && assignment.finalMarks !== null && (
                      <div className="mt-3 p-3 rounded-xl bg-green-primary/5 border border-green-primary/10">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Award className="h-4 w-4 text-green-primary" />
                            <span className="text-sm font-bold text-green-primary">
                              {assignment.finalMarks}/{assignment.totalMarks}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">Published {formatTime(assignment.publishedAt)}</span>
                          {!isExpanded && (
                            <button
                              onClick={() => setExpandedId(assignment.id)}
                              className="ml-auto text-xs text-green-primary font-semibold hover:underline flex items-center gap-1"
                            >
                              View Feedback <ChevronDown className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && assignment.status === 'Submitted' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3 border-t border-green-primary/5 pt-3">
                          {/* Submission info */}
                          <div className="text-xs text-gray-500 space-y-1">
                            <p><strong>Submitted:</strong> {formatTime(assignment.submittedAt)}</p>
                            {assignment.filePath && (
                              <p className="flex items-center gap-1">
                                <strong>File:</strong>
                                <a
                                  href={`${import.meta.env.VITE_API_URL}${assignment.filePath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-green-primary hover:underline flex items-center gap-1"
                                >
                                  <Download className="h-3 w-3" /> {assignment.originalFilename || 'Download'}
                                </a>
                              </p>
                            )}
                            {assignment.submissionText && (
                              <div>
                                <strong>Your text:</strong>
                                <p className="mt-1 p-2 bg-cream rounded-lg text-gray-600">{assignment.submissionText}</p>
                              </div>
                            )}
                          </div>

                          {/* Published marks and feedback */}
                          {assignment.published && (
                            <div className="space-y-3">
                              {/* Teacher feedback */}
                              {assignment.teacherFeedback && (
                                <div className="p-3 rounded-xl bg-green-primary/5 border border-green-primary/10">
                                  <p className="text-xs font-bold text-green-primary flex items-center gap-1 mb-1">
                                    <MessageSquare className="h-3.5 w-3.5" /> Teacher Feedback
                                  </p>
                                  <p className="text-sm text-gray-600">{assignment.teacherFeedback}</p>
                                </div>
                              )}

                              {/* AI feedback (if available) */}
                              {assignment.aiFeedback && (
                                <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                                  <p className="text-xs font-bold text-amber-700 flex items-center gap-1 mb-1">
                                    <Sparkles className="h-3.5 w-3.5" /> AI Feedback
                                  </p>
                                  <p className="text-sm text-gray-600">{assignment.aiFeedback}</p>
                                  {assignment.aiStrengths?.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs font-semibold text-green-700">Strengths:</p>
                                      <ul className="list-disc list-inside text-xs text-gray-600 mt-0.5">
                                        {assignment.aiStrengths.map((s, i) => <li key={i}>{s}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  {assignment.aiWeaknesses?.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs font-semibold text-red-600">Areas to Improve:</p>
                                      <ul className="list-disc list-inside text-xs text-gray-600 mt-0.5">
                                        {assignment.aiWeaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  {assignment.aiImprovements?.length > 0 && (
                                    <div className="mt-2">
                                      <p className="text-xs font-semibold text-green-secondary">Suggestions:</p>
                                      <ul className="list-disc list-inside text-xs text-gray-600 mt-0.5">
                                        {assignment.aiImprovements.map((s, i) => <li key={i}>{s}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Awaiting evaluation message */}
                          {!assignment.published && (
                            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Your submission is {assignment.evaluationStatus === 'Under Review' ? 'under review' : 'awaiting evaluation'}. Marks will appear here once published by your teacher.
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        )}
      </DashboardCard>

      {/* ── Submit Assignment Modal ── */}
      <AnimatePresence>
        {submitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSubmitModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-green-primary/10">
                <div>
                  <h2 className="text-lg font-bold text-text">Submit Assignment</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{submitModal.title} · {submitModal.subject}</p>
                </div>
                <button onClick={() => setSubmitModal(null)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* File upload */}
                <div>
                  <label className="block text-sm font-bold text-text mb-2">Upload File</label>
                  <div
                    className="border-2 border-dashed border-green-primary/20 rounded-xl p-6 text-center cursor-pointer hover:border-green-primary/40 hover:bg-green-primary/5 transition"
                    onClick={() => document.getElementById('assignment-file-input').click()}
                  >
                    {file ? (
                      <div className="flex items-center justify-center gap-2 text-green-primary">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-semibold text-sm">{file.name}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setFile(null) }}
                          className="p-0.5 rounded hover:bg-red-50 text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-green-primary/40 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to select a file</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, DOC, PNG, JPG, TXT</p>
                      </>
                    )}
                  </div>
                  <input
                    id="assignment-file-input"
                    type="file"
                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.txt"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0] || null)}
                  />
                </div>

                {/* Text input */}
                <div>
                  <label className="block text-sm font-bold text-text mb-2">Or Write Your Submission</label>
                  <textarea
                    className="w-full rounded-xl border-2 border-green-primary/10 p-3 text-sm text-text focus:border-green-primary focus:outline-none transition resize-none"
                    rows={4}
                    placeholder="Type your answer or additional notes..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                {submitError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600">
                    {submitError}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-green-primary/10">
                <button
                  onClick={() => setSubmitModal(null)}
                  className="rounded-xl border border-green-primary/20 px-5 py-2.5 text-sm font-bold text-green-primary hover:bg-cream transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="rounded-xl bg-green-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:shadow-md transition disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : 'Submit Assignment'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
