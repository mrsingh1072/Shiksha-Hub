import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Search, X, Mail, BookOpen, Award, ClipboardList } from 'lucide-react'
import teacherService from '../../services/teacherService'

export default function TeacherStudents() {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentDetail, setStudentDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      try { setLoading(true); const res = await teacherService.getStudents(); setStudents(res.data); setFiltered(res.data) }
      catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetch()
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) { setFiltered(students); return }
    const q = searchQuery.toLowerCase()
    setFiltered(students.filter(s =>
      (s.name || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q) ||
      (s.userId || '').toLowerCase().includes(q) ||
      (s.course || '').toLowerCase().includes(q)
    ))
  }, [searchQuery, students])

  const openDetail = async (student) => {
    setSelectedStudent(student)
    setDetailLoading(true)
    try {
      const res = await teacherService.getStudent(student.email)
      setStudentDetail(res.data)
    } catch { setStudentDetail(null) }
    finally { setDetailLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-6">
      <div className="teacher-page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Students</h1>
          <p className="text-slate-500 text-sm mt-1">{filtered.length} student{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input className="teacher-input pl-10" placeholder="Search by name, email, or ID..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      </div>

      {filtered.length === 0 ? (
        <div className="teacher-empty-state">
          <Users className="h-16 w-16 text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-500">No students found</p>
          <p className="text-sm text-slate-400 mt-1">Students will appear here once they join your classes</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="teacher-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Course</th>
                <th>Semester</th>
                <th>Submissions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s.email || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="cursor-pointer" onClick={() => openDetail(s)}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-green-primary/10 flex items-center justify-center text-sm font-bold text-green-primary">
                        {(s.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-700">{s.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="text-slate-500">{s.email}</td>
                  <td><span className="teacher-badge teacher-badge-info">{s.course || s.studentType || '—'}</span></td>
                  <td>{s.semester || '—'}</td>
                  <td><span className="font-medium">{s.submissionCount || 0}</span></td>
                  <td><button className="text-green-primary text-sm font-semibold hover:underline" onClick={e => { e.stopPropagation(); openDetail(s) }}>View</button></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="teacher-modal-overlay" onClick={() => setSelectedStudent(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="teacher-modal max-w-lg" onClick={e => e.stopPropagation()}>
              <div className="teacher-modal-header">
                <h2 className="text-lg font-bold text-slate-800">Student Details</h2>
                <button onClick={() => setSelectedStudent(null)} className="p-1 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="teacher-modal-body">
                {detailLoading ? (
                  <div className="flex justify-center py-10"><div className="w-8 h-8 border-4 border-green-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-primary to-green-secondary flex items-center justify-center text-xl font-bold text-white">
                        {(studentDetail?.name || selectedStudent.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{studentDetail?.name || selectedStudent.name}</h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {studentDetail?.email || selectedStudent.email}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400 font-medium">Course</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{studentDetail?.course || '—'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400 font-medium">Semester</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{studentDetail?.semester || '—'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400 font-medium">College</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{studentDetail?.college || '—'}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-400 font-medium">Student ID</p>
                        <p className="font-semibold text-slate-700 mt-0.5">{studentDetail?.userId || '—'}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Recent Submissions</h4>
                      {studentDetail?.submissions?.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {studentDetail.submissions.slice(0, 5).map((sub, i) => (
                            <div key={i} className="p-2.5 bg-slate-50 rounded-lg text-sm flex justify-between items-center">
                              <span className="text-slate-600 truncate">{sub.assignment_id || 'Assignment'}</span>
                              {sub.score !== undefined && <span className="teacher-badge teacher-badge-success">{sub.score}/10</span>}
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-slate-400">No submissions yet</p>}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Award className="h-4 w-4" /> Exam Performance</h4>
                      {studentDetail?.examResults?.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {studentDetail.examResults.map((r, i) => (
                            <div key={i} className="p-2.5 bg-slate-50 rounded-lg text-sm flex justify-between items-center">
                              <span className="text-slate-600">{r.subject || 'Exam'}</span>
                              <span className="teacher-badge teacher-badge-info">{r.score}%</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm text-slate-400">No exam results yet</p>}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
