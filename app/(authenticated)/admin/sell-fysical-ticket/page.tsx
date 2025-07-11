'use client'

import { AdminGuard } from "@/components/admin-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect, useCallback } from "react"
import { Event, Ticket } from "@/lib/data"
import { assignTicketToUser, getEventTickets, updateTicketStatus } from "@/app/actions/admin-tickets"
import { getEvents } from "@/app/actions/admin-users"
import { validateTicket } from "@/app/actions/ticket-validation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, QrCode, Loader2 } from "lucide-react"
import { Scanner } from "@yudiel/react-qr-scanner"

export default function SellFysicalTicketPage() {
  // Estado para controlar a montagem do componente no cliente
  const [mounted, setMounted] = useState(false)
  
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [ticketId, setTicketId] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    success: boolean
    ticket?: Ticket
    message: string
  } | null>(null)
  
  // Email fixo para venda local
  const localSalesEmail = "vendalocal@gmail.com"

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

  // Função para validar o ticket manualmente
  const handleValidateTicket = useCallback(async () => {
    if (!ticketId) return
    
    setLoading(true)
    try {
      // Verificar se o ticket existe e está disponível
      const ticket = tickets.find(t => t.id === ticketId)
      
      if (!ticket) {
        setValidationResult({
          success: false,
          message: 'Ingresso não encontrado'
        })
        setLoading(false)
        return
      }
      
      if (ticket.status !== 'available') {
        setValidationResult({
          success: false,
          ticket,
          message: `Este ingresso não está disponível. Status atual: ${ticket.status}`
        })
        setLoading(false)
        return
      }
      
      // Se o ticket estiver disponível, atribuir ao email de venda local
      const result = await assignTicketToUser(ticketId, localSalesEmail)

      if (!result.success) {
        setValidationResult({
          success: false,
          ticket,
          message: 'Erro ao vender o ingresso'
        })
      } else {
        setValidationResult({
          success: true,
          ticket: {...ticket, status: 'sold', user_email: localSalesEmail},
          message: 'Ingresso vendido com sucesso!'
        })
        // Recarregar os tickets após a venda
        loadTickets()
      }
    } catch (error) {
      console.error('Erro ao processar venda:', error)
      setValidationResult({
        success: false,
        message: 'Erro ao processar a venda do ingresso'
      })
    } finally {
      setLoading(false)
    }
  }, [ticketId, tickets, localSalesEmail, loadTickets])

  // Função para lidar com a leitura do QR code
  const handleScan = useCallback(async (detectedCodes: any) => {
    if (detectedCodes && detectedCodes.length > 0 && !loading) {
      const data = detectedCodes[0].rawValue;
      setTicketId(data);
      setShowScanner(false);
    }
  }, [loading])

  // Função para lidar com erros do scanner
  const handleScanError = useCallback((err: any) => {
    console.error('Erro no scanner de QR code:', err)
  }, [])

  // Função para limpar o resultado e iniciar nova venda
  const handleReset = useCallback(() => {
    setTicketId('')
    setValidationResult(null)
    setShowScanner(false)
  }, [])

  // Função para converter texto para maiúsculas
  const handleTicketIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTicketId(e.target.value.toUpperCase())
  }

  // Se o componente não estiver montado no cliente, renderiza um placeholder
  if (!mounted) {
    return <div className="min-h-screen"></div> // Placeholder vazio com altura mínima
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vender Ingresso Físico</h1>
        
        <div className="flex items-center space-x-4">
          <div className="w-1/3">
            <Label htmlFor="event-select">Selecione um evento</Label>
            <Select 
              value={selectedEvent} 
              onValueChange={(value) => {
                setSelectedEvent(value)
                handleReset()
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vender Ingresso Físico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="ID DO INGRESSO" 
                      value={ticketId} 
                      onChange={handleTicketIdChange} 
                      disabled={loading}
                      className="uppercase"
                    />
                    <Button 
                      onClick={handleValidateTicket} 
                      disabled={!ticketId || loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando
                        </>
                      ) : 'Vender'}
                    </Button>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowScanner(!showScanner)}
                      disabled={loading}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      {showScanner ? 'Fechar Scanner' : 'Escanear QR Code'}
                    </Button>
                  </div>
                  
                  {showScanner && mounted && (
                    <div className="mt-4">
                      <p className="text-center mb-2">Posicione o QR code na frente da câmera</p>
                      <div className="flex justify-center">
                        <div className="w-full max-w-sm">
                          <Scanner
                            constraints={{ facingMode: "environment" }}
                            scanDelay={500}
                            onScan={handleScan}
                            onError={handleScanError}
                            styles={{ container: { width: '100%' } }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resultado da Venda</CardTitle>
              </CardHeader>
              <CardContent>
                {validationResult ? (
                  <div className="space-y-4">
                    <Alert variant={validationResult.success ? "default" : "destructive"}>
                      {validationResult.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {validationResult.success ? 'Sucesso' : 'Erro'}
                      </AlertTitle>
                      <AlertDescription>
                        {validationResult.message}
                      </AlertDescription>
                    </Alert>
                    
                    {validationResult.ticket && (
                      <div className="border rounded-md p-4 space-y-2">
                        <div>
                          <span className="font-semibold">ID do Ingresso:</span> {validationResult.ticket.id}
                        </div>
                        <div>
                          <span className="font-semibold">Tipo de Ingresso:</span> {validationResult.ticket.ticket_type?.name}
                        </div>
                        <div>
                          <span className="font-semibold">Vendido para:</span> {localSalesEmail}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum ingresso vendido ainda
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  onClick={handleReset} 
                  className="w-full mt-4"
                  disabled={loading || !validationResult}
                >
                  Nova Venda
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 border rounded-lg">
            <p className="text-muted-foreground">Selecione um evento para vender ingressos</p>
          </div>
        )}
      </div>
    </AdminGuard>
  )
}