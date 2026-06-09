'use client'

import { useState } from 'react'
import { Sparkles, Plus, Trash2, X, Loader2, Edit2, Eye, EyeOff, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Event = {
  id: string; title: string; description?: string;
  event_date?: string; image_url?: string; is_active: boolean
}

export default function EventosClient({ events: initial, orgId }: { events: Event[]; orgId: string | null }) {
  const [events, setEvents] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [editEvent, setEditEvent] = useState<Event | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', event_date: '', image_url: '' })

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    setIsSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('events').insert({
      org_id: orgId,
      title: form.title,
      description: form.description || null,
      event_date: form.event_date || null,
      image_url: form.image_url || null,
      is_active: true
    }).select().single()
    if (data) setEvents(prev => [...prev, data])
    setShowModal(false)
    setForm({ title: '', description: '', event_date: '', image_url: '' })
    setIsSaving(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editEvent) return
    setIsSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('events').update({
      title: form.title,
      description: form.description || null,
      event_date: form.event_date || null,
      image_url: form.image_url || null,
    }).eq('id', editEvent.id).select().single()
    if (data) setEvents(prev => prev.map(ev => ev.id === editEvent.id ? data : ev))
    setEditEvent(null)
    setIsSaving(false)
  }

  const toggleActive = async (event: Event) => {
    const supabase = createClient()
    await supabase.from('events').update({ is_active: !event.is_active }).eq('id', event.id)
    setEvents(prev => prev.map(ev => ev.id === event.id ? { ...ev, is_active: !ev.is_active } : ev))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este evento?')) return
    const supabase = createClient()
    await supabase.from('events').delete().eq('id', id)
    setEvents(prev => prev.filter(ev => ev.id !== id))
  }

  const openEdit = (event: Event) => {
    setEditEvent(event)
    setForm({ title: event.title, description: event.description ?? '', event_date: event.event_date ?? '', image_url: event.image_url ?? '' })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-semibold text-gray-900">Eventos</h1>
          <span className="text-sm text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">{events.length}</span>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
          <Plus className="w-4 h-4" /> Nuevo evento
        </button>
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Sparkles className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium text-lg">Sin eventos</p>
            <p className="text-sm mb-4">Crea eventos especiales para destacarlos en el flujo de reservas.</p>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
              <Plus className="w-4 h-4" /> Crear primer evento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(ev => (
              <div key={ev.id} className={`bg-white rounded-2xl border border-gray-200 overflow-hidden transition hover:shadow-sm ${!ev.is_active ? 'opacity-60' : ''}`}>
                {ev.image_url ? (
                  <div className="h-40 bg-gray-100 overflow-hidden">
                    <img src={ev.image_url} alt={ev.title} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{ev.title}</h3>
                    <div className="flex gap-1 ml-2">
                      <button onClick={() => toggleActive(ev)} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400">
                        {ev.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => openEdit(ev)} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(ev.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {ev.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{ev.description}</p>}
                  {ev.event_date && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(ev.event_date + 'T12:00:00').toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                  )}
                  <div className={`mt-3 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ev.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {ev.is_active ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {(showModal || editEvent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold">{editEvent ? 'Editar Evento' : 'Nuevo Evento'}</h2>
              <button onClick={() => { setShowModal(false); setEditEvent(null) }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={editEvent ? handleUpdate : handleCreate} className="px-6 py-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Título *</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Ej. Cena de San Valentín"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Describe el evento..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Fecha del evento</label>
                  <input type="date" value={form.event_date} onChange={e => setForm(p => ({ ...p, event_date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">URL de imagen</label>
                  <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setEditEvent(null) }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editEvent ? 'Guardar' : 'Crear evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
