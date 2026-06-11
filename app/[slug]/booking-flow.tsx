'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  ChevronLeft, ChevronRight, CheckCircle2, Loader2, MapPin,
  Clock, Users, Calendar, Phone, Mail, User, MessageSquare,
  Sparkles, Star, Wine, Heart, Briefcase, GraduationCap
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Org = {
  id: string; name: string; slug?: string; description?: string
  logo_url?: string; cover_url?: string; phone?: string; address?: string
  primary_color?: string
}
type Zone   = { id: string; name: string }
type Table  = { id: string; zone_id: string; number: string; seats: number; status: string; position?: { x: number; y: number; shape: 'rect' | 'circle' } | null }
type Event  = { id: string; title: string; description?: string; event_date?: string; image_url?: string }
type BusinessHour = { day_of_week: number; open_time?: string; close_time?: string; is_closed: boolean; booking_duration_minutes?: number }
type Celebration  = { id: string; name: string; emoji: string; description?: string; includes: string[]; price?: number; image_url?: string }

type Step = 'landing' | 'fecha' | 'hora' | 'personas' | 'ocasion' | 'zona' | 'mesa' | 'datos' | 'confirmacion' | 'exito'

const FLOW: Step[] = ['fecha', 'hora', 'personas', 'ocasion', 'zona', 'mesa', 'datos', 'confirmacion']

const OCCASIONS = [
  { id: 'birthday',    emoji: '🎂', label: 'Cumpleaños' },
  { id: 'anniversary', emoji: '💍', label: 'Aniversario' },
  { id: 'romantic',    emoji: '🕯️', label: 'Romántica' },
  { id: 'business',    emoji: '💼', label: 'Negocios' },
  { id: 'celebration', emoji: '🥂', label: 'Celebración' },
  { id: 'family',      emoji: '👨‍👩‍👧', label: 'Familiar' },
  { id: 'graduation',  emoji: '🎓', label: 'Graduación' },
  { id: 'none',        emoji: '🍽️', label: 'Sin ocasión' },
]

function generateTimeSlots(open: string, close: string, dur: number): string[] {
  const slots: string[] = []
  const [oh, om] = open.split(':').map(Number)
  let [ch, cm] = close.split(':').map(Number)
  if (ch === 0) { ch = 24; cm = 0 }
  let cur = oh * 60 + om
  const end = ch * 60 + cm - dur
  while (cur <= end) {
    slots.push(`${String(Math.floor(cur / 60)).padStart(2, '0')}:${String(cur % 60).padStart(2, '0')}`)
    cur += dur
  }
  return slots
}

