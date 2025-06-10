'use client'

import { useState, useEffect, useCallback } from 'react';
import { AdminGuard } from '@/components/admin-guard'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Ticket } from '@/lib/data'
import { validateTicket } from '@/app/actions/ticket-validation'
import { CheckCircle, XCircle, QrCode, Loader2 } from 'lucide-react'
import { Scanner } from '@yudiel/react-qr-scanner'

export default function ValidateTicketPage() {
  // Estado para controlar a montagem do componente no cliente
  const [mounted, setMounted] = useState(false)
  
  // Estados para controle da validação
  const [ticketId, setTicketId] = useState('')
  const [validationResult, setValidationResult] = useState<{
    success: boolean
    ticket?: Ticket
    message: string
  } | null>(null)
  const [loading, setLoading] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  
  // Efeito para marcar o componente como montado no cliente
  useEffect(() => {
    setMounted(true)
  }, [])

  // Função para validar o ticket manualmente
  const handleValidateTicket = useCallback(async () => {
    if (!ticketId) return
    
    setLoading(true)
    try {
      const result = await validateTicket(ticketId)
      setValidationResult({
        success: result.success,
        ticket: result.ticket,
        message: result.message || (result.success ? 'Ingresso validado com sucesso' : 'Erro ao validar ingresso')
      })
    } catch (error) {
      console.error('Erro ao validar ticket:', error)
      setValidationResult({
        success: false,
        message: 'Erro ao processar a validação do ingresso'
      })
    } finally {
      setLoading(false)
    }
  }, [ticketId])

  // Função para lidar com a leitura do QR code
  const handleScan = useCallback(async (detectedCodes: any) => {
    if (detectedCodes && detectedCodes.length > 0 && !loading) {
      const data = detectedCodes[0].rawValue;
      
      // Verifica se o QR code contém o prefixo "TICKET:"
      if (data.startsWith("TICKET:") && data.endsWith(":Beto William:2024-03-22")) {
        const ticketIdToValidate = data.replace(":Beto William:2024-03-22", "").replace("TICKET:","")
        setTicketId(ticketIdToValidate);
        setShowScanner(false);
        
        // Validar o ticket automaticamente após a leitura
        setLoading(true);
        try {
          const result = await validateTicket(ticketIdToValidate);
          setValidationResult({
            success: result.success,
            ticket: result.ticket,
            message: result.message || (result.success ? 'Ingresso validado com sucesso' : 'Erro ao validar ingresso')
          });
        } catch (error) {
          console.error('Erro ao validar ticket:', error);
          setValidationResult({
            success: false,
            message: 'Erro ao processar a validação do ingresso'
          });
        } finally {
          setLoading(false);
        }
      } else {
        // Se não tiver o prefixo, tenta ler novamente
        console.log("QR code não contém o prefixo TICKET:. Tente novamente.");
        return;
      }
    }
  }, [loading])
  // Função para lidar com erros do scanner
  const handleScanError = useCallback((err: any) => {
    console.error('Erro no scanner de QR code:', err)
  }, [])

  // Função para limpar o resultado e iniciar nova validação
  const handleReset = useCallback(() => {
    setTicketId('')
    setValidationResult(null)
    setShowScanner(false)
  }, [])

  // Se o componente não estiver montado no cliente, renderiza um placeholder
  if (!mounted) {
    return <div className="min-h-screen"></div>
  }

  return (
    <AdminGuard>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Validação de Ingressos</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Validar Ingresso</CardTitle>
              <CardDescription>
                Digite o ID do ingresso ou escaneie o QR code para validar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="ID do ingresso" 
                    value={ticketId} 
                    onChange={(e) => setTicketId(e.target.value)} 
                    disabled={loading}
                  />
                  <Button 
                    onClick={handleValidateTicket} 
                    disabled={!ticketId || loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Validando
                      </>
                    ) : 'Validar'}
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
              <CardTitle>Resultado da Validação</CardTitle>
              <CardDescription>
                Informações sobre o ingresso validado
              </CardDescription>
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
                        <span className="font-semibold">Evento:</span> {validationResult.ticket.event?.name}
                      </div>
                      <div>
                        <span className="font-semibold">Tipo de Ingresso:</span> {validationResult.ticket.ticket_type?.name}
                      </div>
                      <div>
                        <span className="font-semibold">Usuário:</span> {validationResult.ticket.user_email}
                      </div>
                      <div>
                        <span className="font-semibold">Status:</span> {validationResult.success ? 'Utilizado' : validationResult.ticket.status}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Nenhum ingresso validado ainda
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                onClick={handleReset} 
                className="w-full"
                disabled={loading || !validationResult}
              >
                Nova Validação
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminGuard>
  )
}