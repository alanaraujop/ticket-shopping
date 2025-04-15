"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { type Ticket } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react"
import QRCode from "react-qr-code"
import { getTicketById } from "@/app/actions/tickets"

export default function TicketDetailsPage({ params }: { params: { id: string } }) {
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Simular carregamento de dados
    const loadTicket = async () => {
      try {
        // Simular delay de rede
        await new Promise((resolve) => setTimeout(resolve, 800))
        const ticketData = await getTicketById(params.id)
        setTicket(ticketData)
        if (!ticketData) {
          router.push("/tickets")
        }
      } catch (error) {
        console.error("Erro ao carregar ingresso:", error)
        router.push("/tickets")
      } finally {
        setLoading(false)
      }
    }

    loadTicket()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="animate-pulse">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-48 rounded"></h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse h-[400px]" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="h-[200px] bg-gray-200 dark:bg-gray-700 rounded mt-8" />
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.push("/tickets")}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-2xl font-bold">Detalhes do Ingresso</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <div className="relative h-[300px] w-full">
            <Image src={ticket.event?.image_url || "/placeholder.svg"} alt={ticket.event?.name || "Evento"} fill className="object-cover" />
          </div>
          <CardContent className="p-6">
            <h2 className="font-bold text-2xl mb-4">{ticket.event?.name}</h2>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>{formatDate(ticket.event?.date || "")}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <span>{ticket.event?.time}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <span>{ticket.event?.venue}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 text-sm">
              <div>
                <p className="text-muted-foreground">Setor</p>
                <p className="font-medium">{ticket.ticket_type?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Assento</p>
                <p className="font-medium">{ticket.seat}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-card">
          <h3 className="text-xl font-bold mb-2">QR Code do Ingresso</h3>
          <p className="text-muted-foreground mb-6 text-center">Apresente este QR code na entrada do evento</p>

          <div className="bg-white p-4 rounded-lg">
            <QRCode value={`TICKET:${ticket.id}:${ticket.event?.name}:${ticket.event?.date}`} size={200} />
          </div>

          <p className="mt-6 text-sm text-center text-muted-foreground">ID do ingresso: {ticket.id}</p>
        </div>
      </div>
    </div>
  )
}

