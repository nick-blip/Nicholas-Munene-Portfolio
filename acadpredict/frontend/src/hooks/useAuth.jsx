import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (localStorage.getItem('token')) {
      api.me().then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false))
    } else setLoading(false)
  }, [])
  const login = async (u, p) => { const d = await api.login(u, p); localStorage.setItem('token', d.access_token); setUser({ username: d.username }) }
  const logout = () => { localStorage.removeItem('token'); setUser(null) }
  return <Ctx.Provider value={{ user, login, logout, loading }}>{children}</Ctx.Provider>
}

export const useAuth = () => useContext(Ctx)
