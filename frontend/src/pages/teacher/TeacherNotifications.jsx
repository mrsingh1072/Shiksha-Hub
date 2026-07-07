import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import teacherService from '../../services/teacherService'
import { EmptyState, SectionHeader, DashboardCard } from '../../components/studentDashboard/DashboardPrimitives'

import { useTeacherWorkspace } from '../../components/teacherDashboard/TeacherDashboardLayout'

export default function TeacherNotifications() {
  const { refetch } = useTeacherWorkspace()
  const [notifications, setNotifications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setIsLoading(true)
        const res = await teacherService.getNotifications()
        const fetchedNotifications = res.data || []
        setNotifications(fetchedNotifications)

        // Mark unread as read
        const unread = fetchedNotifications.filter((n) => !n.read)
        if (unread.length > 0) {
          await Promise.all(
            unread.map((notification) =>
              teacherService.markNotificationAsRead(notification._id)
            )
          )
          
          // Refetch the layout dashboard data to update the sidebar badge
          if (refetch) {
            await refetch()
          }
        }
      } catch (err) {
        console.error('Failed to load notifications', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotifications()
  }, [])

  return (
    <div className="space-y-5 p-6">
      <SectionHeader eyebrow="Notifications" title="Recent Updates" />
      <DashboardCard>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-gray-500">
            Loading notifications...
          </div>
        ) : !notifications.length ? (
          <EmptyState icon={Bell} title="No recent notifications" message="Platform announcements and updates will appear here." />
        ) : (
          <div className="divide-y divide-green-primary/10">
            {notifications.map((notification) => (
              <div key={notification._id} className="flex items-center gap-4 py-4">
                <div className="rounded-xl bg-green-primary/10 p-3 text-green-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-text">{notification.title}</p>
                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(notification.created_at + "Z").toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })} 
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardCard>
    </div>
  )
}
