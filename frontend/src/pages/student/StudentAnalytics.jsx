import { Target, TrendingUp } from 'lucide-react'
import { useStudentWorkspace } from '../../components/studentDashboard/StudentDashboardLayout'
import { DashboardCard, SectionHeader } from '../../components/studentDashboard/DashboardPrimitives'
import { LearningTrendChart, ProgressRing } from '../../components/studentDashboard/AnalyticsCharts'

export default function StudentAnalytics() {
  const { dashboard } = useStudentWorkspace()
  const { analytics, overview } = dashboard

  return (
    <div className="space-y-5">
      <SectionHeader eyebrow="Analytics" title="Performance Insights" />

      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <DashboardCard>
          <ProgressRing value={overview.overallProgress} label="Overall progress" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-cream p-4">
              <p className="text-sm font-bold text-gray-500">Average exam score</p>
              <p className="mt-2 text-3xl font-bold text-green-primary">{overview.averageExamScore || 0}%</p>
            </div>
            <div className="rounded-xl bg-cream p-4">
              <p className="text-sm font-bold text-gray-500">Tutor sessions</p>
              <p className="mt-2 text-3xl font-bold text-green-primary">{overview.tutorSessions}</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-primary" />
            <h2 className="text-lg font-bold text-text">Learning activity</h2>
          </div>
          <LearningTrendChart data={analytics.learningTrends} />
        </DashboardCard>
      </div>

      <DashboardCard>
        <div className="mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-green-primary" />
          <h2 className="text-lg font-bold text-text">Subject signals</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <p className="font-bold text-green-primary">Strong subjects</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analytics.strongSubjects.length ? analytics.strongSubjects.map((subject) => (
                <span key={subject} className="rounded-full bg-green-primary/10 px-3 py-1 text-sm font-bold text-green-primary">{subject}</span>
              )) : <p className="text-sm text-gray-500">No strong subject data yet.</p>}
            </div>
          </div>
          <div>
            <p className="font-bold text-gold">Weak subjects</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {analytics.weakSubjects.length ? analytics.weakSubjects.map((subject) => (
                <span key={subject} className="rounded-full bg-gold/15 px-3 py-1 text-sm font-bold text-amber-700">{subject}</span>
              )) : <p className="text-sm text-gray-500">No weak subject data yet.</p>}
            </div>
          </div>
        </div>
      </DashboardCard>
    </div>
  )
}
