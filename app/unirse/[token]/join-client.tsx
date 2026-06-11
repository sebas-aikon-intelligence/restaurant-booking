'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ChefHat, CheckCircle2, Eye, EyeOff } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  owner: 'Dueño', manager: 'Gerente', chef: 'Chef', waiter: 'Mesero',
}

type Invitation = {
  id: string; org_id: string; org_name: string
  email: string; role: string; expires_at: string
}

export default function JoinClient({ invitation }: { invitation: Invitation }) {
  const [form, setForm]         = useState({ full_name: '', password: '', confirm: '' })
  const [showPwd, setShowPwd]   = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [done, setDone]         = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (form.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email: invitation.email,
      password: form.password,
      options: {
        data: {
          full_name: form.full_name,
          org_id: invitation.org_id,
          role: invitation.role,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message === 'User already registered'
        ? 'Ya existe una cuenta con este correo. Inicia sesión e informa a tu administrador.'
        : signUpError.message)
      setLoading(false)
      return
    }

    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">¡Revisa tu correo!</h1>
          <p className="text-sm text-gray-500 mb-1">
            Te enviamos un enlace de confirmación a <strong>{invitation.email}</strong>
          </p>
          <p className="text-xs text-gray-400">
            Después de confirmar podrás iniciar sesión en el panel de <strong>{invitation.org_name}</strong>.
          </p>
          <a
            href="/login"
            className="mt-6 inline-block w-full py-2.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition text-center"
          >
            Ir a iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="text-center">
          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Únete al equipo</h1>
          <p className="text-sm text-gray-500 mt-1">
            Has sido invitado a <strong>{invitation.org_name}</strong> como <strong>{ROLE_LABELS[invitation.role] ?? invitation.role}</strong>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
          {/* Email (read-only) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">Correo electrónico</label>
            <div className="px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-gray-500">
              {invitation.email}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Tu nombre completo *</label>
              <input
                required
                value={form.full_name}
                onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                placeholder="Ej. Juan García"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Contraseña *</label>
              <div className="relative">
                <input
                  required
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">Confirmar contraseña *</label>
              <input
                required
                type="password"
                value={form.confirm}
                onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
                placeholder="Repite tu contraseña"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear cuenta y unirme
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <a href="/login" className="text-gray-700 font-medium hover:underline">Inicia sesión</a>
        </p>
      </div>
    </div>
  )
}
