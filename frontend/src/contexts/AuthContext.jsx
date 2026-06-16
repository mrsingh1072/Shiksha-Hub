import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is already logged in (from localStorage or API)
    const checkAuth = async () => {
      try {
        const savedUser = localStorage.getItem('user')
        const savedToken = localStorage.getItem('token')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        } else if (savedToken) {
          setUser({ role: 'student' })
        }
      } catch (err) {
        console.error('Auth check failed:', err)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password, role) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await api.post('/auth/login', {
        identifier: email,
        password,
      })

      if (!response.data?.access_token) {
        throw new Error(response.data?.message || 'Login failed. Please try again.')
      }

      const userData = {
        email,
        role,
        name: email.includes('@') ? email.split('@')[0] : 'Student',
      }

      setUser(userData)
      localStorage.setItem('token', response.data.access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (formData, role, studentType) => {
    setIsLoading(true)
    setError(null)
    try {
      // TODO: Replace with actual API call
      // const endpoint = role === 'student' ? '/api/auth/register/student' : '/api/auth/register/teacher'
      // const response = await fetch(endpoint, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ ...formData, studentType })
      // })
      // const data = await response.json()

      // Mock successful registration
      const userData = {
        id: '1',
        email: formData.email,
        role,
        name: formData.name,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + formData.email,
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setError(null)
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