// ─── Animations injected once ────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @keyframes fadeUp {
        from { opacity:0; transform:translateY(28px); }
        to   { opacity:1; transform:translateY(0); }
      }
      @keyframes fadeIn {
        from { opacity:0; } to { opacity:1; }
      }
      @keyframes scaleIn {
        from { opacity:0; transform:scale(.92); }
        to   { opacity:1; transform:scale(1); }
      }
      @keyframes glowPulse {
        0%,100% { box-shadow:0 0 18px rgba(251,191,36,.35); }
        50%     { box-shadow:0 0 40px rgba(251,191,36,.65), 0 0 80px rgba(251,191,36,.2); }
      }
      @keyframes orb {
        0%,100% { transform:translate(0,0) scale(1); }
        33%     { transform:translate(40px,-30px) scale(1.12); }
        66%     { transform:translate(-30px,20px) scale(.9); }
      }
      @keyframes ticker {
        from { transform:translateX(0); }
        to   { transform:translateX(-50%); }
      }
      @keyframes confetti {
        0%   { transform:translateY(-10px) rotate(0deg); opacity:1; }
        100% { transform:translateY(100vh) rotate(720deg); opacity:0; }
      }
      .step-enter { animation:fadeUp .5s cubic-bezier(.22,1,.36,1) both; }
      .step-enter-slow { animation:fadeUp .7s cubic-bezier(.22,1,.36,1) both; }
      .fade-in  { animation:fadeIn .4s ease both; }
      .scale-in { animation:scaleIn .45s cubic-bezier(.22,1,.36,1) both; }
      .glow-gold { animation:glowPulse 2.5s ease-in-out infinite; }
      .orb { animation:orb 8s ease-in-out infinite; }
      .glass {
        background:rgba(255,255,255,.06);
        backdrop-filter:blur(22px) saturate(1.4);
        border:1px solid rgba(255,255,255,.1);
      }
      .glass-sm {
        background:rgba(255,255,255,.04);
        backdrop-filter:blur(12px);
        border:1px solid rgba(255,255,255,.08);
      }
      .gold-gradient {
        background:linear-gradient(135deg,#F59E0B,#FCD34D,#D97706);
        -webkit-background-clip:text;
        -webkit-text-fill-color:transparent;
        background-clip:text;
      }
      .gold-btn {
        background:linear-gradient(135deg,#D97706,#F59E0B,#FCD34D,#F59E0B);
        background-size:200% auto;
        transition:background-position .5s ease,transform .2s,box-shadow .3s;
        box-shadow:0 4px 30px rgba(245,158,11,.4);
      }
      .gold-btn:hover {
        background-position:right center;
        transform:translateY(-1px);
        box-shadow:0 8px 40px rgba(245,158,11,.55);
      }
      .gold-btn:active { transform:translateY(0); }
      .ticker-wrap { overflow:hidden; }
      .ticker { animation:ticker 25s linear infinite; white-space:nowrap; }
      .table-available { border-color:rgba(52,211,153,.5); }
      .table-available:hover { border-color:#34D399; box-shadow:0 0 20px rgba(52,211,153,.35); }
      .table-selected { border-color:#F59E0B!important; box-shadow:0 0 28px rgba(245,158,11,.5)!important; background:rgba(245,158,11,.12)!important; }
      .table-occupied { opacity:.35; pointer-events:none; }
      .occasion-selected { border-color:rgba(251,191,36,.7)!important; background:rgba(251,191,36,.1)!important; box-shadow:0 0 20px rgba(251,191,36,.25); }
      .conf-particle {
        position:fixed; top:-20px; pointer-events:none;
        animation:confetti 3s ease-in forwards;
        font-size:1.4rem;
      }
    `}</style>
  )
}

// ─── Confetti particles ───────────────────────────────────────────────────────
function Confetti() {
  const particles = useMemo(() => {
    const emojis = ['🎉','⭐','✨','🎊','💫','🥂','🎈','🌟']
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      emoji: emojis[i % emojis.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      dur: `${2 + Math.random() * 2}s`,
    }))
  }, [])
  return (
    <>
      {particles.map(p => (
        <span
          key={p.id}
          className="conf-particle"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.dur }}
        >{p.emoji}</span>
      ))}
    </>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BookingFlow({
  org, zones, tables, events, businessHours, celebrations
}: {
  org: Org; zones: Zone[]; tables: Table[]; events: Event[]; businessHours: BusinessHour[]; celebrations: Celebration[]
}) {
  const [step, setStep]                   = useState<Step>('landing')
  const [selectedDate, setSelectedDate]   = useState('')
  const [selectedTime, setSelectedTime]   = useState('')
  const [partySize, setPartySize]         = useState(2)
  const [occasion, setOccasion]           = useState('')
  const [selectedEvent, setSelectedEvent]             = useState<Event | null>(null)
  const [selectedCelebration, setSelectedCelebration] = useState<Celebration | null>(null)
  const [selectedZone, setSelectedZone]   = useState<Zone | null>(null)
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [form, setForm]                   = useState({ name: '', email: '', phone: '', comments: '' })
  const [isSubmitting, setIsSubmitting]   = useState(false)
  const [confirmCode, setConfirmCode]     = useState('')
  const [calMonth, setCalMonth]           = useState(new Date())
  const [stepKey, setStepKey]             = useState(0) // forces re-animation

  const accent = org.primary_color ?? '#F59E0B'
  const today  = new Date(); today.setHours(0,0,0,0)

  const getDOW = (d: string) => new Date(d + 'T12:00:00').getDay()

  const isDateDisabled = useCallback((d: string) => {
    if (new Date(d + 'T12:00:00') < today) return true
    const h = businessHours.find(h => h.day_of_week === getDOW(d))
    return h?.is_closed ?? false
  }, [businessHours, today])

  const timeSlots = useMemo(() => {
    if (!selectedDate) return []
    const h = businessHours.find(h => h.day_of_week === getDOW(selectedDate))
    if (!h || h.is_closed || !h.open_time || !h.close_time) return []
    return generateTimeSlots(h.open_time, h.close_time, h.booking_duration_minutes ?? 90)
  }, [selectedDate, businessHours])

  const calDays = useMemo(() => {
    const y = calMonth.getFullYear(), m = calMonth.getMonth()
    const first = new Date(y, m, 1).getDay()
    const days  = new Date(y, m + 1, 0).getDate()
    const cells: (string | null)[] = Array(first).fill(null)
    for (let d = 1; d <= days; d++) {
      cells.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    }
    return cells
  }, [calMonth])

  const availableTables = useMemo(() =>
    tables.filter(t => (!selectedZone || t.zone_id === selectedZone.id) && t.seats >= partySize),
  [tables, selectedZone, partySize])

  // Grid positions — assign auto positions if none defined
  const tablePositions = useMemo(() => {
    const grouped: Record<string, Table[]> = {}
    for (const t of availableTables) {
      if (!grouped[t.zone_id]) grouped[t.zone_id] = []
      grouped[t.zone_id].push(t)
    }
    return grouped
  }, [availableTables])

  const canProceed = () => {
    if (step === 'fecha')       return !!selectedDate
    if (step === 'hora')        return !!selectedTime
    if (step === 'personas')    return partySize >= 1
    if (step === 'ocasion')     return !!occasion
    if (step === 'zona')        return !!selectedZone
    if (step === 'mesa')        return !!selectedTable
    if (step === 'datos')       return !!form.name && !!form.email
    return true
  }

  const goTo = (s: Step) => { setStep(s); setStepKey(k => k + 1) }
  const next  = () => { const i = FLOW.indexOf(step); if (i < FLOW.length - 1) goTo(FLOW[i + 1]) }
  const prev  = () => { const i = FLOW.indexOf(step); if (i > 0) goTo(FLOW[i - 1]); else goTo('landing') }

  const handleSubmit = async () => {
    if (!selectedTable || !selectedZone) return
    setIsSubmitting(true)
    const supabase = createClient()
    const { data, error } = await supabase.from('bookings').insert({
      org_id:         org.id,
      zone_id:        selectedZone.id,
      table_id:       selectedTable.id,
      guest_name:     form.name,
      guest_email:    form.email,
      guest_phone:    form.phone || null,
      guest_comments: [form.comments, occasion && occasion !== 'none' ? `Ocasión: ${selectedCelebration?.name ?? OCCASIONS.find(o => o.id === occasion)?.label}` : '', selectedEvent ? `Evento: ${selectedEvent.title}` : ''].filter(Boolean).join(' | ') || null,
      booking_date:   selectedDate,
      booking_time:   selectedTime,
      party_size:     partySize,
      status:         'pending',
    }).select('confirmation_code').single()
    if (!error && data) { setConfirmCode(data.confirmation_code); goTo('exito') }
    setIsSubmitting(false)
  }

  const stepIdx   = FLOW.indexOf(step)
  const progress  = step === 'landing' ? 0 : ((stepIdx + 1) / FLOW.length) * 100

  // ── STEP LABELS ─────────────────────────────────────────────────────────────
  const STEP_LABELS: Record<Step, string> = {
    landing:      'Bienvenido',
    fecha:        'Elige tu fecha',
    hora:         'Selecciona el horario',
    personas:     '¿Cuántos son?',
    ocasion:      '¿Cuál es la ocasión?',
    zona:         'Elige tu zona',
    mesa:         'Selecciona tu mesa',
    datos:        'Tus datos',
    confirmacion: 'Confirmar reserva',
    exito:        '¡Reserva lista!',
  }

  // ── BACKGROUND ──────────────────────────────────────────────────────────────
  const bgStyle = org.cover_url
    ? { backgroundImage: `url(${org.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#080808]" style={bgStyle}>
      <GlobalStyles />

      {/* BG overlay + blur */}
      {org.cover_url && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" style={{ zIndex: 0 }} />
      )}

      {/* Ambient orbs */}
      {!org.cover_url && (
        <>
          <div className="orb fixed w-[500px] h-[500px] rounded-full opacity-[0.07] blur-[120px] bg-amber-500 -top-40 -left-32 pointer-events-none" style={{ zIndex: 0 }} />
          <div className="orb fixed w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[100px] bg-orange-600 bottom-0 right-0 pointer-events-none" style={{ zIndex: 0, animationDelay: '-4s' }} />
          <div className="orb fixed w-[300px] h-[300px] rounded-full opacity-[0.04] blur-[80px] bg-amber-300 top-1/2 left-1/2 pointer-events-none" style={{ zIndex: 0, animationDelay: '-2s' }} />
        </>
      )}

      {/* Progress bar */}
      {step !== 'landing' && step !== 'exito' && (
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/10 z-50">
          <div
            className="h-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${accent}, #FCD34D)` }}
          />
        </div>
      )}

      {/* Events ticker */}
      {events.length > 0 && step !== 'exito' && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500/10 backdrop-blur-sm border-b border-amber-500/20 z-40 overflow-hidden h-7 flex items-center">
          <div className="ticker flex gap-16">
            {[...events, ...events].map((ev, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-amber-300 text-[11px] font-medium tracking-wide">
                <Sparkles className="w-3 h-3 flex-shrink-0" />
                {ev.title}
                {ev.event_date && <span className="text-amber-500/70">· {new Date(ev.event_date + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span>}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── LANDING ─────────────────────────────────────────────────────────── */}
      {step === 'landing' && (
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-12 pb-24">
          <div className="text-center max-w-xl mx-auto">
            {org.logo_url && (
              <div className="fade-in mb-8 flex justify-center" style={{ animationDelay: '0s' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={org.logo_url} alt={org.name} className="w-20 h-20 rounded-2xl object-cover shadow-2xl ring-2 ring-white/10" />
              </div>
            )}

            <div className="step-enter" style={{ animationDelay: '.05s' }}>
              <p className="text-xs uppercase tracking-[.25em] text-amber-400 font-medium mb-3 fade-in">Reserva tu mesa</p>
            </div>

            <h1 className="step-enter text-5xl sm:text-7xl font-black tracking-tight text-white leading-none mb-4" style={{ animationDelay: '.1s' }}>
              {org.name}
            </h1>

            {org.description && (
              <p className="step-enter text-white/60 text-lg leading-relaxed mb-3 max-w-md mx-auto" style={{ animationDelay: '.18s' }}>
                {org.description}
              </p>
            )}

            {org.address && (
              <p className="step-enter flex items-center justify-center gap-1.5 text-white/40 text-sm mb-10" style={{ animationDelay: '.24s' }}>
                <MapPin className="w-3.5 h-3.5" />{org.address}
              </p>
            )}

            <div className="step-enter" style={{ animationDelay: '.3s' }}>
              <button
                onClick={() => goTo('fecha')}
                className="gold-btn inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-black font-bold text-lg"
              >
                <Calendar className="w-5 h-5" />
                Hacer mi reserva
              </button>
            </div>

            {/* Quick info pills */}
            <div className="step-enter flex flex-wrap items-center justify-center gap-3 mt-10" style={{ animationDelay: '.38s' }}>
              {businessHours.filter(h => !h.is_closed).length > 0 && (
                <span className="glass-sm inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/60">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {businessHours.filter(h => !h.is_closed).length} días a la semana
                </span>
              )}
              {zones.length > 0 && (
                <span className="glass-sm inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/60">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  {zones.length} zonas disponibles
                </span>
              )}
              {events.length > 0 && (
                <span className="glass-sm inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/60">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {events.length} evento{events.length !== 1 ? 's' : ''} próximo{events.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── BOOKING STEPS ───────────────────────────────────────────────────── */}
      {step !== 'landing' && step !== 'exito' && (
        <div className="relative z-10 min-h-screen flex flex-col" style={{ paddingTop: events.length > 0 ? '28px' : '0' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <button
              onClick={prev}
              className="glass-sm p-2.5 rounded-xl text-white/60 hover:text-white transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-[.2em] text-white/40 font-medium">{org.name}</p>
              <p className="text-white font-semibold text-sm">{STEP_LABELS[step]}</p>
            </div>
            <div className="w-10 h-10 flex items-center justify-center">
              <span className="text-xs text-white/30 font-mono">{stepIdx + 1}/{FLOW.length}</span>
            </div>
          </div>

          {/* Step content */}
          <div key={stepKey} className="flex-1 flex flex-col items-center justify-center px-4 pb-32">
            <div className="w-full max-w-xl step-enter">

              {/* ── FECHA ─────────────────────────────────────────── */}
              {step === 'fecha' && (
                <div className="glass rounded-3xl p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => { const d = new Date(calMonth); d.setMonth(d.getMonth() - 1); setCalMonth(d) }}
                      className="w-9 h-9 rounded-xl glass-sm flex items-center justify-center text-white/60 hover:text-white transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-white font-semibold capitalize text-lg">
                      {calMonth.toLocaleDateString('es', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => { const d = new Date(calMonth); d.setMonth(d.getMonth() + 1); setCalMonth(d) }}
                      className="w-9 h-9 rounded-xl glass-sm flex items-center justify-center text-white/60 hover:text-white transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d => (
                      <div key={d} className="text-center text-[11px] text-white/30 font-medium py-2">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calDays.map((day, i) => {
                      if (!day) return <div key={i} />
                      const disabled = isDateDisabled(day)
                      const active   = selectedDate === day
                      const isToday  = day === new Date().toISOString().split('T')[0]
                      return (
                        <button
                          key={day}
                          disabled={disabled}
                          onClick={() => { setSelectedDate(day); setSelectedTime('') }}
                          className={`relative py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            active
                              ? 'text-black font-bold scale-105'
                              : disabled
                              ? 'text-white/15 cursor-not-allowed'
                              : 'text-white/80 hover:bg-white/10'
                          }`}
                          style={active ? { background: `linear-gradient(135deg, ${accent}, #FCD34D)`, boxShadow: `0 4px 20px ${accent}55` } : {}}
                        >
                          {parseInt(day.split('-')[2])}
                          {isToday && !active && (
                            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                  {selectedDate && (
                    <div className="mt-5 pt-4 border-t border-white/10 text-center">
                      <p className="text-amber-400 text-sm font-medium capitalize">
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── HORA ──────────────────────────────────────────── */}
              {step === 'hora' && (
                <div>
                  {timeSlots.length === 0 ? (
                    <div className="glass rounded-3xl p-12 text-center">
                      <Clock className="w-12 h-12 mx-auto mb-4 text-white/20" />
                      <p className="text-white/60">No hay horarios disponibles para este día.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {timeSlots.map((slot, i) => {
                        const active = selectedTime === slot
                        return (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className="scale-in py-4 rounded-2xl text-sm font-semibold transition-all duration-200 glass-sm text-white/70 hover:text-white hover:bg-white/10"
                            style={{
                              animationDelay: `${i * 0.03}s`,
                              ...(active ? {
                                background: `linear-gradient(135deg, ${accent}33, ${accent}22)`,
                                borderColor: accent,
                                color: accent,
                                boxShadow: `0 0 24px ${accent}44`,
                              } : {})
                            }}
                          >
                            {slot}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── PERSONAS ──────────────────────────────────────── */}
              {step === 'personas' && (
                <div className="glass rounded-3xl p-10 flex flex-col items-center gap-8">
                  <div className="flex items-center gap-10">
                    <button
                      onClick={() => setPartySize(p => Math.max(1, p - 1))}
                      className="w-16 h-16 rounded-2xl glass-sm flex items-center justify-center text-3xl text-white/60 hover:text-white hover:bg-white/10 transition font-light"
                    >−</button>
                    <div className="text-center min-w-[100px]">
                      <p className="text-8xl font-black text-white leading-none transition-all">{partySize}</p>
                      <p className="text-white/40 text-sm mt-2">{partySize === 1 ? 'persona' : 'personas'}</p>
                    </div>
                    <button
                      onClick={() => setPartySize(p => Math.min(20, p + 1))}
                      className="w-16 h-16 rounded-2xl glass-sm flex items-center justify-center text-3xl text-white/60 hover:text-white hover:bg-white/10 transition font-light"
                    >+</button>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[1,2,3,4,5,6,8,10,12].map(n => (
                      <button
                        key={n}
                        onClick={() => setPartySize(n)}
                        className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
                        style={partySize === n ? {
                          background: `linear-gradient(135deg, ${accent}, #FCD34D)`,
                          color: '#000',
                        } : { background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.5)', border: '1px solid rgba(255,255,255,.1)' }}
                      >{n}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── OCASION ───────────────────────────────────────── */}
              {step === 'ocasion' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {OCCASIONS.map((oc, i) => {
                      const active = occasion === oc.id
                      return (
                        <button
                          key={oc.id}
                          onClick={() => setOccasion(oc.id)}
                          className={`scale-in glass-sm rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${active ? 'occasion-selected' : 'hover:bg-white/10'}`}
                          style={{ animationDelay: `${i * 0.04}s` }}
                        >
                          <span className="text-3xl">{oc.emoji}</span>
                          <span className={`text-xs font-medium ${active ? 'text-amber-300' : 'text-white/60'}`}>{oc.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  {celebrations.length > 0 && (
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-3">Paquetes de celebración</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {celebrations.map((cel, i) => {
                          const active = selectedCelebration?.id === cel.id
                          return (
                            <button
                              key={cel.id}
                              onClick={() => {
                                setSelectedCelebration(active ? null : cel)
                                if (!active) setOccasion(cel.id)
                                else setOccasion('')
                              }}
                              className={`scale-in glass-sm rounded-2xl p-4 flex items-center gap-3 text-left transition-all ${active ? 'occasion-selected' : 'hover:bg-white/10'}`}
                              style={{ animationDelay: `${i * 0.05}s` }}
                            >
                              {cel.image_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={cel.image_url} alt={cel.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-2xl">
                                  {cel.emoji}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm ${active ? 'text-amber-300' : 'text-white/80'}`}>{cel.name}</p>
                                {cel.price ? (
                                  <p className="text-xs text-white/40 mt-0.5">+${cel.price.toLocaleString('es')}</p>
                                ) : (
                                  <p className="text-xs text-white/30 mt-0.5">Incluido</p>
                                )}
                              </div>
                              {active && <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {events.length > 0 && (
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-3">O únete a un evento especial</p>
                      <div className="space-y-2">
                        {events.map((ev, i) => {
                          const active = selectedEvent?.id === ev.id
                          return (
                            <button
                              key={ev.id}
                              onClick={() => {
                                setSelectedEvent(active ? null : ev)
                                if (!active) setOccasion('celebration')
                              }}
                              className={`scale-in w-full glass-sm rounded-2xl px-5 py-4 flex items-center gap-4 text-left transition-all ${active ? 'occasion-selected' : 'hover:bg-white/10'}`}
                              style={{ animationDelay: `${i * 0.05 + 0.3}s` }}
                            >
                              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-sm ${active ? 'text-amber-300' : 'text-white/80'}`}>{ev.title}</p>
                                {ev.event_date && (
                                  <p className="text-xs text-white/40 mt-0.5">
                                    {new Date(ev.event_date + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                                  </p>
                                )}
                              </div>
                              {active && <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── ZONA ──────────────────────────────────────────── */}
              {step === 'zona' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {zones.length === 0 ? (
                    <div className="col-span-2 glass rounded-3xl p-10 text-center text-white/40">Sin zonas configuradas</div>
                  ) : zones.map((z, i) => {
                    const count  = tables.filter(t => t.zone_id === z.id && t.seats >= partySize && t.status === 'available').length
                    const active = selectedZone?.id === z.id
                    const icons  = ['🏛️','🌿','⭐','🍸','🌙','🎭']
                    return (
                      <button
                        key={z.id}
                        onClick={() => { setSelectedZone(z); setSelectedTable(null) }}
                        disabled={count === 0}
                        className={`scale-in glass-sm rounded-3xl p-6 text-left transition-all duration-300 ${count === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white/10'} ${active ? 'occasion-selected' : ''}`}
                        style={{ animationDelay: `${i * 0.08}s` }}
                      >
                        <div className="text-4xl mb-4">{icons[i % icons.length]}</div>
                        <p className={`font-bold text-lg ${active ? 'text-amber-300' : 'text-white'}`}>{z.name}</p>
                        <p className={`text-sm mt-1 ${active ? 'text-amber-400/70' : 'text-white/40'}`}>
                          {count > 0 ? `${count} mesa${count !== 1 ? 's' : ''} disponible${count !== 1 ? 's' : ''}` : 'Sin disponibilidad'}
                        </p>
                        {active && (
                          <div className="mt-3 flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                            <CheckCircle2 className="w-4 h-4" /> Seleccionada
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* ── MESA ──────────────────────────────────────────── */}
              {step === 'mesa' && (
                <div>
                  {availableTables.length === 0 ? (
                    <div className="glass rounded-3xl p-12 text-center">
                      <p className="text-white/40">No hay mesas disponibles para {partySize} personas en esta zona.</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-4 text-center">
                        Plano de {selectedZone?.name}
                      </p>
                      {/* Visual floor plan */}
                      <div className="glass rounded-3xl p-6 relative min-h-[300px]">
                        {/* Floor texture hint */}
                        <div className="absolute inset-6 rounded-2xl bg-white/[0.02] border border-white/5" />
                        <div className="relative grid grid-cols-3 sm:grid-cols-4 gap-4 p-4">
                          {availableTables.map((t, i) => {
                            const isOccupied  = t.status === 'occupied' || t.status === 'reserved' || t.status === 'blocked'
                            const isSelected  = selectedTable?.id === t.id
                            const isCircle    = t.position?.shape === 'circle'
                            return (
                              <button
                                key={t.id}
                                disabled={isOccupied}
                                onClick={() => setSelectedTable(t)}
                                className={`scale-in flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200 ${
                                  isOccupied
                                    ? 'table-occupied border-white/10'
                                    : isSelected
                                    ? 'table-selected'
                                    : 'table-available border-white/10 hover:border-emerald-400/50'
                                }`}
                                style={{ animationDelay: `${i * 0.04}s` }}
                              >
                                <div className={`w-14 h-14 border-2 flex items-center justify-center font-bold text-lg transition-all ${
                                  isCircle ? 'rounded-full' : 'rounded-xl'
                                } ${
                                  isOccupied   ? 'border-white/10 text-white/20' :
                                  isSelected   ? 'border-amber-400 text-amber-400' :
                                               'border-emerald-400/40 text-emerald-300'
                                }`}>
                                  {t.number}
                                </div>
                                <div className="text-center">
                                  <p className={`text-[11px] font-semibold ${isSelected ? 'text-amber-300' : isOccupied ? 'text-white/20' : 'text-white/60'}`}>
                                    Mesa {t.number}
                                  </p>
                                  <p className={`text-[10px] ${isOccupied ? 'text-white/15' : 'text-white/30'}`}>
                                    {isOccupied ? 'Ocupada' : `${t.seats} pers.`}
                                  </p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        {/* Legend */}
                        <div className="flex items-center justify-center gap-5 mt-4 pt-4 border-t border-white/5">
                          <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                            <span className="w-3 h-3 rounded-full border border-emerald-400/50" />Disponible
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                            <span className="w-3 h-3 rounded-full border border-amber-400" />Seleccionada
                          </span>
                          <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                            <span className="w-3 h-3 rounded-full border border-white/10" />Ocupada
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── DATOS ─────────────────────────────────────────── */}
              {step === 'datos' && (
                <div className="glass rounded-3xl p-8 space-y-5">
                  {[
                    { key: 'name',  type: 'text',  label: 'Nombre completo', icon: User,         placeholder: 'María García', required: true },
                    { key: 'email', type: 'email', label: 'Correo electrónico', icon: Mail,       placeholder: 'maria@email.com', required: true },
                    { key: 'phone', type: 'tel',   label: 'Teléfono (opcional)', icon: Phone,     placeholder: '+52 55 1234 5678', required: false },
                  ].map(({ key, type, label, icon: Icon, placeholder, required }) => (
                    <div key={key} className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                        <Icon className="w-4 h-4" />
                      </div>
                      <input
                        type={type}
                        required={required}
                        value={form[key as keyof typeof form]}
                        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition"
                      />
                    </div>
                  ))}
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-white/30" />
                    <textarea
                      value={form.comments}
                      onChange={e => setForm(p => ({ ...p, comments: e.target.value }))}
                      rows={3}
                      placeholder="Algo que debamos saber: alergias, silla para bebé, decoración especial..."
                      className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/25 text-sm focus:outline-none focus:border-amber-500/50 transition resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ── CONFIRMACION ──────────────────────────────────── */}
              {step === 'confirmacion' && (
                <div className="space-y-4">
                  {/* Ticket */}
                  <div className="glass rounded-3xl overflow-hidden">
                    <div className="px-6 py-5" style={{ background: `linear-gradient(135deg, ${accent}22, transparent)` }}>
                      <p className="text-xs uppercase tracking-widest text-amber-400 font-medium mb-1">Tu reserva en</p>
                      <p className="text-white font-bold text-xl">{org.name}</p>
                    </div>
                    {/* Perforated divider */}
                    <div className="relative h-5 flex items-center">
                      <div className="absolute left-0 w-4 h-4 rounded-full bg-[#080808]" style={{ left: '-8px' }} />
                      <div className="flex-1 border-t border-dashed border-white/10 mx-6" />
                      <div className="absolute right-0 w-4 h-4 rounded-full bg-[#080808]" style={{ right: '-8px' }} />
                    </div>
                    <div className="px-6 py-5 space-y-3">
                      {[
                        { label: 'Fecha',    value: new Date(selectedDate + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), icon: Calendar },
                        { label: 'Hora',     value: selectedTime, icon: Clock },
                        { label: 'Personas', value: `${partySize} ${partySize === 1 ? 'persona' : 'personas'}`, icon: Users },
                        { label: 'Zona',     value: selectedZone?.name ?? '', icon: Star },
                        { label: 'Mesa',     value: `Mesa ${selectedTable?.number}`, icon: MapPin },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-amber-400/60 flex-shrink-0" />
                          <span className="text-white/40 text-sm w-20">{label}</span>
                          <span className="text-white text-sm font-medium capitalize flex-1 text-right">{value}</span>
                        </div>
                      ))}
                      {(occasion && occasion !== 'none') && (
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {selectedCelebration?.emoji ?? OCCASIONS.find(o => o.id === occasion)?.emoji}
                          </span>
                          <span className="text-white/40 text-sm w-20">Ocasión</span>
                          <span className="text-amber-300 text-sm font-medium flex-1 text-right">
                            {selectedCelebration?.name ?? OCCASIONS.find(o => o.id === occasion)?.label}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                        <User className="w-4 h-4 text-amber-400/60 flex-shrink-0" />
                        <span className="text-white/40 text-sm w-20">Cliente</span>
                        <div className="flex-1 text-right">
                          <p className="text-white text-sm font-medium">{form.name}</p>
                          <p className="text-white/40 text-xs">{form.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-white/25 text-center px-4">
                    Al confirmar aceptas nuestra política de cancelación. Cancela hasta 2 horas antes sin cargo.
                  </p>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="gold-btn w-full py-5 rounded-2xl font-bold text-black text-base flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    {isSubmitting ? 'Procesando...' : 'Confirmar mi reserva'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── BOTTOM NAV ──────────────────────────────────────────────────── */}
          {step !== 'confirmacion' && (
            <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-3" style={{ background: 'linear-gradient(to top, rgba(8,8,8,.95) 60%, transparent)' }}>
              {/* Dots */}
              <div className="flex justify-center gap-1.5 mb-4">
                {FLOW.slice(0, -1).map((s, i) => (
                  <div
                    key={s}
                    className="h-1 rounded-full transition-all duration-300"
                    style={{
                      width: step === s ? '24px' : '6px',
                      background: i <= stepIdx ? `linear-gradient(90deg, ${accent}, #FCD34D)` : 'rgba(255,255,255,.15)',
                    }}
                  />
                ))}
              </div>
              <button
                onClick={next}
                disabled={!canProceed()}
                className="gold-btn w-full py-4 rounded-2xl font-bold text-black flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed text-base"
              >
                {step === 'datos' ? 'Revisar reserva' : 'Continuar'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── SUCCESS ─────────────────────────────────────────────────────────── */}
      {step === 'exito' && (
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
          <Confetti />
          <div className="w-full max-w-md step-enter-slow text-center">
            {/* Glow ring */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full glow-gold" style={{ background: `${accent}22` }} />
              <div className="absolute inset-2 rounded-full" style={{ background: `${accent}15`, backdropFilter: 'blur(12px)' }} />
              <CheckCircle2 className="absolute inset-0 m-auto w-12 h-12" style={{ color: accent }} />
            </div>

            <p className="text-xs uppercase tracking-[.3em] text-amber-400 font-medium mb-3">¡Todo listo!</p>
            <h2 className="text-4xl font-black text-white mb-3">Reserva<br/>Confirmada</h2>
            <p className="text-white/50 mb-8">Te enviaremos los detalles a <strong className="text-white/70">{form.email}</strong></p>

            {/* Code */}
            <div className="glass rounded-3xl p-6 mb-6">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Código de reserva</p>
              <p className="text-5xl font-black font-mono tracking-[.15em]" style={{ color: accent }}>{confirmCode}</p>
              <p className="text-white/30 text-xs mt-2">Preséntalo al llegar al restaurante</p>
            </div>

            {/* Summary */}
            <div className="glass-sm rounded-2xl p-5 text-left space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Restaurante</span>
                <span className="text-white font-medium">{org.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Fecha</span>
                <span className="text-white font-medium capitalize">
                  {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'long' })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Hora</span>
                <span className="text-white font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Personas</span>
                <span className="text-white font-medium">{partySize}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Mesa</span>
                <span className="text-white font-medium">{selectedZone?.name} · Mesa {selectedTable?.number}</span>
              </div>
            </div>

            <button
              onClick={() => { goTo('landing'); setSelectedDate(''); setSelectedTime(''); setPartySize(2); setOccasion(''); setSelectedEvent(null); setSelectedZone(null); setSelectedTable(null); setForm({ name:'', email:'', phone:'', comments:'' }) }}
              className="text-white/30 hover:text-white/60 text-sm transition"
            >
              Hacer otra reserva
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
