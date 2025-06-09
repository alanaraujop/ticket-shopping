'use client'

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (user && user.profile !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  // Não renderizar nada até que o componente seja montado no cliente
  // Isso evita problemas de hidratação
  if (!mounted) {
    return <div className="min-h-screen"></div> // Placeholder vazio com altura mínima
  }

  // Não mostrar conteúdo se não for admin
  if (!user || user.profile !== 'admin') {
    return <div className="min-h-screen"></div> // Placeholder vazio com altura mínima
  }

  return <>{children}</>
}