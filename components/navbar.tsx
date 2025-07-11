'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from './auth-provider'
import { Menu } from 'lucide-react'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'

const emailsAdmin = ['adriana.batista0602@gmail.com', 'kauane.gama1608@gmail.com', 'stephaniemello60@gmail.com']
export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Verifica se o usuário está na página de login
  if (pathname === '/login') return null

  const isAdmin = user?.profile === 'admin' || emailsAdmin.includes(user?.email || '')

  // Links de navegação
  const navLinks = [
    { href: '/', label: 'Início' },
    { href: '/tickets', label: 'Meus Ingressos' },
  ]

  // Links de administração (apenas para administradores)
  const adminLinks = [
    // { href: '/admin/events', label: 'Gerenciar Eventos' },
    { href: '/admin/tickets', label: 'Gerenciar Ingressos' },
    { href: '/admin/validate-ticket', label: 'Validar Ingressos' },
    { href: '/admin/sell-ticket', label: 'Vender Ingressos' },
    { href: '/admin/sell-fysical-ticket', label: 'Venda Local' },
  ]

  // Componente de link de navegação para reutilização
  interface NavLinkProps {
    href: string;
    label: string;
    onClick?: () => void;
  }
  
  const NavLink = ({ href, label, onClick }: NavLinkProps) => (
    <Link
      href={href}
      onClick={onClick}
      className={`text-sm font-medium transition-colors hover:text-primary ${pathname === href ? 'text-foreground' : 'text-muted-foreground'}`}
    >
      {label}
    </Link>
  )

  return (
    <header className="bg-background border-b sticky top-0 z-40 px-4 w-full">
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Ticket App</span>
          </Link>
          
          {/* Menu de navegação para desktop */}
          <nav className="hidden md:flex gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
            {isAdmin && adminLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>
        </div>
        
        {/* Menu para dispositivos móveis */}
        {(
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-6 mt-8">
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <NavLink key={link.href} href={link.href} label={link.label} />
                  ))}
                  {isAdmin && adminLinks.map((link) => (
                    <NavLink key={link.href} href={link.href} label={link.label} />
                  ))}
                </div>
                <div className="border-t pt-4">
                  {user ? (
                    <div className="flex flex-col gap-4">
                      <span className="text-sm">Olá, {user.name}</span>
                      <button
                        onClick={logout}
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left"
                      >
                        Sair
                      </button>
                    </div>
                  ) : (
                    <NavLink href="/login" label="Entrar" />
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
        
        {/* Informações do usuário para desktop */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm">
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

