import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MesasClient from './mesas-client'

export default async function MesasPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  const [zonesRes, tablesRes] = await Promise.all([
    profile?.org_id
      ? supabase.from('zones').select('*').eq('org_id', profile.org_id).order('created_at')
      : Promise.resolve({ data: [] }),
    profile?.org_id
      ? supabase.from('tables').select('*').eq('org_id', profile.org_id).order('number')
      : Promise.resolve({ data: [] }),
  ])

  return (
    <MesasClient
      zones={zonesRes.data ?? []}
      tables={tablesRes.data ?? []}
      orgId={profile?.org_id ?? null}
    />
  )
}
