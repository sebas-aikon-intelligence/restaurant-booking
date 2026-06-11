import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookingFlow from './booking-flow'

export default async function RestaurantBookingPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug, description, logo_url, cover_url, phone, address, primary_color')
    .eq('slug', params.slug)
    .single()

  if (!org) notFound()

  const [zonesRes, tablesRes, eventsRes, hoursRes] = await Promise.all([
    supabase.from('zones').select('*').eq('org_id', org.id),
    supabase.from('tables').select('*').eq('org_id', org.id),
    supabase.from('events').select('*').eq('org_id', org.id).eq('is_active', true).order('event_date'),
    supabase.from('business_hours').select('*').eq('org_id', org.id).order('day_of_week'),
  ])

  return (
    <BookingFlow
      org={org}
      zones={zonesRes.data ?? []}
      tables={tablesRes.data ?? []}
      events={eventsRes.data ?? []}
      businessHours={hoursRes.data ?? []}
    />
  )
}
