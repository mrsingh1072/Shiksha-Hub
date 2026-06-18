import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, Users, Check, X as XIcon, Clock, Save, BarChart3 } from 'lucide-react'
import teacherService from '../../services/teacherService'

export default function TeacherAttendance() {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [records, setRecords] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState('mark') // mark | report
  const [report, setReport] = useState(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { teacherService.getClasses().then(r => setClasses(r.data)).catch(() => {}) }, [])

  useEffect(() => {
    if (!selectedClass) { setStudents([]); return }
    const fetchStudents = async () => {
      setLoading(true)
      try {
        const cls = await teacherService.getClass(selectedClass)
        const studs = (cls.data.student_details || []).map(s => ({ ...s, status: 'present' }))
        setStudents(studs)
        const r = {}; studs.forEach(s => r[s.email] = 'present'); setRecords(r)
        // Check existing attendance
        const att = await teacherService.getAttendance({ class_id: selectedClass, date: selectedDate })
        if (att.data?.length > 0) {
          const existing = {}
          att.data[0].records?.forEach(rec => { existing[rec.student_email] = rec.status })
          setRecords(prev => ({ ...prev, ...existing }))
        }
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchStudents()
  }, [selectedClass, selectedDate])

  const toggleStatus = (email, status) => { setRecords(prev => ({ ...prev, [email]: status })); setSaved(false) }

  const saveAttendance = async () => {
    setSaving(true)
    try {
      const recs = Object.entries(records).map(([email, status]) => ({ student_email: email, status }))
      await teacherService.markAttendance({ class_id: selectedClass, date: selectedDate, records: recs })
      setSaved(true)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const loadReport = async () => {
    if (!selectedClass) return
    try {
      const res = await teacherService.getAttendanceReport(selectedClass)
      setReport(res.data)
    } catch { setReport({ total_sessions: 0, report: [] }) }
  }

  useEffect(() => { if (viewMode === 'report' && selectedClass) loadReport() }, [viewMode, selectedClass])

  const summary = {
    present: Object.values(records).filter(v => v === 'present').length,
    absent: Object.values(records).filter(v => v === 'absent').length,
    late: Object.values(records).filter(v => v === 'late').length,
  }

  return (
    <div className="space-y-6">
      <div className="teacher-page-header">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Track student attendance</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('mark')} className={viewMode === 'mark' ? 'teacher-btn-primary' : 'teacher-btn-secondary'}><CalendarCheck className="h-4 w-4" /> Mark</button>
          <button onClick={() => setViewMode('report')} className={viewMode === 'report' ? 'teacher-btn-primary' : 'teacher-btn-secondary'}><BarChart3 className="h-4 w-4" /> Report</button>
        </div>
      </div>

      {/* Selectors */}
      <div className="flex flex-wrap gap-4">
        <div className="min-w-[200px]">
          <label className="teacher-label">Class</label>
          <select className="teacher-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
            <option value="">Select a class</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.class_name} — {c.subject}</option>)}
          </select>
        </div>
        <div>
          <label className="teacher-label">Date</label>
          <input className="teacher-input" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
        </div>
      </div>

      {!selectedClass ? (
        <div className="teacher-empty-state">
          <CalendarCheck className="h-16 w-16 text-slate-300 mb-4" />
          <p className="text-lg font-semibold text-slate-500">Select a class to manage attendance</p>
        </div>
      ) : viewMode === 'mark' ? (
        <>
          {/* Summary */}
          {students.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="teacher-stat-card text-center">
                <p className="text-2xl font-bold text-green-600">{summary.present}</p>
                <p className="text-xs text-slate-500 mt-1">Present</p>
              </div>
              <div className="teacher-stat-card text-center">
                <p className="text-2xl font-bold text-red-500">{summary.absent}</p>
                <p className="text-xs text-slate-500 mt-1">Absent</p>
              </div>
              <div className="teacher-stat-card text-center">
                <p className="text-2xl font-bold text-amber-500">{summary.late}</p>
                <p className="text-xs text-slate-500 mt-1">Late</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : students.length === 0 ? (
            <div className="teacher-empty-state py-10">
              <Users className="h-12 w-12 text-slate-300 mb-3" />
              <p className="text-sm text-slate-400">No students in this class yet</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="teacher-table">
                  <thead>
                    <tr><th>Student</th><th>Email</th><th className="text-center">Status</th></tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <motion.tr key={s.email} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                        <td className="font-medium text-slate-700">{s.name}</td>
                        <td className="text-slate-500 text-sm">{s.email}</td>
                        <td>
                          <div className="flex justify-center gap-2">
                            <button onClick={() => toggleStatus(s.email, 'present')}
                              className={`teacher-attendance-btn teacher-attendance-present ${records[s.email] === 'present' ? 'selected' : ''}`}>
                              <Check className="h-3.5 w-3.5 inline mr-0.5" /> Present
                            </button>
                            <button onClick={() => toggleStatus(s.email, 'absent')}
                              className={`teacher-attendance-btn teacher-attendance-absent ${records[s.email] === 'absent' ? 'selected' : ''}`}>
                              <XIcon className="h-3.5 w-3.5 inline mr-0.5" /> Absent
                            </button>
                            <button onClick={() => toggleStatus(s.email, 'late')}
                              className={`teacher-attendance-btn teacher-attendance-late ${records[s.email] === 'late' ? 'selected' : ''}`}>
                              <Clock className="h-3.5 w-3.5 inline mr-0.5" /> Late
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={saveAttendance} disabled={saving} className="teacher-btn-primary">
                {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> :
                 saved ? <><Check className="h-4 w-4" /> Saved!</> : <><Save className="h-4 w-4" /> Save Attendance</>}
              </button>
            </>
          )}
        </>
      ) : (
        /* Report View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {!report ? (
            <div className="flex justify-center py-10"><div className="w-10 h-10 border-4 border-green-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : report.report?.length === 0 ? (
            <div className="teacher-empty-state py-10"><p className="text-sm text-slate-400">No attendance data yet</p></div>
          ) : (
            <>
              <div className="p-4 border-b border-slate-100">
                <p className="text-sm text-slate-500">Total sessions recorded: <span className="font-bold text-green-primary">{report.total_sessions}</span></p>
              </div>
              <table className="teacher-table">
                <thead>
                  <tr><th>Student</th><th className="text-center">Present</th><th className="text-center">Absent</th><th className="text-center">Late</th><th className="text-center">Attendance %</th></tr>
                </thead>
                <tbody>
                  {report.report.map((r, i) => (
                    <tr key={r.student_email}>
                      <td className="font-medium text-slate-700">{r.student_name}</td>
                      <td className="text-center"><span className="teacher-badge teacher-badge-success">{r.present}</span></td>
                      <td className="text-center"><span className="teacher-badge teacher-badge-danger">{r.absent}</span></td>
                      <td className="text-center"><span className="teacher-badge teacher-badge-warning">{r.late}</span></td>
                      <td className="text-center">
                        <span className={`font-bold ${r.attendance_percentage >= 75 ? 'text-green-600' : r.attendance_percentage >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                          {r.attendance_percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  )
}
