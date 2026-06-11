import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/layout/admin-sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, org_id, role')
    .eq('id', user.id)
    .single()

  let orgName = 'Mi Restaurante'
  let orgSlug = ''
  if (profile?.org_id) {
    const { data: org } = await supabase
      .from('organizations')
      .select('name, slug')
      .eq('id', profile.org_id)
      .single()
    if (org) { orgName = org.name; orgSlug = org.slug ?? '' }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar orgName={orgName} orgSlug={orgSlug} userEmail={user.email ?? ''} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
