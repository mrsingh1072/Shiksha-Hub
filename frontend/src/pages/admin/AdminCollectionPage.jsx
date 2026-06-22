import { useCallback, useEffect, useState } from 'react'
import { Eye, Search, ShieldCheck, Trash2, UserCheck, UserX } from 'lucide-react'
import adminService from '../../services/adminService'

const labels = {
  students: ['Students','Manage learner access and inspect academic activity.'],
  teachers: ['Teachers','Approve educators and oversee their platform activity.'],
  classes: ['Classes','Monitor enrollment and class ownership.'],
  assignments: ['Assignments','Review platform assignments and submission activity.'],
  exams: ['Exams','Monitor assessments, results, and publishing status.'],
  questions: ['Question Bank','Moderate shared assessment questions.'],
  resources: ['Resources','Review uploaded learning files and storage usage.'],
}
const primary = x => x.name || x.title || x.class_name || x.question_text || x.file_name || 'Untitled'
const secondary = x => x.email || x.teacher_email || x.subject || x.description || x.userId || ''
const status = x => x.status || x.role || x.file_type || (x.students ? `${x.students.length} enrolled` : 'active')

export default function AdminCollectionPage({ kind, users = false }) {
  const [rows,setRows]=useState([]),[search,setSearch]=useState(''),[filter,setFilter]=useState('')
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[detail,setDetail]=useState(null)
  const [title,description]=labels[kind] || [kind,'Platform management']

  const load=useCallback(async()=>{
    setLoading(true);setError('')
    try {
      const params={search}; if(filter) params.status=filter
      const response=users ? await adminService[kind](params) : await adminService.content(kind,{search})
      setRows(response.data)
    } catch(e){setError(e.response?.data?.detail||'Unable to load records')} finally{setLoading(false)}
  },[kind,users,search,filter])
  useEffect(()=>{const t=setTimeout(load,250);return()=>clearTimeout(t)},[load])

  const remove=async row=>{
    if(!window.confirm(`Permanently delete "${primary(row)}"?`)) return
    try{users ? await adminService.deleteUser(row._id) : await adminService.deleteContent(kind,row._id);load()}catch(e){setError(e.response?.data?.detail||'Delete failed')}
  }
  const setState=async(row,next)=>{try{await adminService.setUserStatus(row._id,next);load()}catch(e){setError(e.response?.data?.detail||'Update failed')}}
  const inspect=async row=>{
    if(!users){setDetail(row);return}
    try{setDetail((await adminService.user(row._id)).data)}catch(e){setError(e.response?.data?.detail||'Unable to load details')}
  }
  const approveQuestion=async row=>{await adminService.approveQuestion(row._id);load()}
  const assignTeacher=async row=>{const email=window.prompt('Teacher email',row.teacher_email||'');if(!email)return;try{await adminService.assignTeacher(row._id,email);load()}catch(e){setError(e.response?.data?.detail||'Assignment failed')}}

  return <section className="admin-page">
    <div className="admin-head"><div><h1>{title}</h1><p>{description}</p></div><div className="admin-status"><i/>{rows.length} records</div></div>
    <div className="admin-tools"><div style={{position:'relative',flex:1}}><Search size={16} style={{position:'absolute',left:12,top:12,color:'#60738d'}}/><input className="admin-input" style={{paddingLeft:36}} value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`}/></div>
      {users&&<select className="admin-select" value={filter} onChange={e=>setFilter(e.target.value)}><option value="">All statuses</option><option>active</option><option>pending</option><option>suspended</option><option>approved</option><option>rejected</option></select>}
    </div>
    {error&&<div className="admin-error">{error}</div>}
    {loading?<div className="admin-empty">Loading records...</div>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Name / title</th><th>Owner / context</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>
      {rows.map(row=><tr key={row._id}><td>{primary(row)}</td><td>{secondary(row)}</td><td><span className="admin-badge">{status(row)}</span></td><td>{row.created_at?new Date(row.created_at).toLocaleDateString():''}</td><td><div className="admin-actions">
        <button className="admin-btn secondary" onClick={()=>inspect(row)} title="Inspect"><Eye size={14}/></button>
        {users&&<><button className="admin-btn secondary" onClick={()=>setState(row,kind==='teachers'?'approved':'active')} title={kind==='teachers'?'Approve':'Activate'}><UserCheck size={14}/></button><button className="admin-btn danger" onClick={()=>setState(row,kind==='teachers'?'rejected':'suspended')} title={kind==='teachers'?'Reject':'Suspend'}><UserX size={14}/></button></>}
        {kind==='classes'&&<button className="admin-btn secondary" onClick={()=>assignTeacher(row)} title="Assign teacher"><UserCheck size={14}/></button>}
        {kind==='questions'&&row.status!=='approved'&&<button className="admin-btn secondary" onClick={()=>approveQuestion(row)} title="Approve"><ShieldCheck size={14}/></button>}
        <button className="admin-btn danger" onClick={()=>remove(row)} title="Delete"><Trash2 size={14}/></button>
      </div></td></tr>)}
      {!rows.length&&<tr><td colSpan="5"><div className="admin-empty">No matching records found.</div></td></tr>}
    </tbody></table></div>}
    {detail&&<div className="admin-modal-backdrop" onClick={()=>setDetail(null)}><article className="admin-modal" onClick={e=>e.stopPropagation()}><div className="admin-head"><div><h2>{primary(detail)}</h2><p>Full platform record</p></div><button className="admin-btn secondary" onClick={()=>setDetail(null)}>Close</button></div><div className="admin-detail-grid">{Object.entries(detail).filter(([k])=>!['password'].includes(k)).map(([k,v])=><div key={k}><span>{k.replace(/([A-Z_])/g,' $1')}</span><strong>{typeof v==='object'?JSON.stringify(v):String(v??'')}</strong></div>)}</div></article></div>}
  </section>
}
