'use client'

import { AdminGuard } from "@/components/admin-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect, useCallback } from "react"
import { getTicketTypes } from "@/app/actions/tickets"
import { Event, Ticket, TicketType, User } from "@/lib/data"
import { createTickets, assignTicketToUser, getEventTickets, getTicketStats, updateTicketStatus } from "@/app/actions/admin-tickets"
import { getUsers, getEvents } from "@/app/actions/admin-users"
import { generateTicketId } from "@/lib/utils"

const initialTicket = {
        event_id: '',
        ticket_type_id: '',
        quantity: 1,
        status: 'available' as 'available' | 'sold' | 'reserved' | 'used'
}

const getStatus = ( data: string) => {
  const status = ['available', 'sold', 'reserved', 'used']
  const statusText = ['Disponível', 'Vendido', 'Reservado', 'Usado']
  const statusColor = ['bg-green-100 text-green-800', 'bg-red-100 text-red-800', 'bg-yellow-100 text-yellow-800', 'bg-gray-100 text-gray-800']
  const mappedStatus = status.map((status, index) => ({
    value: status,
    text: statusText[index],
    color: statusColor[index]
  }))
  return mappedStatus.find((item) => item.value === data)
}

export default function AdminTicketsPage() {
  // Estado para controlar a montagem do componente no cliente
  const [mounted, setMounted] = useState(false)
  
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('7afe7c11-8a73-477b-acc0-cb8670087cdc')
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [ticketStats, setTicketStats] = useState({
    available: 0,
    sold: 0,
    reserved: 0,
    used: 0
  })
  
  const [newTicketData, setNewTicketData] = useState(initialTicket)

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
        setNewTicketData(prev => ({ ...prev, event_id: eventsData[0].id }))
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
    
    loadTicketTypes()
    loadTickets()
  }, [selectedEvent, mounted])

  const loadTicketTypes = useCallback(async () => {
    if (!selectedEvent) return
    try {
      const types = await getTicketTypes(selectedEvent)
      setTicketTypes(types)
      if (types.length > 0) {
        setNewTicketData(prev => ({ ...prev, ticket_type_id: types[0].id }))
      }
    } catch (error) {
      console.error("Erro ao carregar tipos de ingressos:", error)
    }
  }, [selectedEvent])

  const loadTickets = useCallback(async () => {
    if (!selectedEvent) return
    try {
      // Usar a função do servidor para obter os tickets
      const ticketsData = await getEventTickets(selectedEvent)
      setTickets(ticketsData)
      // Obter estatísticas
      const stats = await getTicketStats(selectedEvent)
      setTicketStats(stats)
    } catch (error) {
      console.error("Erro ao carregar ingressos:", error)
    }
  }, [selectedEvent])

  const handleCreateTickets = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { event_id, ticket_type_id, quantity, status } = newTicketData
      console.log(newTicketData)
      if (!event_id || !ticket_type_id || quantity < 1) {
        alert('Preencha todos os campos corretamente')
        return
      }

      const ticketsToCreate = Array(quantity).fill(null).map(() => ({
        id: generateTicketId(),
        event_id,
        ticket_type_id,
        status,
        user_email: null,
        seat: null
      }))

      const result = await createTickets(ticketsToCreate)

      if (!result.success) throw result.error
      
      alert(`${quantity} ingressos criados com sucesso!`)
      // setNewTicketData(initialTicket)
      loadTickets()
    } catch (error) {
      console.error("Erro ao criar ingressos:", error)
      alert('Erro ao criar ingressos')
    }
  }, [newTicketData])

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
    //   loadTickets()
    } catch (error) {
      console.error("Erro ao atribuir ingresso:", error)
      alert('Erro ao atribuir ingresso')
    }
  }, [assignTicketData])

  const handleStatusChange = useCallback(async (ticketId: string, newStatus: 'available' | 'sold' | 'reserved' | 'used') => {
    try {
      const result = await updateTicketStatus(ticketId, newStatus)
      if (!result.success) throw result.error
    //   loadTickets()
    } catch (error) {
      console.error("Erro ao atualizar status do ingresso:", error)
      alert('Erro ao atualizar status do ingresso')
    }
  }, [])

  // Se o componente não estiver montado no cliente, renderiza um placeholder
  if (!mounted) {
    return <div className="min-h-screen"></div> // Placeholder vazio com altura mínima
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Gerenciamento de Ingressos</h1>
        
        <div className="flex items-center space-x-4">
          <div className="w-1/3">
            <Label htmlFor="event-select">Selecione um evento</Label>
            <Select 
              value={selectedEvent} 
              onValueChange={(value) => {
                setSelectedEvent(value)
                setNewTicketData(prev => ({ ...prev, event_id: value }))
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
          <Tabs defaultValue="stats">
            <TabsList>
              <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              <TabsTrigger value="list">Listar Ingressos</TabsTrigger>
              <TabsTrigger value="create">Criar Ingressos</TabsTrigger>
              <TabsTrigger value="assign">Atribuir Ingressos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novos Ingressos</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTickets} className="space-y-4">
                    <div>
                      <Label htmlFor="ticket-type">Tipo de Ingresso</Label>
                      <Select 
                        value={newTicketData.ticket_type_id} 
                        onValueChange={(value) => setNewTicketData(prev => ({ ...prev, ticket_type_id: value }))}
                      >
                        <SelectTrigger id="ticket-type">
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {ticketTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name} - R$ {type.price.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input 
                        id="quantity" 
                        type="number" 
                        min="1" 
                        value={newTicketData.quantity} 
                        onChange={(e) => setNewTicketData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="status">Status Inicial</Label>
                      <Select 
                        value={newTicketData.status} 
                        onValueChange={(value: 'available' | 'sold' | 'reserved') => 
                          setNewTicketData(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger id="status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Disponível</SelectItem>
                          <SelectItem value="reserved">Reservado</SelectItem>
                          <SelectItem value="sold">Vendido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button type="submit">Criar Ingressos</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="assign" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Atribuir Ingresso a Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAssignTicket} className="space-y-4">
                    <div>
                      <Label htmlFor="ticket-select">Selecione um Ingresso</Label>
                      <Select 
                        value={assignTicketData.ticket_id} 
                        onValueChange={(value) => setAssignTicketData(prev => ({ ...prev, ticket_id: value }))}
                      >
                        <SelectTrigger id="ticket-select">
                          <SelectValue placeholder="Selecione um ingresso" />
                        </SelectTrigger>
                        <SelectContent>
                          {tickets
                            .filter(ticket => ticket.status === 'available')
                            .map((ticket) => (
                              <SelectItem key={ticket.id} value={ticket.id}>
                                {ticket.ticket_type?.name || 'Ingresso'} - ID: {ticket.id.substring(0, 8)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                    <Label htmlFor="quantity">Email</Label>
                      <Input 
                        id="quantity" 
                        type="email" 
                        min="1" 
                        value={assignTicketData.user_email} 
                        onChange={(e) => setAssignTicketData(prev => ({ ...prev, user_email: e.target.value }))}
                      />
                    </div>
                    
                    <Button type="submit">Atribuir Ingresso</Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="list" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Ingressos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 px-4 text-left">ID</th>
                          <th className="py-2 px-4 text-left">Tipo</th>
                          <th className="py-2 px-4 text-left">Preço</th>
                          <th className="py-2 px-4 text-left">Status</th>
                          <th className="py-2 px-4 text-left">Usuário</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((ticket) => (
                          <tr key={ticket.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">{ticket.id.substring(0, 8)}</td>
                            <td className="py-2 px-4">{ticket.ticket_type?.name || 'N/A'}</td>
                            <td className="py-2 px-4">
                              {ticket.ticket_type ? `R$ ${ticket.ticket_type.price.toFixed(2)}` : 'N/A'}
                            </td>
                            <td className="py-2 px-4">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatus(ticket.status)?.color}`}>
                                {getStatus(ticket.status)?.text}
                              </span>
                            </td>
                            <td className="py-2 px-4">{ticket.user_email || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="bg-green-50">
                    <CardTitle>Disponíveis</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold">{ticketStats.available}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-yellow-50">
                    <CardTitle>Reservados</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold">{ticketStats.reserved}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-blue-50">
                    <CardTitle>Vendidos</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold">{ticketStats.sold}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="bg-blue-50">
                    <CardTitle>Validado</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <p className="text-4xl font-bold">{ticketStats.used}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex items-center justify-center h-64 border rounded-lg">
            <p className="text-muted-foreground">Selecione um evento para gerenciar ingressos</p>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}