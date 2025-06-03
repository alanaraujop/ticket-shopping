export type Event = {
  id: string
  name: string
  date: string
  time: string
  venue: string
  image_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  facebook_url: string | null
  created_at: string
  updated_at: string
}

export type TicketType = {
  id: string
  event_id: string
  name: string
  price: number
  created_at: string
  updated_at: string
}

export type Ticket = {
  id: string
  event_id: string
  user_email: string
  ticket_type_id: string
  seat: string | null
  status: 'available' | 'sold' | 'reserved'
  created_at: string
  updated_at: string
  event?: Event
  ticket_type?: TicketType
}

export type User = {
  id: string
  email: string
  name: string
  profile: 'admin' | 'user'
}

// Update the functions to use Supabase
import { supabase } from './supabase'

// Update the getUserTickets function to use email
export async function getUserTickets(userEmail: string) {
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events(*)
    `)
    .eq('user_email', userEmail)
  
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

