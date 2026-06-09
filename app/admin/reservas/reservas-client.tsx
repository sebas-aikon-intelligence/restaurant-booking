'use client'

import { useState, useMemo } from 'react'
import { CalendarCheck, Plus, Search, Filter, X, Loader2, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Booking = {
  id: string
  guest_name: string
  guest_email: string
  guest_phone?: string
  guest_comments?: string
  booking_date: string
  booking_time: string
  party_size: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  confirmation_code: string
  zones?: { name: string } | null
  tables?: { number: string } | null
}

type Zone = { id: string; name: string }

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pendiente',  color: 'bg-amber-100 text-amber-700' },
  confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelada',  color: 'bg-red-100 text-red-700' },
  completed: { label: 'Completada', color: 'bg-blue-100 text-blue-700' },
  no_show:   { label: 'No asistió', color: 'bg-gray-100 text-gray-600' },
}

export default function ReservasClient({
  bookings: initialBookings,
  zones,
  orgId
}: {
  bookings: Booking[]
  zones: Zone[]
  orgId: string | null
}) {
  const router = useRouter()
  const [bookings, setBookings] = useState(initialBookings)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showModal, setShowModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [form, setForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '',
    booking_date: '', booking_time: '', party_size: '2',
    zone_id: '', guest_comments: ''
  })

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const matchSearch = !search ||
        b.guest_name.toLowerCase().includes(search.toLowerCase()) ||
        b.guest_email.toLowerCase().includes(search.toLowerCase()) ||
        b.confirmation_code?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || b.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [bookings, search, filterStatus])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    setIsCreating(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('bookings').insert({
      org_id: orgId,
      guest_name: form.guest_name,
      guest_email: form.guest_email,
      guest_phone: form.guest_phone || null,
      guest_comments: form.guest_comments || null,
      booking_date: form.booking_date,
      booking_time: form.booking_time,
      party_size: parseInt(form.party_size),
      zone_id: form.zone_id || null,
      status: 'confirmed',
    }).select('*, zones(name), tables(number)').single()

    if (!error && data) {
      setBookings(prev => [data, ...prev])
      setShowModal(false)
      setForm({ guest_name: '', guest_email: '', guest_phone: '', booking_date: '', booking_time: '', party_size: '2', zone_id: '', guest_comments: '' })
    }
    setIsCreating(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('bookings').update({ status }).eq('id', id)
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: status as Booking['status'] } : b))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarCheck className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-semibold text-gray-900">Reservas</h1>
          <span className="text-sm text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{filtered.length}</span>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" />
          Nueva reserva
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div className="flex items-center gap-2">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStatus === s ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'Todas' : STATUS_LABELS[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <CalendarCheck className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">Sin reservas</p>
            <p className="text-sm">Crea tu primera reserva o espera solicitudes en línea.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Cliente</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Fecha</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Hora</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Personas</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Zona</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Estado</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Código</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(b => {
                  const st = STATUS_LABELS[b.status] ?? STATUS_LABELS.pending
                  return (
                    <tr key={b.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3.5">
                        <p className="font-medium text-gray-900">{b.guest_name}</p>
                        <p className="text-gray-400 text-xs">{b.guest_email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-700">{new Date(b.booking_date + 'T12:00:00').toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="px-5 py-3.5 text-gray-700">{b.booking_time?.slice(0, 5)}</td>
                      <td className="px-5 py-3.5 text-gray-700">{b.party_size}</td>
                      <td className="px-5 py-3.5 text-gray-500">{b.zones?.name ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <div className="relative group">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer ${st.color}`}>
                            {st.label}
                            <ChevronDown className="w-3 h-3" />
                          </span>
                          <div className="absolute z-10 hidden group-hover:block top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[140px]">
                            {Object.entries(STATUS_LABELS).map(([key, val]) => (
                              <button
                                key={key}
                                onClick={() => handleStatusChange(b.id, key)}
                                className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-700"
                              >
                                {val.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-gray-400">{b.confirmation_code}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Nueva Reserva</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-600">Nombre del cliente *</label>
                  <input required value={form.guest_name} onChange={e => setForm(p => ({ ...p, guest_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Email *</label>
                  <input required type="email" value={form.guest_email} onChange={e => setForm(p => ({ ...p, guest_email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Teléfono</label>
                  <input value={form.guest_phone} onChange={e => setForm(p => ({ ...p, guest_phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Fecha *</label>
                  <input required type="date" value={form.booking_date} onChange={e => setForm(p => ({ ...p, booking_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Hora *</label>
                  <input required type="time" value={form.booking_time} onChange={e => setForm(p => ({ ...p, booking_time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Personas *</label>
                  <input required type="number" min="1" max="50" value={form.party_size} onChange={e => setForm(p => ({ ...p, party_size: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Zona</label>
                  <select value={form.zone_id} onChange={e => setForm(p => ({ ...p, zone_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black bg-white">
                    <option value="">Sin zona</option>
                    {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-xs font-medium text-gray-600">Comentarios</label>
                  <textarea value={form.guest_comments} onChange={e => setForm(p => ({ ...p, guest_comments: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={isCreating}
                  className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Crear reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
