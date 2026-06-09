'use client'

import { useState } from 'react'
import { MessageSquare, Plus, X, Loader2, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Message = {
  id: string
  guest_name?: string
  guest_phone?: string
  content: string
  internal_note?: string
  status: 'new' | 'in_progress' | 'resolved'
  source: string
  created_at: string
  bookings?: { guest_name: string; booking_date: string; confirmation_code: string } | null
}

const STATUS_INFO = {
  new:         { label: 'Nuevo',      color: 'bg-blue-100 text-blue-700',   icon: AlertCircle },
  in_progress: { label: 'En proceso', color: 'bg-amber-100 text-amber-700', icon: Clock },
  resolved:    { label: 'Resuelto',   color: 'bg-green-100 text-green-700', icon: CheckCircle },
}

export default function MensajesClient({ messages: initial, orgId }: { messages: Message[]; orgId: string | null }) {
  const [messages, setMessages] = useState(initial)
  const [selected, setSelected] = useState<Message | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ guest_name: '', guest_phone: '', content: '' })
  const [isSaving, setIsSaving] = useState(false)
  const [note, setNote] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    setIsSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('messages').insert({
      org_id: orgId, ...form, source: 'manual'
    }).select().single()
    if (data) setMessages(prev => [data, ...prev])
    setShowModal(false)
    setForm({ guest_name: '', guest_phone: '', content: '' })
    setIsSaving(false)
  }

  const handleStatusChange = async (id: string, status: string) => {
    const supabase = createClient()
    await supabase.from('messages').update({ status }).eq('id', id)
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: status as Message['status'] } : m))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as Message['status'] } : prev)
  }

  const handleSaveNote = async () => {
    if (!selected) return
    const supabase = createClient()
    await supabase.from('messages').update({ internal_note: note }).eq('id', selected.id)
    setMessages(prev => prev.map(m => m.id === selected.id ? { ...m, internal_note: note } : m))
    setSelected(prev => prev ? { ...prev, internal_note: note } : prev)
  }

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="flex flex-col w-80 border-r border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-700" />
            <span className="font-semibold text-gray-900 text-sm">Mensajes</span>
            <span className="text-xs bg-gray-100 text-gray-500 px-2 rounded-full">{messages.filter(m => m.status === 'new').length} nuevos</span>
          </div>
          <button onClick={() => setShowModal(true)} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
              <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
              Sin mensajes aún
            </div>
          ) : (
            messages.map(m => {
              const st = STATUS_INFO[m.status]
              const Icon = st.icon
              return (
                <button
                  key={m.id}
                  onClick={() => { setSelected(m); setNote(m.internal_note ?? '') }}
                  className={`w-full text-left px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition ${selected?.id === m.id ? 'bg-gray-50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-medium text-gray-900 text-sm truncate">{m.guest_name || m.bookings?.guest_name || 'Cliente'}</p>
                    <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${st.color}`}>
                      <Icon className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{m.content}</p>
                  <p className="text-xs text-gray-300 mt-1">{new Date(m.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}</p>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right: detail */}
      <div className="flex-1 bg-gray-50">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm">Selecciona un mensaje para ver el detalle</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto p-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{selected.guest_name || 'Cliente desconocido'}</h2>
                  {selected.guest_phone && <p className="text-sm text-gray-500">{selected.guest_phone}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(selected.created_at).toLocaleString('es')}</p>
                </div>
                <div className="flex gap-2">
                  {Object.entries(STATUS_INFO).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => handleStatusChange(selected.id, key)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${selected.status === key ? val.color : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-gray-800 text-sm leading-relaxed">{selected.content}</p>
              </div>
              {selected.bookings && (
                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-medium text-blue-700">Reserva vinculada</p>
                  <p className="text-xs text-blue-600">{selected.bookings.guest_name} · {selected.bookings.booking_date} · #{selected.bookings.confirmation_code}</p>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Nota interna</h3>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={4}
                placeholder="Agrega observaciones internas..."
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none"
              />
              <button onClick={handleSaveNote} className="mt-3 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                Guardar nota
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New message modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold">Registrar Mensaje</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Nombre del cliente</label>
                <input value={form.guest_name} onChange={e => setForm(p => ({ ...p, guest_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Teléfono</label>
                <input value={form.guest_phone} onChange={e => setForm(p => ({ ...p, guest_phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Mensaje *</label>
                <textarea required value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
