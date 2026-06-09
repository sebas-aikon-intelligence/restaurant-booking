'use client'

import { useState, useMemo } from 'react'
import {
  ChevronLeft, ChevronRight, Calendar, Clock, Users, MapPin,
  LayoutGrid, CheckCircle2, ChefHat, Loader2, Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Org = { id: string; name: string; slug?: string; description?: string; logo_url?: string; cover_url?: string; phone?: string; address?: string }
type Zone = { id: string; name: string }
type Table = { id: string; zone_id: string; number: string; seats: number; status: string; position?: { x: number; y: number; shape: 'rect' | 'circle' } }
type Event = { id: string; title: string; description?: string; event_date?: string; image_url?: string }
type BusinessHour = { day_of_week: number; open_time?: string; close_time?: string; is_closed: boolean; booking_duration_minutes?: number }

type Step = 'fecha' | 'hora' | 'personas' | 'zona' | 'mesa' | 'datos' | 'confirmacion' | 'exito'

const STEPS: { key: Step; label: string }[] = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'hora', label: 'Hora' },
  { key: 'personas', label: 'Personas' },
  { key: 'zona', label: 'Zona' },
  { key: 'mesa', label: 'Mesa' },
  { key: 'datos', label: 'Datos' },
  { key: 'confirmacion', label: 'Confirmar' },
]

