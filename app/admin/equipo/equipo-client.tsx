'use client'

import { useState } from 'react'
import { Users2, Plus, X, Loader2, Copy, Check, Trash2, Mail, Crown, ChefHat, UtensilsCrossed, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Member = {
  id: string; email: string; full_name: string | null
  role: 'owner' | 'manager' | 'waiter' | 'chef'; created_at: string
}
type Invitation = {
  id: string; email: string; role: string
  token: string; expires_at: string; created_at: string
}

const ROLE_LABELS: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  owner:   { label: 'Dueño',    color: 'bg-purple-100 text-purple-700', Icon: Crown },
  manager: { label: 'Gerente',  color: 'bg-blue-100 text-blue-700',     Icon: Shield },
  chef:    { label: 'Chef',     color: 'bg-orange-100 text-orange-700', Icon: ChefHat },
  waiter:  { label: 'Mesero',   color: 'bg-green-100 text-green-700',   Icon: UtensilsCrossed },
}

const INVITE_ROLES = [
  { value: 'manager', label: 'Gerente',  desc: 'Acceso completo excepto configuración de cuenta' },
  { value: 'chef',    label: 'Chef',     desc: 'Puede ver reservas y gestionar el menú' },
  { value: 'waiter',  label: 'Mesero',   desc: 'Puede ver reservas y mesas' },
]

function initials(name: string | null, email: string) {
  if (name) return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  return email.slice(0, 2).toUpperCase()
}

const COLORS = ['bg-violet-500','bg-blue-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-indigo-500']

