"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { type Ticket } from "@/lib/data"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { getUserTickets } from '@/app/actions/tickets'

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const loadTickets = async () => {
      try {
        if (!user?.email) return
        const userTickets = await getUserTickets(user.email)
        setTickets(userTickets)
      } catch (error) {
        console.error("Erro ao carregar ingressos:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTickets()
  }, [user])

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Meus Ingressos</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse">
              <div className="h-[200px] bg-gray-200 dark:bg-gray-700 rounded-t-lg" />
              <div className="p-4 space-y-3">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Meus Ingressos</h1>

      {tickets.length === 0 ? (
        <div className="py-8">
          <p className="text-muted-foreground text-center mb-8">Você não possui ingressos no momento.</p>
          
          <div className="space-y-8">
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">Venda Presencial</h2>
              <p className="mb-2">Arena Cultural Abelardo Barbosa</p>
              <p className="text-muted-foreground">R. Sd. Elizeu Hipólito, s/n - Pedra de Guaratiba, Rio de Janeiro</p>
            </div>
            
            <div className="border rounded-lg p-6 bg-card">
              <h2 className="text-xl font-semibold mb-4">Venda Online</h2>
              <p className="mb-2">Mande um direct para o Instagram <a href="https://www.instagram.com/arenachacrinha/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@arenachacrinha</a> para mais informações</p>
              <a 
                href="https://www.instagram.com/arenachacrinha/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors w-fit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                Acessar Instagram
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tickets.map((ticket) => (
            <Link href={`/tickets/${ticket.id}`} key={ticket.id}>
              <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                <div className="relative h-[200px] w-full">
                  <Image
                    src={ticket.event?.image_url || "/placeholder.svg"}
                    alt={ticket.event?.name || "Evento"}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="font-bold text-xl">{ticket.event?.name}</h2>
                  <p className="text-muted-foreground">
                    {formatDate(ticket.event?.date || "")} às {ticket.event?.time}
                  </p>
                  <p className="text-sm mt-1">{ticket.event?.venue}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <span className="text-sm font-medium">{ticket.ticket_type?.name}</span>
                  <span className="text-sm font-bold">R$ {ticket.ticket_type?.price.toFixed(2)}</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

