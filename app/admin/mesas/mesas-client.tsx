'use client'

import { useState } from 'react'
import { LayoutGrid, Plus, Trash2, X, Loader2, Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Zone = { id: string; name: string; org_id: string }
type Table = {
  id: string; org_id: string; zone_id: string; number: string; seats: number;
  status: string; image_url?: string;
  position?: { x: number; y: number; shape: 'rect' | 'circle' }
}

const ZONE_PRESETS = ['Interior', 'Terraza', 'Exterior', 'Jardín', 'VIP', 'Barra']
const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 border-green-300 text-green-800',
  reserved:  'bg-amber-100 border-amber-300 text-amber-800',
  occupied:  'bg-red-100 border-red-300 text-red-800',
  blocked:   'bg-gray-200 border-gray-300 text-gray-600',
  out_of_service: 'bg-gray-100 border-gray-200 text-gray-400',
}

export default function MesasClient({
  zones: initialZones,
  tables: initialTables,
  orgId
}: {
  zones: Zone[]
  tables: Table[]
  orgId: string | null
}) {
  const [zones, setZones] = useState(initialZones)
  const [tables, setTables] = useState(initialTables)
  const [activeZone, setActiveZone] = useState<string | null>(initialZones[0]?.id ?? null)
  const [showZoneModal, setShowZoneModal] = useState(false)
  const [showTableModal, setShowTableModal] = useState(false)
  const [editTable, setEditTable] = useState<Table | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [zoneForm, setZoneForm] = useState({ name: '' })
  const [tableForm, setTableForm] = useState({ number: '', seats: '4', status: 'available', shape: 'rect' as 'rect' | 'circle' })

  const zoneTables = tables.filter(t => t.zone_id === activeZone)

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    setIsSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('zones').insert({ org_id: orgId, name: zoneForm.name }).select().single()
    if (data) {
      setZones(prev => [...prev, data])
      setActiveZone(data.id)
    }
    setShowZoneModal(false)
    setZoneForm({ name: '' })
    setIsSaving(false)
  }

  const handleDeleteZone = async (id: string) => {
    if (!confirm('¿Eliminar esta zona? También se eliminarán sus mesas.')) return
    const supabase = createClient()
    await supabase.from('zones').delete().eq('id', id)
    setZones(prev => prev.filter(z => z.id !== id))
    setTables(prev => prev.filter(t => t.zone_id !== id))
    if (activeZone === id) setActiveZone(zones.find(z => z.id !== id)?.id ?? null)
  }

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId || !activeZone) return
    setIsSaving(true)
    const supabase = createClient()
    const payload = {
      org_id: orgId,
      zone_id: activeZone,
      number: tableForm.number,
      seats: parseInt(tableForm.seats),
      status: tableForm.status,
      position: { x: Math.floor(Math.random() * 400), y: Math.floor(Math.random() * 300), shape: tableForm.shape, rotation: 0 }
    }
    const { data } = await supabase.from('tables').insert(payload).select().single()
    if (data) setTables(prev => [...prev, data])
    setShowTableModal(false)
    setTableForm({ number: '', seats: '4', status: 'available', shape: 'rect' })
    setIsSaving(false)
  }

  const handleUpdateTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTable) return
    setIsSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('tables')
      .update({ number: tableForm.number, seats: parseInt(tableForm.seats), status: tableForm.status })
      .eq('id', editTable.id)
      .select().single()
    if (data) setTables(prev => prev.map(t => t.id === editTable.id ? data : t))
    setEditTable(null)
    setIsSaving(false)
  }

  const handleDeleteTable = async (id: string) => {
    if (!confirm('¿Eliminar esta mesa?')) return
    const supabase = createClient()
    await supabase.from('tables').delete().eq('id', id)
    setTables(prev => prev.filter(t => t.id !== id))
  }

  const openEditTable = (t: Table) => {
    setEditTable(t)
    setTableForm({ number: t.number, seats: String(t.seats), status: t.status, shape: t.position?.shape ?? 'rect' })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutGrid className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-semibold text-gray-900">Mesas y Zonas</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowZoneModal(true)}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <Plus className="w-4 h-4" /> Nueva zona
          </button>
          {activeZone && (
            <button onClick={() => setShowTableModal(true)}
              className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
              <Plus className="w-4 h-4" /> Nueva mesa
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Zone tabs */}
        <div className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-3 space-y-0.5 overflow-y-auto flex-1">
            {zones.length === 0 ? (
              <p className="text-xs text-gray-400 px-3 py-4 text-center">Crea tu primera zona</p>
            ) : (
              zones.map(z => (
                <div
                  key={z.id}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition ${
                    activeZone === z.id ? 'bg-black text-white' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                  onClick={() => setActiveZone(z.id)}
                >
                  <span className="text-sm font-medium">{z.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs px-1.5 rounded-full ${activeZone === z.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {tables.filter(t => t.zone_id === z.id).length}
                    </span>
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteZone(z.id) }}
                      className={`opacity-0 group-hover:opacity-100 transition ${activeZone === z.id ? 'text-white/60 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tables grid */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {!activeZone ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
              <p>Selecciona o crea una zona</p>
            </div>
          ) : zoneTables.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <LayoutGrid className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-lg font-medium">Sin mesas en esta zona</p>
              <p className="text-sm mb-4">Agrega tu primera mesa.</p>
              <button onClick={() => setShowTableModal(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
                <Plus className="w-4 h-4" /> Agregar mesa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {zoneTables.map(t => {
                const stColor = STATUS_COLORS[t.status] ?? STATUS_COLORS.available
                const isCircle = t.position?.shape === 'circle'
                return (
                  <div key={t.id} className={`relative group bg-white border-2 rounded-2xl p-4 cursor-pointer hover:shadow-md transition ${stColor}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 flex items-center justify-center font-bold text-sm border-2 ${isCircle ? 'rounded-full' : 'rounded-xl'} ${stColor}`}>
                        {t.number}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => openEditTable(t)} className="p-1 hover:bg-white/80 rounded-lg">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteTable(t.id)} className="p-1 hover:bg-white/80 rounded-lg">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs font-medium">{t.seats} personas</p>
                    <p className="text-xs capitalize opacity-70">{t.status === 'out_of_service' ? 'Fuera servicio' : t.status}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Zone Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold">Nueva Zona</h2>
              <button onClick={() => setShowZoneModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateZone} className="px-6 py-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Nombre de la zona</label>
                <input required value={zoneForm.name} onChange={e => setZoneForm({ name: e.target.value })}
                  placeholder="Ej. Terraza"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
              </div>
              <div className="flex flex-wrap gap-2">
                {ZONE_PRESETS.map(p => (
                  <button key={p} type="button" onClick={() => setZoneForm({ name: p })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${zoneForm.name === p ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowZoneModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Crear zona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {(showTableModal || editTable) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold">{editTable ? 'Editar Mesa' : 'Nueva Mesa'}</h2>
              <button onClick={() => { setShowTableModal(false); setEditTable(null) }}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={editTable ? handleUpdateTable : handleCreateTable} className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Número / Nombre *</label>
                  <input required value={tableForm.number} onChange={e => setTableForm(p => ({ ...p, number: e.target.value }))}
                    placeholder="T1, VIP-1..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Capacidad *</label>
                  <input required type="number" min="1" max="50" value={tableForm.seats} onChange={e => setTableForm(p => ({ ...p, seats: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Estado</label>
                  <select value={tableForm.status} onChange={e => setTableForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black bg-white">
                    <option value="available">Disponible</option>
                    <option value="reserved">Reservada</option>
                    <option value="occupied">Ocupada</option>
                    <option value="blocked">Bloqueada</option>
                    <option value="out_of_service">Fuera de servicio</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Forma</label>
                  <div className="flex gap-2">
                    {(['rect', 'circle'] as const).map(s => (
                      <button key={s} type="button" onClick={() => setTableForm(p => ({ ...p, shape: s }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-medium border transition ${tableForm.shape === s ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600'}`}>
                        {s === 'rect' ? 'Cuadrada' : 'Redonda'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowTableModal(false); setEditTable(null) }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editTable ? 'Guardar cambios' : 'Crear mesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
