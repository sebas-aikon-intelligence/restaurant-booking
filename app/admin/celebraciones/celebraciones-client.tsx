'use client'

import { useState } from 'react'
import { PartyPopper, Plus, Trash2, X, Loader2, Edit2, Eye, EyeOff, GripVertical } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/ui/image-upload'

type Celebration = {
  id: string; org_id: string; name: string; description?: string
  emoji: string; image_url?: string; includes: string[]
  price?: number; is_active: boolean; sort_order: number
}

const EMOJIS = ['🎂','💍','🎓','🕯️','💼','🥂','🎉','🎊','❤️','🌹','🎁','🏆','✨','🍾','👶','🌟']

const EMPTY_FORM = { name: '', description: '', emoji: '🎉', includes: [''], price: '' }

export default function CelebracionesClient({
  celebrations: initial, orgId
}: {
  celebrations: Celebration[]
  orgId: string
}) {
  const [celebrations, setCelebrations] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem]   = useState<Celebration | null>(null)
  const [isSaving, setIsSaving]   = useState(false)
  const [imageUrl, setImageUrl]   = useState<string | null>(null)
  const [form, setForm]           = useState(EMPTY_FORM)

  const openCreate = () => {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setImageUrl(null)
    setShowModal(true)
  }

  const openEdit = (c: Celebration) => {
    setEditItem(c)
    setForm({
      name: c.name,
      description: c.description ?? '',
      emoji: c.emoji,
      includes: c.includes.length ? c.includes : [''],
      price: c.price?.toString() ?? '',
    })
    setImageUrl(c.image_url ?? null)
    setShowModal(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const supabase = createClient()
    const payload = {
      name: form.name,
      description: form.description || null,
      emoji: form.emoji,
      image_url: imageUrl || null,
      includes: form.includes.filter(Boolean),
      price: form.price ? parseFloat(form.price) : null,
    }

    if (editItem) {
      const { data } = await supabase.from('celebrations').update(payload).eq('id', editItem.id).select().single()
      if (data) setCelebrations(prev => prev.map(c => c.id === editItem.id ? data as Celebration : c))
    } else {
      const { data } = await supabase.from('celebrations').insert({
        ...payload, org_id: orgId, is_active: true, sort_order: celebrations.length
      }).select().single()
      if (data) setCelebrations(prev => [...prev, data as Celebration])
    }
    setShowModal(false)
    setIsSaving(false)
  }

  const toggleActive = async (c: Celebration) => {
    const supabase = createClient()
    await supabase.from('celebrations').update({ is_active: !c.is_active }).eq('id', c.id)
    setCelebrations(prev => prev.map(x => x.id === c.id ? { ...x, is_active: !x.is_active } : x))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta celebración?')) return
    const supabase = createClient()
    await supabase.from('celebrations').delete().eq('id', id)
    setCelebrations(prev => prev.filter(c => c.id !== id))
  }

  const updateInclude = (i: number, val: string) =>
    setForm(p => ({ ...p, includes: p.includes.map((x, j) => j === i ? val : x) }))

  const addInclude = () => setForm(p => ({ ...p, includes: [...p.includes, ''] }))

  const removeInclude = (i: number) =>
    setForm(p => ({ ...p, includes: p.includes.filter((_, j) => j !== i) }))

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <PartyPopper className="w-5 h-5 text-gray-700" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Celebraciones</h1>
            <p className="text-xs text-gray-400 mt-0.5">Paquetes especiales para ocasiones únicas: cumpleaños, aniversarios, graduaciones...</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
        >
          <Plus className="w-4 h-4" /> Nueva celebración
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-6 bg-gray-50">
        {celebrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <PartyPopper className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Sin celebraciones aún</p>
            <p className="text-sm">Crea paquetes especiales para que tus clientes puedan reservar con una ocasión especial.</p>
            <button onClick={openCreate} className="mt-4 px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition">
              Crear primera celebración
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {celebrations.map(c => (
              <div key={c.id} className={`bg-white rounded-2xl border border-gray-200 overflow-hidden transition ${!c.is_active ? 'opacity-50' : ''}`}>
                {/* Image */}
                <div className="aspect-[16/9] bg-gradient-to-br from-gray-100 to-gray-200 relative">
                  {c.image_url
                    ? <img src={c.image_url} alt={c.name} className="w-full h-full object-cover" />
                    : <div className="absolute inset-0 flex items-center justify-center text-5xl">{c.emoji}</div>
                  }
                  {/* Emoji badge */}
                  {c.image_url && (
                    <div className="absolute top-2 left-2 w-9 h-9 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center text-xl shadow-sm">
                      {c.emoji}
                    </div>
                  )}
                  {/* Active badge */}
                  <div className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.is_active ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{c.name}</h3>
                    {c.price && (
                      <span className="text-sm font-bold text-gray-900 flex-shrink-0">${c.price.toLocaleString('es')}</span>
                    )}
                  </div>
                  {c.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{c.description}</p>}

                  {/* Includes */}
                  {c.includes.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {c.includes.slice(0, 3).map((inc, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                          {inc}
                        </li>
                      ))}
                      {c.includes.length > 3 && (
                        <li className="text-xs text-gray-400">+{c.includes.length - 3} más incluidos...</li>
                      )}
                    </ul>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(c)} className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 transition">
                      <Edit2 className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button onClick={() => toggleActive(c)} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-50 transition" title={c.is_active ? 'Desactivar' : 'Activar'}>
                      {c.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-200 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-semibold text-gray-900">{editItem ? 'Editar celebración' : 'Nueva celebración'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-5 space-y-5">
              {/* Image upload */}
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                path={`${orgId}/celebrations/${editItem?.id ?? 'new-' + Date.now()}`}
                aspect="wide"
                label="Imagen de la celebración"
                hint="Recomendado: 1280×720px. Se muestra en la página de reservas."
              />

              {/* Emoji selector */}
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-gray-600">Emoji / Ícono</p>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map(e => (
                    <button
                      key={e} type="button"
                      onClick={() => setForm(p => ({ ...p, emoji: e }))}
                      className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center border-2 transition ${form.emoji === e ? 'border-black bg-gray-100' : 'border-transparent hover:bg-gray-50'}`}
                    >{e}</button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Nombre *</label>
                <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="ej. Cumpleaños, Aniversario..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="Describe brevemente esta celebración..."
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Precio adicional (opcional)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="number" min="0" step="0.01" value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <p className="text-xs text-gray-400">Costo adicional al menú regular. Déjalo vacío si está incluido.</p>
              </div>

              {/* Includes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600">¿Qué incluye?</label>
                  <button type="button" onClick={addInclude} className="text-xs text-gray-500 hover:text-black flex items-center gap-1 transition">
                    <Plus className="w-3 h-3" /> Añadir
                  </button>
                </div>
                {form.includes.map((inc, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={inc} onChange={e => updateInclude(i, e.target.value)}
                      placeholder={`ej. Decoración de mesa`}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                    {form.includes.length > 1 && (
                      <button type="button" onClick={() => removeInclude(i)} className="p-2 text-gray-300 hover:text-red-400 transition">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editItem ? 'Guardar cambios' : 'Crear celebración'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
