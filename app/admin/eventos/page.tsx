import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EventosClient from './eventos-client'

export default async function EventosPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  const { data: events } = profile?.org_id
    ? await supabase.from('events').select('*').eq('org_id', profile.org_id).order('event_date', { ascending: true })
    : { data: [] }

  return <EventosClient events={events ?? []} orgId={profile?.org_id ?? null} />
}
