'use server'

import { createClient } from '@supabase/supabase-js'
import type { Ticket, TicketType } from '@/lib/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Função para criar múltiplos tickets de uma vez
export async function createTickets(
  tickets: { event_id: string; ticket_type_id: string; status: 'available' | 'sold' | 'reserved'; user_email?: string | null; seat?: string | null }[]
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('tickets')
      .insert(tickets)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Erro ao criar tickets:', error)
    return { success: false, error }
  }
}

// Função para atribuir um ticket a um usuário
export async function assignTicketToUser(
  ticketId: string,
  userEmail: string
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('tickets')
      .update({ user_email: userEmail, status: 'sold' })
      .eq('id', ticketId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Erro ao atribuir ticket:', error)
    return { success: false, error }
  }
}

// Função para obter todos os tickets de um evento
export async function getEventTickets(eventId: string): Promise<Ticket[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types(*)
      `)
      .eq('event_id', eventId)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao obter tickets do evento:', error)
    return []
  }
}

// Função para obter estatísticas de tickets por evento
export async function getTicketStats(eventId: string): Promise<{ available: number; sold: number; reserved: number }> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('status')
      .eq('event_id', eventId)
    
    if (error) throw error
    
    const stats = {
      available: 0,
      sold: 0,
      reserved: 0
    }

    data?.forEach(ticket => {
      if (ticket.status in stats) {
        stats[ticket.status as keyof typeof stats]++
      }
    })

    return stats
  } catch (error) {
    console.error('Erro ao obter estatísticas de tickets:', error)
    return { available: 0, sold: 0, reserved: 0 }
  }
}

// Função para atualizar o status de um ticket
export async function updateTicketStatus(
  ticketId: string,
  status: 'available' | 'sold' | 'reserved'
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('tickets')
      .update({ status })
      .eq('id', ticketId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar status do ticket:', error)
    return { success: false, error }
  }
}