import { Bell } from 'lucide-react'
import { useStudentWorkspace } from '../../components/studentDashboard/StudentDashboardLayout'
import { DashboardCard, EmptyState, SectionHeader } from '../../components/studentDashboard/DashboardPrimitives'

export default function StudentNotifications() {
  const { dashboard } = useStudentWorkspace()
  const { notifications } = dashboard

  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="Notifications" title="Recent Updates" />
      <DashboardCard>
        {!notifications.length ? (
          <EmptyState icon={Bell} title="No recent notifications" message="Assignment reminders and learning activity updates will appear here." />
        ) : (
          <div className="divide-y divide-green-primary/10">
            {notifications.map((notification) => (
              <div key={notification.id} className="flex items-center gap-4 py-4">
                <div className="rounded-xl bg-green-primary/10 p-3 text-green-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-bold text-text">{notification.title}</p>
                  <p className="text-sm text-gray-500">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
