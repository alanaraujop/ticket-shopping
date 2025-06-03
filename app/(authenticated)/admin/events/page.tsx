'use client'

import { AdminGuard } from "@/components/admin-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

export default function AdminEventsPage() {
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    venue: '',
    image_url: '',
    instagram_url: '',
    youtube_url: '',
    facebook_url: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implementar a lógica de criação do evento
  }

  return (
    <AdminGuard>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Gerenciar Eventos</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Novo Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Evento</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue">Local</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={e => setFormData({...formData, venue: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">URL da Imagem</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram_url">Instagram</Label>
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={e => setFormData({...formData, instagram_url: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube_url">YouTube</Label>
                  <Input
                    id="youtube_url"
                    value={formData.youtube_url}
                    onChange={e => setFormData({...formData, youtube_url: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebook_url">Facebook</Label>
                  <Input
                    id="facebook_url"
                    value={formData.facebook_url}
                    onChange={e => setFormData({...formData, facebook_url: e.target.value})}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Criar Evento
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}