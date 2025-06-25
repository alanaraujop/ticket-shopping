'use server'

import { createClient } from '@supabase/supabase-js'
import type { Ticket } from '@/lib/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Função para verificar e validar um ticket pelo ID
export async function validateTicket(ticketId: string): Promise<{ 
  success: boolean; 
  ticket?: Ticket; 
  message?: string; 
  error?: any 
}> {
  try {
    // Primeiro, busca o ticket pelo ID
    const { data: ticket, error: fetchError } = await supabase
      .from('tickets')
      .select(`
        *,
        event:events(*),
        ticket_type:ticket_types(*)
      `)
      .eq('id', ticketId)
      .single()
    
    if (fetchError) {
      return { 
        success: false, 
        message: 'Ticket não encontrado',
        error: fetchError 
      }
    }

    // Verifica se o ticket já foi utilizado
    if (ticket.status === 'used') {
      return { 
        success: false, 
        ticket, 
        message: 'Este ingresso já foi utilizado' 
      }
    }

    // Verifica se o ticket ainda nao foi vendido
    if (ticket.status === 'available') {
      return { 
        success: false, 
        ticket, 
        message: 'Este ingresso não foi vendido' 
      }
    }
   
    // Verifica se o ticket está com pagamento pendente
    if (ticket.status === 'reserved') {
      return { 
        success: false, 
        ticket, 
        message: 'Pagamento pendente' 
      }
    }

    // Se o ticket não foi utilizado, atualiza o status para 'used'
    const { error: updateError } = await supabase
      .from('tickets')
      .update({ status: 'used' })
      .eq('id', ticketId)

    if (updateError) {
      return { 
        success: false, 
        ticket, 
        message: 'Erro ao validar o ingresso',
        error: updateError 
      }
    }

    return { 
      success: true, 
      ticket, 
      message: 'Ingresso validado com sucesso' 
    }
  } catch (error) {
    console.error('Erro ao validar ticket:', error)
    return { 
      success: false, 
      message: 'Erro ao processar a validação do ingresso',
      error 
    }
  }
}