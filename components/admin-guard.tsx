'use client'

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const emailsAdmin = ['adriana.batista0602@gmail.com', 'kauane.gama1608@gmail.com']

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const isAdmin = user?.profile === 'admin' || emailsAdmin.includes(user?.email || '')

  useEffect(() => {
    setMounted(true)
    
    if (!isAdmin) {
      router.push('/')
    }
  }, [user, router])

  // Não renderizar nada até que o componente seja montado no cliente
  // Isso evita problemas de hidratação
  if (!mounted) {
    return <div className="min-h-screen"></div> // Placeholder vazio com altura mínima
  }

  // Não mostrar conteúdo se não for admin
  if (!user || !isAdmin) {
    return <div className="min-h-screen"></div> // Placeholder vazio com altura mínima
  }

  return <>{children}</>
}