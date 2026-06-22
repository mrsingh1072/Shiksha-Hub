import { Clock3, LogOut, ShieldX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function TeacherAccountStatus({ status }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const rejected = status === 'rejected'
  const signOut = () => { logout(); navigate('/login', { replace: true }) }

  return (
    <main className="min-h-screen bg-cream px-5 py-12 flex items-center justify-center">
      <section className="w-full max-w-xl rounded-3xl border border-green-primary/15 bg-white p-8 text-center shadow-xl shadow-green-primary/10 md:p-12">
        <div className={`mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl ${rejected ? 'bg-red-50 text-red-600' : 'bg-green-primary/10 text-green-primary'}`}>
          {rejected ? <ShieldX size={30} /> : <Clock3 size={30} />}
        </div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-green-primary">Teacher Application</p>
        <h1 className="text-3xl font-bold text-text">
          {rejected ? 'Application not approved' : 'Your account is under review'}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-gray-600">
          {rejected
            ? 'Your application was rejected. Contact administration.'
            : 'Your account is under admin review. You will receive an email once approved.'}
        </p>
        <div className="mt-7 rounded-2xl bg-cream p-4 text-left text-sm text-gray-600">
          <span className="block text-xs font-bold uppercase tracking-wider text-gray-400">Signed in as</span>
          <strong className="mt-1 block text-text">{user?.name || 'Teacher'}</strong>
          <span>{user?.email}</span>
        </div>
        <button onClick={signOut} className="btn-primary mt-7 inline-flex items-center gap-2">
          <LogOut size={17} /> Sign out
        </button>
      </section>
    </main>
  )
}

