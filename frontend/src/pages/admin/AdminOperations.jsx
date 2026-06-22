import { useEffect, useState } from 'react'
import adminService from '../../services/adminService'

export function AdminAnnouncements(){
  const [rows,setRows]=useState([]),[form,setForm]=useState({title:'',content:'',audience:'all'}),[message,setMessage]=useState('')
  const load=()=>adminService.announcements().then(r=>setRows(r.data))
  useEffect(load,[])
  const submit=async e=>{e.preventDefault();try{await adminService.createAnnouncement(form);setForm({title:'',content:'',audience:'all'});setMessage('Announcement published.');load()}catch(err){setMessage(err.response?.data?.detail||'Publish failed')}}
  return <section className="admin-page"><div className="admin-head"><div><h1>Announcements</h1><p>Broadcast platform-wide updates to selected audiences.</p></div></div><div className="admin-dashboard-body"><article className="admin-panel"><h2>New global announcement</h2><form className="admin-form" onSubmit={submit}><label>Title<input className="admin-input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Audience<select className="admin-select" value={form.audience} onChange={e=>setForm({...form,audience:e.target.value})}><option value="all">All users</option><option value="students">Students</option><option value="teachers">Teachers</option></select></label><label>Message<textarea className="admin-textarea" value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/></label><button className="admin-btn">Publish announcement</button>{message&&<p>{message}</p>}</form></article><article className="admin-panel"><h2>Published broadcasts</h2>{rows.map(x=><div className="admin-list-row" key={x._id}><strong>{x.title}</strong><span>{x.audience}</span></div>)}</article></div></section>
}

const titles={analytics:['Analytics','Growth and activity indicators across the learning platform.'],ai:['AI Monitoring','AI feature demand and provider telemetry.'],logs:['System Logs','Security and platform audit trail.'],profile:['Admin Profile','Identity is supplied by protected server configuration.'],settings:['System Settings','Deployment-managed platform and security configuration.']}
export function AdminOperationsPage({mode}){
  const [data,setData]=useState(null),[error,setError]=useState('')
  useEffect(()=>{const request={analytics:adminService.analytics,ai:adminService.aiMonitoring,logs:adminService.logs,profile:adminService.profile,settings:adminService.settings}[mode];request().then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.detail||'Unable to load data'))},[mode])
  const [title,description]=titles[mode]
  const entries=Array.isArray(data)?data:Object.entries(data||{}).map(([key,value])=>({key,value}))
  return <section className="admin-page"><div className="admin-head"><div><h1>{title}</h1><p>{description}</p></div></div>{error?<div className="admin-error">{error}</div>:!data?<div className="admin-empty">Loading operational data...</div>:<div className="admin-grid">{entries.map((item,index)=>{const key=item.key||item.type||`Record ${index+1}`;const value=item.value!==undefined?item.value:(item.message||item.actor||item.created_at);return <article className="admin-stat" key={item._id||key+index}><div className="admin-stat-top"><span>{String(key).replace(/([A-Z])/g,' $1')}</span></div><strong style={{fontSize:typeof value==='number'?28:15,wordBreak:'break-word'}}>{typeof value==='object'?JSON.stringify(value):String(value)}</strong><small>{item.created_at?new Date(item.created_at).toLocaleString():'Live administrative data'}</small></article>})}</div>}</section>
}

