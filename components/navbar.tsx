'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './auth-provider'

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Verifica se o usuário está na página de login
  if (pathname === '/login') return null

  // Links de navegação
  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/tickets', label: 'Meus Ingressos' },
  ]

  // Links de administração (apenas para administradores)
  const adminLinks = [
    { href: '/admin/events', label: 'Gerenciar Eventos' },
    { href: '/admin/tickets', label: 'Gerenciar Ingressos' },
  ]

  return (
    <header className="bg-background border-b sticky top-0 z-40">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Ticket App</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {link.label}
              </Link>
            ))}
            {user?.profile === 'admin' && adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? 'text-foreground' : 'text-muted-foreground'}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm hidden md:inline-block">
                Olá, {user.name}
              </span>
              <button
                onClick={logout}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

