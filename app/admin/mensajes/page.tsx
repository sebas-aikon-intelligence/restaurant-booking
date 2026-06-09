import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MensajesClient from './mensajes-client'

export default async function MensajesPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  const { data: messages } = profile?.org_id
    ? await supabase
        .from('messages')
        .select('*, bookings(guest_name, booking_date, confirmation_code)')
        .eq('org_id', profile.org_id)
        .order('created_at', { ascending: false })
        .limit(100)
    : { data: [] }

  return <MensajesClient messages={messages ?? []} orgId={profile?.org_id ?? null} />
}
