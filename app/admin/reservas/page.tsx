import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReservasClient from './reservas-client'

export default async function ReservasPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('org_id')
    .eq('id', user.id)
    .single()

  const orgId = profile?.org_id

  const [bookingsRes, zonesRes] = await Promise.all([
    orgId
      ? supabase
          .from('bookings')
          .select('*, zones(name), tables(number)')
          .eq('org_id', orgId)
          .order('booking_date', { ascending: false })
          .order('booking_time', { ascending: false })
          .limit(200)
      : Promise.resolve({ data: [] }),
    orgId
      ? supabase.from('zones').select('id, name').eq('org_id', orgId)
      : Promise.resolve({ data: [] }),
  ])

  return (
    <ReservasClient
      bookings={bookingsRes.data ?? []}
      zones={zonesRes.data ?? []}
      orgId={orgId ?? null}
    />
  )
}