export default function EquipoClient({
  members: initial, invitations: initialInv, orgId, currentUserId, currentUserRole
}: {
  members: Member[]
  invitations: Invitation[]
  orgId: string
  currentUserId: string
  currentUserRole: string
}) {
  const [members, setMembers]         = useState(initial)
  const [invitations, setInvitations] = useState(initialInv)
  const [showModal, setShowModal]     = useState(false)
  const [isSaving, setIsSaving]       = useState(false)
  const [copiedId, setCopiedId]       = useState<string | null>(null)
  const [newInvite, setNewInvite]     = useState<{ token: string; email: string } | null>(null)
  const [form, setForm]               = useState({ email: '', role: 'waiter' })
  const [removing, setRemoving]       = useState<string | null>(null)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const res = await fetch('/api/admin/create-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, role: form.role, orgId }),
    })
    const data = await res.json()
    if (data.token) {
      setNewInvite({ token: data.token, email: form.email })
      setInvitations(prev => [data.invitation, ...prev])
      setForm({ email: '', role: 'waiter' })
    }
    setIsSaving(false)
  }

  const copyLink = (token: string, id: string) => {
    const url = `${window.location.origin}/unirse/${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const revokeInvitation = async (id: string) => {
    const supabase = createClient()
    await supabase.from('invitations').delete().eq('id', id)
    setInvitations(prev => prev.filter(i => i.id !== id))
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('¿Quitar a este miembro del equipo? Perderá acceso al panel.')) return
    setRemoving(memberId)
    const supabase = createClient()
    await supabase.rpc('remove_org_member', { member_id: memberId })
    setMembers(prev => prev.filter(m => m.id !== memberId))
    setRemoving(null)
  }

  const closeModal = () => { setShowModal(false); setNewInvite(null); setForm({ email: '', role: 'waiter' }) }

  const canManage = currentUserRole === 'owner' || currentUserRole === 'manager'

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <Users2 className="w-5 h-5 text-gray-700" />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Equipo</h1>
            <p className="text-xs text-gray-400 mt-0.5">Gestiona los miembros que tienen acceso a tu panel</p>
          </div>
        </div>
        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
          >
            <Plus className="w-4 h-4" /> Invitar usuario
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-6 bg-gray-50 space-y-6">
        {/* Members list */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Miembros activos</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{members.length}</span>
          </div>
          <div className="divide-y divide-gray-50">
            {members.map((m, i) => {
              const roleInfo = ROLE_LABELS[m.role] ?? ROLE_LABELS.waiter
              const RoleIcon = roleInfo.Icon
              const colorClass = COLORS[i % COLORS.length]
              const isSelf = m.id === currentUserId
              return (
                <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition group">
                  {/* Avatar */}
                  <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center text-white font-semibold text-sm flex-shrink-0`}>
                    {initials(m.full_name, m.email)}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {m.full_name ?? m.email}
                      </p>
                      {isSelf && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-medium">Tú</span>}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{m.email}</p>
                  </div>
                  {/* Role badge */}
                  <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${roleInfo.color}`}>
                    <RoleIcon className="w-3 h-3" />
                    {roleInfo.label}
                  </span>
                  {/* Remove button */}
                  {canManage && !isSelf && m.role !== 'owner' && (
                    <button
                      onClick={() => removeMember(m.id)}
                      disabled={removing === m.id}
                      className="opacity-0 group-hover:opacity-100 transition p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      title="Quitar del equipo"
                    >
                      {removing === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Pending invitations */}
        {invitations.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-sm">Invitaciones pendientes</h2>
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{invitations.length}</span>
            </div>
            <div className="divide-y divide-gray-50">
              {invitations.map(inv => {
                const roleInfo = ROLE_LABELS[inv.role] ?? ROLE_LABELS.waiter
                const RoleIcon = roleInfo.Icon
                const expires = new Date(inv.expires_at)
                const daysLeft = Math.ceil((expires.getTime() - Date.now()) / 86400000)
                return (
                  <div key={inv.id} className="flex items-center gap-4 px-6 py-4 group">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{inv.email}</p>
                      <p className="text-xs text-gray-400">Expira en {daysLeft} día{daysLeft !== 1 ? 's' : ''}</p>
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${roleInfo.color}`}>
                      <RoleIcon className="w-3 h-3" />
                      {roleInfo.label}
                    </span>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => copyLink(inv.token, inv.id)}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                      >
                        {copiedId === inv.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === inv.id ? 'Copiado' : 'Copiar enlace'}
                      </button>
                      {canManage && (
                        <button
                          onClick={() => revokeInvitation(inv.id)}
                          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Revocar invitación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {members.length === 0 && invitations.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Users2 className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium">Solo estás tú</p>
            <p className="text-sm mt-1">Invita a tu equipo para que puedan acceder al panel</p>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Invitar al equipo</h2>
              <button onClick={closeModal}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            {newInvite ? (
              /* ── Link generado ── */
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Invitación creada</p>
                    <p className="text-xs text-green-600 mt-0.5">Comparte el enlace con <strong>{newInvite.email}</strong></p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-gray-600">Enlace de invitación</p>
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 font-mono truncate">
                      {typeof window !== 'undefined' ? `${window.location.origin}/unirse/${newInvite.token}` : `/unirse/${newInvite.token}`}
                    </div>
                    <button
                      onClick={() => copyLink(newInvite.token, 'new')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-medium rounded-xl hover:bg-gray-800 transition flex-shrink-0"
                    >
                      {copiedId === 'new' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === 'new' ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Este enlace expira en 7 días y es de un solo uso.</p>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setNewInvite(null)}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                  >
                    Invitar otro
                  </button>
                  <button
                    onClick={closeModal}
                    className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
                  >
                    Listo
                  </button>
                </div>
              </div>
            ) : (
              /* ── Formulario ── */
              <form onSubmit={handleInvite} className="px-6 py-5 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-600">Correo electrónico *</label>
                  <input
                    required type="email"
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="nombre@ejemplo.com"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Rol</label>
                  <div className="space-y-2">
                    {INVITE_ROLES.map(r => (
                      <label key={r.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${form.role === r.value ? 'border-black bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}>
                        <input
                          type="radio" name="role" value={r.value}
                          checked={form.role === r.value}
                          onChange={() => setForm(p => ({ ...p, role: r.value }))}
                          className="mt-0.5 accent-black"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{r.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={closeModal}
                    className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                    Cancelar
                  </button>
                  <button type="submit" disabled={isSaving}
                    className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Generar enlace
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
