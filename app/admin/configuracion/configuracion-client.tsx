'use client'

import { useState } from 'react'
import { Settings, Loader2, CheckCircle2, Globe, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Org = {
  id: string; name: string; slug?: string; phone?: string;
  address?: string; description?: string; logo_url?: string; cover_url?: string
}
type Profile = { org_id?: string; full_name?: string; role?: string }
type BusinessHour = {
  id?: string; day_of_week: number; open_time?: string; close_time?: string;
  is_closed: boolean; booking_duration_minutes?: number
}

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const DEFAULT_HOURS: BusinessHour[] = DAYS.map((_, i) => ({
  day_of_week: i,
  is_closed: i === 0,
  open_time: '12:00',
  close_time: '22:00',
  booking_duration_minutes: 90,
}))

export default function ConfiguracionClient({
  org, profile, businessHours
}: {
  org: Org | null
  profile: Profile | null
  businessHours: BusinessHour[]
}) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'general' | 'horarios'>('general')
  const [orgForm, setOrgForm] = useState({
    name: org?.name ?? '',
    slug: org?.slug ?? '',
    phone: org?.phone ?? '',
    address: org?.address ?? '',
    description: org?.description ?? '',
    logo_url: org?.logo_url ?? '',
    cover_url: org?.cover_url ?? '',
  })
  const [hours, setHours] = useState<BusinessHour[]>(
    DAYS.map((_, i) => businessHours.find(h => h.day_of_week === i) ?? DEFAULT_HOURS[i])
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!org?.id) return
    setIsSaving(true)
    const supabase = createClient()
    await supabase.from('organizations').update({
      name: orgForm.name,
      slug: orgForm.slug || null,
      phone: orgForm.phone || null,
      address: orgForm.address || null,
      description: orgForm.description || null,
      logo_url: orgForm.logo_url || null,
      cover_url: orgForm.cover_url || null,
    }).eq('id', org.id)
    setSaved(true)
    setTimeout(() => { setSaved(false); router.refresh() }, 2000)
    setIsSaving(false)
  }

  const handleSaveHours = async () => {
    if (!org?.id) return
    setIsSaving(true)
    const supabase = createClient()
    for (const h of hours) {
      if (h.id) {
        await supabase.from('business_hours').update({
          open_time: h.is_closed ? null : h.open_time,
          close_time: h.is_closed ? null : h.close_time,
          is_closed: h.is_closed,
          booking_duration_minutes: h.booking_duration_minutes ?? 90
        }).eq('id', h.id)
      } else {
        await supabase.from('business_hours').insert({
          org_id: org.id,
          day_of_week: h.day_of_week,
          open_time: h.is_closed ? null : h.open_time,
          close_time: h.is_closed ? null : h.close_time,
          is_closed: h.is_closed,
          booking_duration_minutes: h.booking_duration_minutes ?? 90
        })
      }
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    setIsSaving(false)
  }

  const updateHour = (idx: number, field: keyof BusinessHour, value: string | boolean | number) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center gap-3">
        <Settings className="w-5 h-5 text-gray-700" />
        <h1 className="text-lg font-semibold text-gray-900">Configuración</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 px-8">
        <div className="flex gap-1">
          {[
            { key: 'general', label: 'General', icon: Globe },
            { key: 'horarios', label: 'Horarios', icon: Clock },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'general' | 'horarios')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === key
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                <h2 className="font-semibold text-gray-900">Información del Restaurante</h2>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Nombre del restaurante *</label>
                  <input required value={orgForm.name} onChange={e => setOrgForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">URL de reservas (slug)</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-400 text-xs">
                      gourmetos.com/
                    </span>
                    <input value={orgForm.slug} onChange={e => setOrgForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                      placeholder="mi-restaurante"
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-r-xl text-sm focus:outline-none focus:border-black" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Teléfono</label>
                    <input value={orgForm.phone} onChange={e => setOrgForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-600">Dirección</label>
                    <input value={orgForm.address} onChange={e => setOrgForm(p => ({ ...p, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Descripción breve</label>
                  <textarea value={orgForm.description} onChange={e => setOrgForm(p => ({ ...p, description: e.target.value }))}
                    rows={3} placeholder="Describe tu restaurante..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" />
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
                <h2 className="font-semibold text-gray-900">Imágenes</h2>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">URL del Logo</label>
                  <input value={orgForm.logo_url} onChange={e => setOrgForm(p => ({ ...p, logo_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">URL de imagen principal (portada)</label>
                  <input value={orgForm.cover_url} onChange={e => setOrgForm(p => ({ ...p, cover_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                  {orgForm.cover_url && (
                    <img src={orgForm.cover_url} alt="preview" className="mt-2 rounded-xl h-32 w-full object-cover border border-gray-100" />
                  )}
                </div>
              </div>

              <button type="submit" disabled={isSaving}
                className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : null}
                {saved ? 'Guardado' : 'Guardar cambios'}
              </button>
            </form>
          )}

          {activeTab === 'horarios' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide w-32">Día</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Abre</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Cierra</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Duración reserva</th>
                      <th className="text-left px-5 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Cerrado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {hours.map((h, i) => (
                      <tr key={i} className={h.is_closed ? 'opacity-50' : ''}>
                        <td className="px-5 py-3 font-medium text-gray-800">{DAYS[h.day_of_week]}</td>
                        <td className="px-5 py-3">
                          <input type="time" disabled={h.is_closed}
                            value={h.open_time ?? '12:00'}
                            onChange={e => updateHour(i, 'open_time', e.target.value)}
                            className="px-2 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-40" />
                        </td>
                        <td className="px-5 py-3">
                          <input type="time" disabled={h.is_closed}
                            value={h.close_time ?? '22:00'}
                            onChange={e => updateHour(i, 'close_time', e.target.value)}
                            className="px-2 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-40" />
                        </td>
                        <td className="px-5 py-3">
                          <select disabled={h.is_closed}
                            value={h.booking_duration_minutes ?? 90}
                            onChange={e => updateHour(i, 'booking_duration_minutes', parseInt(e.target.value))}
                            className="px-2 py-1 border border-gray-200 rounded-lg text-sm bg-white disabled:opacity-40">
                            {[60, 90, 120, 150, 180].map(m => (
                              <option key={m} value={m}>{m} min</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-3">
                          <input type="checkbox" checked={h.is_closed}
                            onChange={e => updateHour(i, 'is_closed', e.target.checked)}
                            className="w-4 h-4 cursor-pointer" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={handleSaveHours} disabled={isSaving}
                className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : null}
                {saved ? 'Guardado' : 'Guardar horarios'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
