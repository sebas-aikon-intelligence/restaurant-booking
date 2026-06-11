'use client'

import { useState } from 'react'
import { Plus, X, Phone, Mail, Building2, MapPin, ChevronDown, Tag, StickyNote, Zap } from 'lucide-react'
import type { CRMContact, FunnelStage, Tag as TagType } from '@/lib/types/crm'
import { createClient } from '@/lib/supabase/client'

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function LeadScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-gray-300'
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
    </div>
  )
}

export function ContactPanel({
  contact,
  tags,
  allTags,
  stages,
  onUpdate,
}: {
  contact: CRMContact
  tags: TagType[]
  allTags: TagType[]
  stages: FunnelStage[]
  onUpdate: (updated: Partial<CRMContact>) => void
}) {
  const supabase = createClient()
  const [notes, setNotes] = useState(contact.notes ?? '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [showTagPicker, setShowTagPicker] = useState(false)
  const [showStagePicker, setShowStagePicker] = useState(false)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({
    email: contact.email ?? '',
    company: contact.company ?? '',
    city: contact.city ?? '',
    phone: contact.phone ?? '',
  })

  const name = `${contact.first_name} ${contact.last_name ?? ''}`.trim()
  const initials = getInitials(name)
  const currentStage = stages.find(s => s.id === contact.funnel_stage_id)

  const saveField = async (field: string) => {
    const value = fieldValues[field]
    await supabase.from('contacts').update({ [field]: value }).eq('id', contact.id)
    onUpdate({ [field]: value })
    setEditingField(null)
  }

  const saveNotes = async () => {
    setSavingNotes(true)
    await supabase.from('contacts').update({ notes }).eq('id', contact.id)
    onUpdate({ notes })
    setSavingNotes(false)
  }

  const setStage = async (stageId: string) => {
    await supabase.from('contacts').update({ funnel_stage_id: stageId }).eq('id', contact.id)
    onUpdate({ funnel_stage_id: stageId })
    setShowStagePicker(false)
  }

  const removeTag = async (tagId: string) => {
    await supabase.from('contact_tags').delete().eq('contact_id', contact.id).eq('tag_id', tagId)
  }

  const addTag = async (tagId: string) => {
    await supabase.from('contact_tags').insert({ contact_id: contact.id, tag_id: tagId })
    setShowTagPicker(false)
  }

  const addedTagIds = new Set(tags.map(t => t.id))
  const availableTags = allTags.filter(t => !addedTagIds.has(t.id))

  const customFields = Object.entries(contact.custom_fields ?? {})

  return (
    <div className="w-80 flex flex-col h-full bg-white border-l border-gray-200 overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 text-center">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
          {initials}
        </div>
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{name.toUpperCase()}</h3>
        {contact.company && (
          <p className="text-xs text-gray-500 mt-0.5">{contact.company}</p>
        )}
        {contact.ai_active && (
          <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full mt-2">
            <Zap className="w-2.5 h-2.5" /> IA Activa
          </span>
        )}
      </div>

      {/* Funnel stage */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Etapa del Embudo</p>
        <div className="relative">
          <button
            onClick={() => setShowStagePicker(!showStagePicker)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-200 hover:border-gray-300 text-sm transition"
          >
            <div className="flex items-center gap-2">
              {currentStage && (
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: currentStage.color }} />
              )}
              <span className="text-gray-700 text-sm">{currentStage?.name ?? 'Sin etapa'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showStagePicker && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
              {stages.map(s => (
                <button
                  key={s.id}
                  onClick={() => setStage(s.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-left"
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lead score */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">Lead Score</p>
          <span className="text-sm font-bold text-gray-700">{contact.lead_score}</span>
        </div>
        <LeadScoreBar score={contact.lead_score} />
      </div>

      {/* Tags */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Tag className="w-3 h-3" /> Etiquetas
          </p>
          <button onClick={() => setShowTagPicker(!showTagPicker)} className="p-0.5 hover:bg-gray-100 rounded transition">
            <Plus className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <button onClick={() => removeTag(tag.id)} className="opacity-70 hover:opacity-100 transition">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
          {tags.length === 0 && <p className="text-xs text-gray-400">Sin etiquetas</p>}
        </div>
        {showTagPicker && availableTags.length > 0 && (
          <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1">
            {availableTags.map(tag => (
              <button
                key={tag.id}
                onClick={() => addTag(tag.id)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-sm text-left"
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contact info */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-3">Información</p>
        {[
          { key: 'phone', icon: Phone, label: contact.phone },
          { key: 'email', icon: Mail, label: contact.email || 'Añadir email' },
          { key: 'company', icon: Building2, label: contact.company || 'Añadir empresa' },
          { key: 'city', icon: MapPin, label: contact.city || 'Añadir ciudad' },
        ].map(({ key, icon: Icon, label }) => (
          <div key={key} className="flex items-center gap-2 mb-2">
            <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            {editingField === key ? (
              <div className="flex-1 flex gap-1">
                <input
                  autoFocus
                  value={fieldValues[key]}
                  onChange={e => setFieldValues(p => ({ ...p, [key]: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') saveField(key); if (e.key === 'Escape') setEditingField(null) }}
                  className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-indigo-400"
                />
                <button onClick={() => saveField(key)} className="text-xs bg-indigo-600 text-white px-2 rounded hover:bg-indigo-700">✓</button>
              </div>
            ) : (
              <button
                onClick={() => setEditingField(key)}
                className={`text-xs flex-1 text-left hover:text-indigo-600 truncate transition ${!fieldValues[key] ? 'text-gray-300' : 'text-gray-700'}`}
              >
                {label}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Custom fields */}
      {customFields.length > 0 && (
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-3">Campos Personalizados</p>
          {customFields.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
              <span className="text-xs text-gray-700 font-medium">{value as string}</span>
            </div>
          ))}
        </div>
      )}

      {/* Internal notes */}
      <div className="px-4 py-3">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold mb-2 flex items-center gap-1">
          <StickyNote className="w-3 h-3" /> Notas Internas
        </p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notas sobre el cliente..."
          rows={4}
          className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-400 resize-none text-gray-700 placeholder:text-gray-300"
        />
        <button
          onClick={saveNotes}
          disabled={savingNotes}
          className="mt-2 w-full py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-60"
        >
          {savingNotes ? 'Guardando...' : 'Guardar notas'}
        </button>
      </div>
    </div>
  )
}
