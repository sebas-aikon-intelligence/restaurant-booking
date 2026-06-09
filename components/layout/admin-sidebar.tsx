'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ChefHat,
  CalendarCheck,
  LayoutGrid,
  UtensilsCrossed,
  Sparkles,
  Users,
  Settings,
  MessageSquare,
  LogOut,
  ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/reservas', label: 'Reservas', icon: CalendarCheck },
  { href: '/admin/mensajes', label: 'Mensajes', icon: MessageSquare },
  { href: '/admin/mesas', label: 'Mesas y Zonas', icon: LayoutGrid },
  { href: '/admin/menu', label: 'Menú', icon: UtensilsCrossed },
  { href: '/admin/eventos', label: 'Eventos', icon: Sparkles },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
]

export default function AdminSidebar({
  orgName,
  userEmail
}: {
  orgName: string
  userEmail: string
}) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0 flex-shrink-0">
      {/* Logo / Brand */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100 gap-3">
        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center flex-shrink-0">
          <ChefHat className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-400 leading-none mb-0.5">GourmetOS</p>
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{orgName}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-black text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: Settings + Sign out */}
      <div className="border-t border-gray-100 px-3 py-3 space-y-0.5">
        <Link
          href="/admin/configuracion"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
            pathname === '/admin/configuracion'
              ? 'bg-black text-white'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Settings className={`w-4 h-4 flex-shrink-0 ${pathname === '/admin/configuracion' ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
          <span>Configuración</span>
        </Link>

        <div className="px-3 py-2 mt-1">
          <p className="text-xs text-gray-400 truncate mb-2">{userEmail}</p>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}
