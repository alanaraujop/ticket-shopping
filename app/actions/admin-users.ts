'use server'

import { createClient } from '@supabase/supabase-js'
import type { User, Event } from '@/lib/data'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Função para obter todos os usuários
export async function getUsers(): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, profile')
      .order('name', { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao obter usuários:', error)
    return []
  }
}

// Função para obter todos os eventos
export async function getEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao obter eventos:', error)
    return []
  }
}

// Função para obter um usuário pelo email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, profile')
      .eq('email', email)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao obter usuário:', error)
    return null
  }
}

// Função para obter um evento pelo ID
export async function getEventById(id: string): Promise<Event | null> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Erro ao obter evento:', error)
    return null
  }
}