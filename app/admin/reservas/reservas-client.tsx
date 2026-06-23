'use client'

import { useState, useMemo } from 'react'
import {
  CalendarCheck, Plus, Search, X, Loader2, ChevronDown,
  Clock, Users, MapPin, Phone, Mail, MessageSquare,
  CheckCircle2, Hash, ChevronRight
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  pending:   { label: 'Pendiente',  bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-400' },
  confirmed: { label: 'Confirmada', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  cancelled: { label: 'Cancelada',  bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-400' },
  completed: { label: 'Completada', bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  no_show:   { label: 'No asistió', bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400' },
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function avatarColor(name: string) {
  const colors = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
    'bg-indigo-100 text-indigo-700',
    'bg-orange-100 text-orange-700',
    'bg-cyan-100 text-cyan-700',
  ]
  let hash = 0
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function formatBookingDate(dateStr: string) {
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (date.toDateString() === today.toDateString()) return { label: 'Hoy', sub: date.toLocaleDateString('es', { day: 'numeric', month: 'short' }) }
  if (date.toDateString() === tomorrow.toDateString()) return { label: 'Mañana', sub: date.toLocaleDateString('es', { day: 'numeric', month: 'short' }) }
  return { label: date.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' }), sub: date.getFullYear().toString() }
}

function BookingCard({
  booking,
  onStatusChange,
  onConfirmAttendance,
}: {
  booking: Booking
  onStatusChange: (id: string, status: string) => void
  onConfirmAttendance: (id: string) => void
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const st = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending
  const dateInfo = formatBookingDate(booking.booking_date)
  const color = avatarColor(booking.guest_name)
  const canConfirmAttendance = booking.status === 'confirmed' || booking.status === 'pending'

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all ${expanded ? 'shadow-md' : 'hover:shadow-sm'}`}>
      {/* Main row */}
      <div className="flex items-center gap-4 px-5 py-4">

        {/* Avatar */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 ${color}`}>
          {initials(booking.guest_name)}
        </div>

        {/* Contact info */}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate">{booking.guest_name}</p>
          <div className="flex items-center gap-3 mt-0.5">
            {booking.guest_phone && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Phone className="w-3 h-3" />{booking.guest_phone}
              </span>
            )}
            {booking.guest_email && (
              <span className="flex items-center gap-1 text-xs text-gray-400 truncate">
                <Mail className="w-3 h-3" />{booking.guest_email}
              </span>
            )}
          </div>
        </div>

        {/* Date & time */}
        <div className="text-center flex-shrink-0 hidden sm:block">
          <p className="text-sm font-semibold text-gray-900">{dateInfo.label}</p>
          <p className="text-xs text-gray-400">{dateInfo.sub}</p>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1.5 flex-shrink-0 bg-gray-50 px-3 py-1.5 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-800">{booking.booking_time?.slice(0, 5)}</span>
        </div>

        {/* Guests */}
        <div className="flex items-center gap-1.5 flex-shrink-0 bg-gray-50 px-3 py-1.5 rounded-xl">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-800">{booking.party_size}</span>
        </div>

        {/* Zone/table */}
        {(booking.zones?.name || booking.tables?.number) && (
          <div className="flex items-center gap-1.5 flex-shrink-0 hidden md:flex">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-600">
              {booking.zones?.name ?? ''}{booking.tables?.number ? ` · Mesa ${booking.tables.number}` : ''}
            </span>
          </div>
        )}

        {/* Status dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${st.bg} ${st.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
            {st.label}
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          {dropdownOpen && (
            <div className="absolute z-20 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 min-w-[150px]">
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => { onStatusChange(booking.id, key); setDropdownOpen(false) }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-gray-50 transition ${booking.status === key ? val.text : 'text-gray-700'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${val.dot}`} />
                  {val.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition"
        >
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Expanded detail panel */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Código</p>
              <p className="text-sm font-mono font-semibold text-gray-800">{booking.confirmation_code || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Fecha</p>
              <p className="text-sm text-gray-800">
                {new Date(booking.booking_date + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Zona</p>
              <p className="text-sm text-gray-800">{booking.zones?.name ?? 'Sin zona'}</p>
            </div>
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Mesa</p>
              <p className="text-sm text-gray-800">{booking.tables?.number ? `Mesa ${booking.tables.number}` : 'Sin asignar'}</p>
            </div>
          </div>

          {booking.guest_comments && (
            <div className="mb-4">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1">Comentarios del cliente</p>
              <div className="flex items-start gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2">
                <MessageSquare className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{booking.guest_comments}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {canConfirmAttendance && (
              <button
                onClick={() => onConfirmAttendance(booking.id)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Confirmar asistencia
              </button>
            )}
            {booking.status !== 'cancelled' && (
              <button
                onClick={() => onStatusChange(booking.id, 'cancelled')}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition"
              >
                <X className="w-3.5 h-3.5" />
                Cancelar reserva
              </button>
            )}
            {booking.guest_phone && (
              <a
                href={`https://wa.me/${booking.guest_phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
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
        b.guest_email?.toLowerCase().includes(search.toLowerCase()) ||
        b.confirmation_code?.toLowerCase().includes(search.toLowerCase()) ||
        b.guest_phone?.includes(search)
      const matchStatus = filterStatus === 'all' || b.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [bookings, search, filterStatus])

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, Booking[]>()
    for (const b of filtered) {
      const key = b.booking_date
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(b)
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a))
  }, [filtered])

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

  const handleConfirmAttendance = async (id: string) => {
    await handleStatusChange(id, 'completed')
  }

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length }
    for (const b of bookings) c[b.status] = (c[b.status] ?? 0) + 1
    return c
  }, [bookings])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarCheck className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-semibold text-gray-900">Reservas</h1>
          <span className="text-sm text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">{filtered.length}</span>
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
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nombre, email, teléfono o código..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show'].map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStatus === s ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'Todas' : STATUS_CONFIG[s]?.label}
              {counts[s] > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${filterStatus === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {counts[s]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <CalendarCheck className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg font-medium">Sin reservas</p>
            <p className="text-sm">Crea tu primera reserva o espera solicitudes en línea.</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-5xl mx-auto">
            {grouped.map(([date, items]) => {
              const d = new Date(date + 'T12:00:00')
              const today = new Date()
              const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
              let dateLabel = d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
              if (d.toDateString() === today.toDateString()) dateLabel = `Hoy · ${dateLabel}`
              else if (d.toDateString() === tomorrow.toDateString()) dateLabel = `Mañana · ${dateLabel}`

              return (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide capitalize">{dateLabel}</p>
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400">{items.length} reserva{items.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-2">
                    {items
                      .slice()
                      .sort((a, b) => a.booking_time.localeCompare(b.booking_time))
                      .map(b => (
                        <BookingCard
                          key={b.id}
                          booking={b}
                          onStatusChange={handleStatusChange}
                          onConfirmAttendance={handleConfirmAttendance}
                        />
                      ))}
                  </div>
                </div>
              )
            })}
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
