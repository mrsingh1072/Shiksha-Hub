import { useEffect, useState } from 'react'
import { Activity, BookOpen, Bot, Building2, ClipboardList, Database, GraduationCap, Users } from 'lucide-react'
import adminService from '../../services/adminService'

const stats = [
  ['totalStudents','Students',GraduationCap],['totalTeachers','Teachers',Users],
  ['totalClasses','Classes',Building2],['totalAssignments','Assignments',ClipboardList],
  ['totalExams','Exams',BookOpen],['totalResources','Resources',Database],
  ['activeUsers','Active users',Activity],['platformUsage','Platform usage',Bot],
]
const date = value => value ? new Date(value).toLocaleString() : 'No timestamp'

export default function AdminDashboard() {
  const [data,setData]=useState(null),[error,setError]=useState('')
  useEffect(()=>{adminService.dashboard().then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.detail||'Unable to load dashboard'))},[])
  return <section className="admin-page">
    <div className="admin-head"><div><h1>Executive Overview</h1><p>Platform operations, adoption, and service health in one view.</p></div><div className="admin-status"><i/>All systems operational</div></div>
    {error ? <div className="admin-error">{error}</div> : !data ? <div className="admin-empty">Loading platform telemetry...</div> : <>
      <div className="admin-grid">{stats.map(([key,label,Icon])=><article className="admin-stat" key={key}><div className="admin-stat-top"><span>{label}</span><Icon size={17}/></div><strong>{Number(data[key]||0).toLocaleString()}</strong><small>Live platform total</small></article>)}</div>
      <div className="admin-dashboard-body"><article className="admin-panel"><h2>Platform activity</h2><div className="admin-bars">{[34,48,42,65,53,78,68,87,74,91,83,96].map((h,i)=><div key={i} className="admin-bar" style={{height:`${h}%`}} title={`${h}%`}/>)}</div></article>
      <article className="admin-panel"><h2>System health</h2>{Object.entries(data.systemHealth||{}).map(([k,v])=><div className="admin-list-row" key={k}><strong>{k.toUpperCase()}</strong><span className="admin-badge">{v}</span></div>)}</article>
      <article className="admin-panel"><h2>Recent registrations</h2>{(data.recentRegistrations||[]).map(x=><div className="admin-list-row" key={x._id}><strong>{x.name||x.email}</strong><span>{x.role} � {date(x.created_at)}</span></div>)}</article>
      <article className="admin-panel"><h2>Recent activity</h2>{(data.recentActivities||[]).map(x=><div className="admin-list-row" key={x._id}><strong>{x.message}</strong><span>{date(x.created_at)}</span></div>)}</article></div>
    </>}
  </section>
}

