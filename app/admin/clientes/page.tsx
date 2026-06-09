import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'

type Guest = {
  guest_name: string
  guest_email: string
  guest_phone?: string
  total_bookings: number
  last_booking: string
}

export default async function ClientesPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  const { data: bookings } = profile?.org_id
    ? await supabase
        .from('bookings')
        .select('guest_name, guest_email, guest_phone, booking_date, status')
        .eq('org_id', profile.org_id)
        .order('booking_date', { ascending: false })
    : { data: [] }

  // Group by email
  const guestMap = new Map<string, Guest>()
  for (const b of bookings ?? []) {
    const existing = guestMap.get(b.guest_email)
    if (existing) {
      existing.total_bookings++
    } else {
      guestMap.set(b.guest_email, {
        guest_name: b.guest_name,
        guest_email: b.guest_email,
        guest_phone: b.guest_phone,
        total_bookings: 1,
        last_booking: b.booking_date,
      })
    }
  }
  const guests = Array.from(guestMap.values()).sort((a, b) => b.total_bookings - a.total_bookings)

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center gap-3">
        <Users className="w-5 h-5 text-gray-700" />
        <h1 className="text-lg font-semibold text-gray-900">Clientes</h1>
        <span className="text-sm text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{guests.length}</span>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {guests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Sin clientes aún</p>
            <p className="text-sm">Los clientes aparecerán aquí cuando realicen reservas.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Teléfono</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Reservas</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Última visita</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Tipo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {guests.map(g => (
                  <tr key={g.guest_email} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{g.guest_name}</p>
                      <p className="text-gray-400 text-xs">{g.guest_email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{g.guest_phone ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-gray-900">{g.total_bookings}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {new Date(g.last_booking + 'T12:00:00').toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3.5">
                      {g.total_bookings >= 5 ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Frecuente</span>
                      ) : g.total_bookings >= 2 ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Regular</span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">Nuevo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
