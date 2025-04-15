'use server'

import { createClient } from '@supabase/supabase-js'
import type { Ticket, Event, TicketType } from '@/lib/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function getTicketTypes(eventId: string): Promise<TicketType[]> {
  const { data, error } = await supabase
    .from('ticket_types')
    .select('*')
    .eq('event_id', eventId)
    .order('price', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getTicketById(id: string): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events(*),
      ticket_type:ticket_types(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getUserTickets(userEmail: string): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events(*),
      ticket_type:ticket_types(*)
    `)
    .eq('user_email', userEmail)
  
  if (error) throw error
  return data
}

export async function getEvents(): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
  
  if (error) throw error
  return data
}