"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { getUserTickets, type Ticket } from "@/lib/data"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"

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
        <div className="text-center py-12">
          <p className="text-muted-foreground">Você não possui ingressos no momento.</p>
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
                  <span className="text-sm font-medium">{ticket.section}</span>
                  <span className="text-sm font-bold">R$ {ticket.price.toFixed(2)}</span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

