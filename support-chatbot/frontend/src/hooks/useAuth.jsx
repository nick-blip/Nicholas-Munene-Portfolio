import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      api.me().then(data => { setUser(data); setLoading(false) })
              .catch(() => { localStorage.removeItem('admin_token'); setLoading(false) })
    } else setLoading(false)
  }, [])

  async function login(username, password) {
    const data = await api.login(username, password)
    localStorage.setItem('admin_token', data.access_token)
    setUser({ username: data.username })
    return data
  }

  function logout() {
    localStorage.removeItem('admin_token')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
