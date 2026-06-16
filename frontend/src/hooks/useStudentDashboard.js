import { useEffect, useState } from 'react'
import { fetchStudentDashboard } from '../services/studentDashboardService'

export function useStudentDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadDashboard = async ({ silent = false } = {}) => {
    if (!silent) setIsLoading(true)
    setError(null)

    try {
      const data = await fetchStudentDashboard()
      setDashboard(data)
      return data
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to load student dashboard')
      throw err
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    fetchStudentDashboard()
      .then((data) => {
        if (isMounted) setDashboard(data)
      })
      .catch((err) => {
        if (isMounted) setError(err.response?.data?.detail || 'Unable to load student dashboard')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return { dashboard, isLoading, error, refetch: loadDashboard }
}
