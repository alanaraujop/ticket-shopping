"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { supabase } from '../lib/supabase'
import { User } from "@/lib/data"

// Update AuthContextType to include loginWithGoogle
type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  loginWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect( function () {
    supabase.auth.updateUser({
      data: {
        profile: 'admin'
    }}).then(({ data, error }) => {
      // Trate os dados retornados ou erros aqui
      if (error) {
        console.error('Erro ao atualizar metadados:', error)
      } else {
        console.log('Metadados atualizados com sucesso:', data)
      }
    })
  }, [])

  useEffect(() => {
    // Check for Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email,
          email: session.user.email!,
          profile: session.user.user_metadata.profile || 'user'
        }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email,
          email: session.user.email!,
          profile: session.user.user_metadata.profile || 'user'
        }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
      } else {
        setUser(null)
        localStorage.removeItem("user")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    // Protect authenticated routes and redirect to login
    const publicRoutes = ['/', '/login']
    if (!isLoading && !user && !publicRoutes.includes(pathname)) {
      router.push('/login')
    }
    if (!isLoading && user && publicRoutes.includes(pathname)) {
      router.push('/tickets')
    }
  }, [user, isLoading, pathname, router])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        const userData = {
          id: data.user.id,
          name: data.user.user_metadata.full_name || data.user.email,
          email: data.user.email!,
          profile: data.user.user_metadata.profile || 'user'
        }
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
        setIsLoading(false)
        return true
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      setIsLoading(false)
      return false
    }
  }

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error logging in with Google:', error)
      return false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      loginWithGoogle: async () => { await loginWithGoogle(); }
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    return {
      user: null,
      login: async () => false,
      logout: () => {},
      isLoading: false,
      loginWithGoogle: async () => {},
    }
  }
  return context
}

