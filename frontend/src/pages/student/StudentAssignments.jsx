import { ClipboardList } from 'lucide-react'
import { useStudentWorkspace } from '../../components/studentDashboard/StudentDashboardLayout'
import { DashboardCard, EmptyState, SectionHeader } from '../../components/studentDashboard/DashboardPrimitives'

const statusStyle = {
  Pending: 'bg-gold/15 text-amber-700',
  Submitted: 'bg-green-primary/10 text-green-primary',
  Evaluated: 'bg-green-primary/10 text-green-primary',
  'Not submitted': 'bg-gray-100 text-gray-600',
}

export default function StudentAssignments() {
  const { dashboard } = useStudentWorkspace()
  const { assignments } = dashboard

  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="Assignments" title="Assigned Work" />
      <DashboardCard>
        {!assignments.length ? (
          <EmptyState icon={ClipboardList} title="No assignments assigned" message="Assignments created by teachers will appear here with due dates and evaluation status." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-green-primary/10 text-sm text-gray-500">
                  <th className="pb-3 font-bold">Title</th>
                  <th className="pb-3 font-bold">Subject</th>
                  <th className="pb-3 font-bold">Due date</th>
                  <th className="pb-3 font-bold">Submission</th>
                  <th className="pb-3 font-bold">Evaluation</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-green-primary/5 last:border-0">
                    <td className="py-4">
                      <p className="font-bold text-text">{assignment.title}</p>
                      {assignment.description && <p className="mt-1 max-w-md truncate text-sm text-gray-500">{assignment.description}</p>}
                    </td>
                    <td className="py-4 text-gray-600">{assignment.subject}</td>
                    <td className="py-4 text-gray-600">{assignment.dueDate || 'Not set'}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[assignment.status]}`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle[assignment.evaluationStatus]}`}>
                        {assignment.evaluationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
