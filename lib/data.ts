export type Event = {
  id: string
  name: string
  date: string
  time: string
  venue: string
  image_url: string | null
  created_at: string
  updated_at: string
}

export type Ticket = {
  id: string
  event_id: string
  user_id: string
  section: string
  row: string | null
  seat: string | null
  price: number
  status: 'available' | 'sold' | 'reserved'
  created_at: string
  updated_at: string
  // Include event details when needed
  event?: Event
}

// Update the functions to use Supabase
import { supabase } from './supabase'

export async function getUserTickets(userId: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events(*)
    `)
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

export async function getTicketById(id: string): Promise<Ticket> {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function getEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
  
  if (error) throw error
  return data
}

