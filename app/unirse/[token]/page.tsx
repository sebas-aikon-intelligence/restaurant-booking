import { createClient } from '@/lib/supabase/server'
import JoinClient from './join-client'

export default async function UnirsePage({ params }: { params: { token: string } }) {
  const supabase = createClient()

  const { data: rows } = await supabase.rpc('get_invitation_by_token', {
    invite_token: params.token,
  })

  const invitation = rows?.[0] ?? null

  if (!invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Invitación no válida</h1>
          <p className="text-sm text-gray-500">Este enlace no existe, ha expirado o ya fue usado.</p>
        </div>
      </div>
    )
  }

  if (invitation.accepted_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✅</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Invitación ya usada</h1>
          <p className="text-sm text-gray-500">Esta invitación ya fue aceptada. Inicia sesión si ya tienes cuenta.</p>
          <a href="/login" className="mt-4 inline-block px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition">
            Iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-sm px-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏰</span>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Invitación expirada</h1>
          <p className="text-sm text-gray-500">Pide a tu administrador que genere un nuevo enlace.</p>
        </div>
      </div>
    )
  }

  return <JoinClient invitation={invitation} />
}
