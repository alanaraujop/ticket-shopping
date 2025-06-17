import Image from "next/image";
import Link from "next/link";
import { getEvents, getTicketTypes } from "../../actions/tickets";

interface EventDetailPageProps {
  params: { id: string }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const events = await getEvents();
  const event = events.find(e => e.id === params.id);
  if (!event) {
    return <div className="max-w-xl mx-auto py-10 px-4 text-center">Evento não encontrado.</div>;
  }
  const ticketTypes = await getTicketTypes(event.id);

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">{event.name}</h1>
      {event.image_url && (
        <Image src={event.image_url} alt={event.name} width={600} height={300} className="rounded mb-6 object-cover w-full h-64" />
      )}
      <div className="mb-4 text-center">
        <p className="text-muted-foreground">{event.date} às {event.time}</p>
        <p className="text-muted-foreground">Local: {event.venue}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Tipos de Ingresso</h2>
        <ul className="space-y-2">
          {ticketTypes.map(type => (
            <li key={type.id} className="flex justify-between items-center bg-muted rounded px-4 py-2">
              <span>{type.name}</span>
              <span className="font-bold text-primary">R$ {type.price.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-4 mt-8">
        <Link href="/login">
          <button className="w-full bg-primary text-white py-3 rounded hover:bg-primary/90 transition font-semibold text-lg">
            Quero comprar meu ingresso!
          </button>
        </Link>
        <p className="text-center text-muted-foreground">Faça login ou crie sua conta para garantir seu ingresso.</p>
      </div>
      <div className="mt-8 flex justify-center gap-4">
        {event.instagram_url && (
          <a href={event.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Instagram</a>
        )}
        {event.youtube_url && (
          <a href={event.youtube_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">YouTube</a>
        )}
        {event.facebook_url && (
          <a href={event.facebook_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Facebook</a>
        )}
      </div>
    </div>
  );
}