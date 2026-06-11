import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CelebracionesClient from './celebraciones-client'

export default async function CelebracionesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()
  if (!profile?.org_id) redirect('/login')

  const { data: celebrations } = await supabase
    .from('celebrations')
    .select('*')
    .eq('org_id', profile.org_id)
    .order('sort_order')

  return <CelebracionesClient celebrations={celebrations ?? []} orgId={profile.org_id} />
}
