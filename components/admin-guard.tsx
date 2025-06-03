'use client'

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.profile !== 'admin') {
      router.push('/')
    }
  }, [user, router])

  if (!user || user.profile !== 'admin') {
    return null
  }

  return <>{children}</>
}