function generateTimeSlots(open: string, close: string, durationMin: number): string[] {
  const slots: string[] = []
  const [oh, om] = open.split(':').map(Number)
  const [ch, cm] = close.split(':').map(Number)
  let cur = oh * 60 + om
  const end = ch * 60 + cm - durationMin
  while (cur <= end) {
    const h = Math.floor(cur / 60).toString().padStart(2, '0')
    const m = (cur % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
    cur += durationMin
  }
  return slots
}

export default function BookingFlow({
  org, zones, tables, events, businessHours
}: {
  org: Org; zones: Zone[]; tables: Table[]; events: Event[]; businessHours: BusinessHour[]
}) {
  const [step, setStep] = useState<Step>('fecha')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [partySize, setPartySize] = useState(2)
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [form, setForm] = useState({ name: '', email: '', phone: '', comments: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationCode, setConfirmationCode] = useState<string>('')
  const [calendarMonth, setCalendarMonth] = useState(new Date())

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Day availability
  const getDayOfWeek = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.getDay()
  }

  const isDateDisabled = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    if (d < today) return true
    const dow = d.getDay()
    const hour = businessHours.find(h => h.day_of_week === dow)
    return hour?.is_closed ?? false
  }

  const timeSlots = useMemo(() => {
    if (!selectedDate) return []
    const dow = getDayOfWeek(selectedDate)
    const hour = businessHours.find(h => h.day_of_week === dow)
    if (!hour || hour.is_closed || !hour.open_time || !hour.close_time) return []
    return generateTimeSlots(hour.open_time, hour.close_time, hour.booking_duration_minutes ?? 90)
  }, [selectedDate, businessHours])

  const availableTables = useMemo(() => {
    if (!selectedZone) return []
    return tables.filter(t =>
      t.zone_id === selectedZone.id &&
      t.seats >= partySize &&
      t.status !== 'blocked' &&
      t.status !== 'out_of_service'
    )
  }, [selectedZone, tables, partySize])

  // Calendar
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (string | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(`${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    }
    return days
  }, [calendarMonth])

  const handleSubmit = async () => {
    if (!selectedTable || !selectedZone) return
    setIsSubmitting(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('bookings').insert({
      org_id: org.id,
      zone_id: selectedZone.id,
      table_id: selectedTable.id,
      guest_name: form.name,
      guest_email: form.email,
      guest_phone: form.phone || null,
      guest_comments: form.comments || null,
      booking_date: selectedDate,
      booking_time: selectedTime,
      party_size: partySize,
      status: 'pending',
    }).select('confirmation_code').single()

    if (!error && data) {
      setConfirmationCode(data.confirmation_code)
      setStep('exito')
    }
    setIsSubmitting(false)
  }

  const canProceed = () => {
    if (step === 'fecha') return !!selectedDate
    if (step === 'hora') return !!selectedTime
    if (step === 'personas') return partySize >= 1
    if (step === 'zona') return !!selectedZone
    if (step === 'mesa') return !!selectedTable
    if (step === 'datos') return !!form.name && !!form.email
    return true
  }

  const nextStep = () => {
    const order: Step[] = ['fecha', 'hora', 'personas', 'zona', 'mesa', 'datos', 'confirmacion', 'exito']
    const idx = order.indexOf(step)
    if (idx < order.length - 1) setStep(order[idx + 1])
  }

  const prevStep = () => {
    const order: Step[] = ['fecha', 'hora', 'personas', 'zona', 'mesa', 'datos', 'confirmacion', 'exito']
    const idx = order.indexOf(step)
    if (idx > 0) setStep(order[idx - 1])
  }

  const stepIndex = STEPS.findIndex(s => s.key === step)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Header */}
      <header className="relative h-64 overflow-hidden bg-gray-900">
        {org.cover_url && (
          <img src={org.cover_url} alt={org.name} className="absolute inset-0 w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-white text-center px-4">
          {org.logo_url && (
            <img src={org.logo_url} alt={org.name} className="w-16 h-16 rounded-2xl mb-3 object-cover" />
          )}
          <h1 className="text-4xl font-bold tracking-tight">{org.name}</h1>
          {org.description && <p className="mt-2 text-white/80 text-sm max-w-sm">{org.description}</p>}
          {org.address && <p className="mt-1 text-white/60 text-xs flex items-center gap-1"><MapPin className="w-3 h-3" />{org.address}</p>}
        </div>
      </header>

      {/* Events carousel */}
      {events.length > 0 && (
        <div className="bg-black text-white py-4 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex gap-6 overflow-x-auto pb-1 scrollbar-hide">
              {events.map(ev => (
                <div key={ev.id} className="flex-shrink-0 flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-2.5">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{ev.title}</p>
                    {ev.event_date && <p className="text-xs text-white/60">{new Date(ev.event_date + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'long' })}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Booking engine */}
      {step === 'exito' ? (
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-10">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Reserva confirmada!</h2>
            <p className="text-gray-500 mb-6">Hemos recibido tu reserva. Te enviaremos un correo de confirmación.</p>
            <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Restaurante</span>
                <span className="font-medium">{org.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Fecha</span>
                <span className="font-medium">{new Date(selectedDate + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Hora</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Personas</span>
                <span className="font-medium">{partySize}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Zona / Mesa</span>
                <span className="font-medium">{selectedZone?.name} — {selectedTable?.number}</span>
              </div>
            </div>
            <div className="bg-black text-white rounded-2xl p-4 mb-4">
              <p className="text-xs text-white/60 mb-1">Código de reserva</p>
              <p className="text-2xl font-mono font-bold tracking-wider">{confirmationCode}</p>
            </div>
            <p className="text-xs text-gray-400">Guarda este código. Lo necesitarás al llegar al restaurante.</p>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Progress */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition ${
                  i < stepIndex ? 'bg-black text-white' :
                  i === stepIndex ? 'bg-black text-white ring-4 ring-black/20' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-6 mx-1 transition ${i < stepIndex ? 'bg-black' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step card */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {step === 'fecha' && 'Selecciona una fecha'}
                {step === 'hora' && 'Elige un horario'}
                {step === 'personas' && '¿Cuántos son?'}
                {step === 'zona' && 'Elige tu zona preferida'}
                {step === 'mesa' && 'Selecciona tu mesa'}
                {step === 'datos' && 'Tus datos de contacto'}
                {step === 'confirmacion' && 'Confirma tu reserva'}
              </h2>
            </div>

            <div className="px-8 py-6">
              {/* FECHA */}
              {step === 'fecha' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => {
                      const d = new Date(calendarMonth)
                      d.setMonth(d.getMonth() - 1)
                      setCalendarMonth(d)
                    }} className="p-2 hover:bg-gray-100 rounded-xl transition">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-gray-800 capitalize">
                      {calendarMonth.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => {
                      const d = new Date(calendarMonth)
                      d.setMonth(d.getMonth() + 1)
                      setCalendarMonth(d)
                    }} className="p-2 hover:bg-gray-100 rounded-xl transition">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
                      <div key={d} className="text-xs font-medium text-gray-400 py-2">{d}</div>
                    ))}
                    {calendarDays.map((day, i) => {
                      if (!day) return <div key={i} />
                      const disabled = isDateDisabled(day)
                      const selected = selectedDate === day
                      return (
                        <button
                          key={day}
                          disabled={disabled}
                          onClick={() => { setSelectedDate(day); setSelectedTime('') }}
                          className={`py-2.5 rounded-xl text-sm font-medium transition ${
                            selected ? 'bg-black text-white' :
                            disabled ? 'text-gray-300 cursor-not-allowed' :
                            'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {parseInt(day.split('-')[2])}
                        </button>
                      )
                    })}
                  </div>
                  {selectedDate && (
                    <p className="text-center mt-4 text-sm text-gray-500">
                      Seleccionado: <strong>{new Date(selectedDate + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
                    </p>
                  )}
                </div>
              )}

              {/* HORA */}
              {step === 'hora' && (
                <div>
                  {timeSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No hay horarios disponibles para esta fecha.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-3 rounded-xl text-sm font-medium border transition ${
                            selectedTime === slot
                              ? 'bg-black text-white border-black'
                              : 'border-gray-200 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PERSONAS */}
              {step === 'personas' && (
                <div className="flex flex-col items-center py-6">
                  <div className="flex items-center gap-8">
                    <button
                      onClick={() => setPartySize(p => Math.max(1, p - 1))}
                      className="w-14 h-14 rounded-full border-2 border-gray-300 flex items-center justify-center text-2xl font-light hover:border-black transition"
                    >
                      −
                    </button>
                    <div className="text-center">
                      <p className="text-6xl font-bold text-gray-900">{partySize}</p>
                      <p className="text-sm text-gray-400 mt-1">{partySize === 1 ? 'persona' : 'personas'}</p>
                    </div>
                    <button
                      onClick={() => setPartySize(p => Math.min(20, p + 1))}
                      className="w-14 h-14 rounded-full border-2 border-gray-300 flex items-center justify-center text-2xl font-light hover:border-black transition"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* ZONA */}
              {step === 'zona' && (
                <div>
                  {zones.length === 0 ? (
                    <p className="text-center py-8 text-gray-400">Este restaurante aún no tiene zonas configuradas.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {zones.map(z => {
                        const tableCount = tables.filter(t => t.zone_id === z.id && t.seats >= partySize && t.status === 'available').length
                        return (
                          <button
                            key={z.id}
                            onClick={() => { setSelectedZone(z); setSelectedTable(null) }}
                            className={`p-5 rounded-2xl border-2 text-left transition ${
                              selectedZone?.id === z.id
                                ? 'border-black bg-black text-white'
                                : tableCount === 0 ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-200 hover:border-gray-400'
                            }`}
                            disabled={tableCount === 0}
                          >
                            <LayoutGrid className="w-5 h-5 mb-2 opacity-70" />
                            <p className="font-semibold">{z.name}</p>
                            <p className={`text-xs mt-1 ${selectedZone?.id === z.id ? 'text-white/70' : 'text-gray-400'}`}>
                              {tableCount} mesa{tableCount !== 1 ? 's' : ''} disponible{tableCount !== 1 ? 's' : ''}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MESA */}
              {step === 'mesa' && (
                <div>
                  {availableTables.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <LayoutGrid className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No hay mesas disponibles para {partySize} personas en esta zona.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availableTables.map(t => {
                        const isCircle = t.position?.shape === 'circle'
                        return (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTable(t)}
                            className={`p-5 rounded-2xl border-2 text-left transition ${
                              selectedTable?.id === t.id
                                ? 'border-black bg-black text-white'
                                : 'border-gray-200 hover:border-gray-400'
                            }`}
                          >
                            <div className={`w-10 h-10 border-2 mb-3 flex items-center justify-center text-sm font-bold ${isCircle ? 'rounded-full' : 'rounded-xl'} ${selectedTable?.id === t.id ? 'border-white/50 text-white' : 'border-gray-300 text-gray-700'}`}>
                              {t.number}
                            </div>
                            <p className="font-semibold">Mesa {t.number}</p>
                            <p className={`text-xs mt-0.5 ${selectedTable?.id === t.id ? 'text-white/70' : 'text-gray-400'}`}>
                              Hasta {t.seats} personas · {isCircle ? 'Redonda' : 'Cuadrada'}
                            </p>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* DATOS */}
              {step === 'datos' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Nombre completo *</label>
                    <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Juan Pérez"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Correo electrónico *</label>
                    <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="tu@email.com"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Teléfono</label>
                    <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+1 555 000 0000"
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Comentarios especiales</label>
                    <textarea value={form.comments} onChange={e => setForm(p => ({ ...p, comments: e.target.value }))}
                      rows={3} placeholder="Alergias, ocasión especial, silla para bebé..."
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" />
                  </div>
                </div>
              )}

              {/* CONFIRMACION */}
              {step === 'confirmacion' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
                    {[
                      { label: 'Restaurante', value: org.name, icon: ChefHat },
                      { label: 'Fecha', value: new Date(selectedDate + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), icon: Calendar },
                      { label: 'Hora', value: selectedTime, icon: Clock },
                      { label: 'Personas', value: String(partySize), icon: Users },
                      { label: 'Zona', value: selectedZone?.name ?? '', icon: LayoutGrid },
                      { label: 'Mesa', value: `Mesa ${selectedTable?.number}`, icon: LayoutGrid },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">{label}</p>
                          <p className="text-sm font-medium text-gray-900 capitalize">{value}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-200">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Cliente</p>
                        <p className="text-sm font-medium text-gray-900">{form.name} · {form.email}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    Al confirmar, aceptas nuestra política de cancelación. Cancela con al menos 2 horas de anticipación.
                  </p>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-black text-white rounded-2xl font-semibold hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2 text-base"
                  >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    Confirmar reserva
                  </button>
                </div>
              )}
            </div>

            {/* Navigation */}
            {step !== 'confirmacion' && (
              <div className="px-8 py-5 border-t border-gray-100 flex justify-between">
                <button
                  onClick={prevStep}
                  disabled={step === 'fecha'}
                  className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" /> Atrás
                </button>
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-30"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
