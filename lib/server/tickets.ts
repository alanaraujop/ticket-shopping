import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

export async function getTicketById(id: string) {
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