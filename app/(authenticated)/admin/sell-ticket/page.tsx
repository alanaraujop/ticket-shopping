"use client"

import { AdminGuard } from "@/components/admin-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useCallback } from "react"
import { getTicketTypes } from "@/app/actions/tickets"
import { Event, Ticket, TicketType } from "@/lib/data"
import { assignTicketToUser, getEventTickets } from "@/app/actions/admin-tickets"
import { getEvents } from "@/app/actions/admin-users"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SellTicketPage() {
  // Estado para controlar a montagem do componente no cliente
  const [mounted, setMounted] = useState(false)
  
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  
  const [assignTicketData, setAssignTicketData] = useState({
    ticket_id: '',
    user_email: ''
  })

  // Efeito para marcar o componente como montado no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Só carrega dados quando o componente estiver montado no cliente
    if (!mounted) return
    
    const loadEvents = async () => {
      try {
        const eventsData = await getEvents()
        setEvents(eventsData)
        if (eventsData.length > 0) {
          setSelectedEvent(eventsData[0].id)
        }
      } catch (error) {
        console.error("Erro ao carregar eventos:", error)
      }
    }

    Promise.all([loadEvents()])
      .finally(() => setLoading(false))
  }, [mounted])

  useEffect(() => {
    // Só carrega dados quando o componente estiver montado no cliente e houver um evento selecionado
    if (!mounted || !selectedEvent) return
    
    loadTickets()
  }, [selectedEvent, mounted])

  const loadTickets = useCallback(async () => {
    if (!selectedEvent) return
    try {
      // Usar a função do servidor para obter os tickets
      const ticketsData = await getEventTickets(selectedEvent)
      setTickets(ticketsData)
    } catch (error) {
      console.error("Erro ao carregar ingressos:", error)
    }
  }, [selectedEvent])

  const handleAssignTicket = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { ticket_id, user_email } = assignTicketData
      
      if (!ticket_id || !user_email) {
        alert('Selecione um ingresso e um usuário')
        return
      }

      const result = await assignTicketToUser(ticket_id, user_email)

      if (!result.success) throw result.error
      
      alert('Ingresso atribuído com sucesso!')
      setAssignTicketData({ ticket_id: '', user_email: '' })
      loadTickets()
    } catch (error) {
      console.error("Erro ao atribuir ingresso:", error)
      alert('Erro ao atribuir ingresso')
    }
  }, [assignTicketData, loadTickets])

  // Se o componente não estiver montado no cliente, renderiza um placeholder
  if (!mounted) {
    return <div className="min-h-screen"></div> // Placeholder vazio com altura mínima
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vender Ingresso</h1>
        
        <div className="flex items-center space-x-4">
          <div className="w-1/3">
            <Label htmlFor="event-select">Selecione um evento</Label>
            <Select 
              value={selectedEvent} 
              onValueChange={(value) => {
                setSelectedEvent(value)
              }}
            >
              <SelectTrigger id="event-select">
                <SelectValue placeholder="Selecione um evento" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : selectedEvent ? (
          <Card>
            <CardHeader>
              <CardTitle>Atribuir Ingresso a Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssignTicket} className="space-y-4">
                <div>
                  <Label htmlFor="ticket-select">Selecione um Ingresso</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between"
                      >
                        {assignTicketData.ticket_id
                          ? tickets.find(
                              (ticket) => ticket.id === assignTicketData.ticket_id
                            )?.id
                          : "Selecione um ingresso..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <Command>
                        <CommandInput placeholder="Buscar ingresso..." />
                        <CommandEmpty>Nenhum ingresso encontrado.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {tickets
                              .filter(ticket => ticket.status === 'available')
                              .map((ticket) => (
                                <CommandItem
                                  key={ticket.id}
                                  value={ticket.id}
                                  onSelect={(currentValue) => {
                                    setAssignTicketData(prev => ({ ...prev, ticket_id: currentValue === assignTicketData.ticket_id ? "" : currentValue }))
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      assignTicketData.ticket_id === ticket.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {ticket.ticket_type?.name || 'Ingresso'} - ID: {ticket.id.substring(0, 8)}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Label htmlFor="user-email">Email do Cliente</Label>
                  <Input 
                    id="user-email" 
                    type="email"
                    value={assignTicketData.user_email} 
                    onChange={(e) => setAssignTicketData(prev => ({ ...prev, user_email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <Button type="submit" className="w-full">Vender Ingresso</Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-64 border rounded-lg">
            <p className="text-muted-foreground">Selecione um evento para vender ingressos</p>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}