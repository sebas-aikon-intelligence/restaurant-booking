import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConfiguracionClient from './configuracion-client'

export default async function ConfiguracionPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id, full_name, role').eq('id', user.id).single()

  const { data: org } = profile?.org_id
    ? await supabase.from('organizations').select('*').eq('id', profile.org_id).single()
    : { data: null }

  const { data: hours } = profile?.org_id
    ? await supabase.from('business_hours').select('*').eq('org_id', profile.org_id).order('day_of_week')
    : { data: [] }

  return (
    <ConfiguracionClient
      org={org}
      profile={profile}
      businessHours={hours ?? []}
    />
  )
}
