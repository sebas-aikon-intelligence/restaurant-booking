import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MenuClient from './menu-client'

export default async function MenuPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  const [catsRes, itemsRes] = await Promise.all([
    profile?.org_id
      ? supabase.from('menu_categories').select('*').eq('org_id', profile.org_id).order('sort_order')
      : Promise.resolve({ data: [] }),
    profile?.org_id
      ? supabase.from('menu_items').select('*').eq('org_id', profile.org_id).order('sort_order')
      : Promise.resolve({ data: [] }),
  ])

  return (
    <MenuClient
      categories={catsRes.data ?? []}
      items={itemsRes.data ?? []}
      orgId={profile?.org_id ?? null}
    />
  )
}
