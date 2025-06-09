"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Navbar } from "@/components/navbar"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  // Não renderizar nada até que o componente seja montado no cliente
  // Isso evita problemas de hidratação
  if (!mounted) {
    return <div className="min-h-screen"></div> // Placeholder vazio com altura mínima
  }

  // Mostrar um indicador de carregamento quando estiver carregando
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirecionar para login se não estiver autenticado
  if (!user) {
    return <div className="min-h-screen"></div> // Placeholder vazio com altura mínima
  }

  // Renderizar o layout completo quando autenticado
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container py-6 px-4">{children}</main>
    </div>
  )
}

