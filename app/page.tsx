import Image from "next/image";
import Link from "next/link";
import { getEvents } from "./actions/tickets";
import { Navbar } from '@/components/navbar';

export default async function Home() {
  const events = await getEvents();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Eventos em Destaque</h1>
        <div className="grid gap-8 md:grid-cols-2">
          {events.map(event => (
            <div key={event.id} className="bg-card rounded-lg shadow p-4 flex flex-col items-center">
              {event.image_url && (
                <Image src={event.image_url} alt={event.name} width={400} height={200} className="rounded mb-4 object-cover w-full h-48" />
              )}
              <h2 className="text-xl font-semibold mb-2 text-center">{event.name}</h2>
              <p className="text-muted-foreground mb-1">{event.date} às {event.time}</p>
              <p className="text-muted-foreground mb-2">{event.venue}</p>
              <Link href={`/eventos/${event.id}`} className="mt-2 w-full">
                <button className="w-full bg-primary text-white py-2 rounded hover:bg-primary/90 transition font-medium text-lg">
                  Quero garantir meu ingresso!
                </button>
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <p className="text-lg font-medium">Não perca a chance de viver experiências incríveis!</p>
          <p className="text-muted-foreground">Garanta já seu ingresso para o próximo evento.</p>
        </div>
      </div>
    </div>
  );
}