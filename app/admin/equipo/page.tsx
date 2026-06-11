import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EquipoClient from './equipo-client'

export default async function EquipoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id, role').eq('id', user.id).single()
  if (!profile?.org_id) redirect('/login')

  const [{ data: members }, { data: invitations }] = await Promise.all([
    supabase.rpc('get_org_members'),
    supabase.from('invitations')
      .select('*')
      .eq('org_id', profile.org_id)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }),
  ])

  return (
    <EquipoClient
      members={members ?? []}
      invitations={invitations ?? []}
      orgId={profile.org_id}
      currentUserId={user.id}
      currentUserRole={profile.role}
    />
  )
}
