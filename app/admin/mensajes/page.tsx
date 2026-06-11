import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MensajesClient from './mensajes-client'

export default async function MensajesPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('org_id').eq('id', user.id).single()

  if (!profile?.org_id) redirect('/login')
  const orgId = profile.org_id

  const [
    { data: conversations },
    { data: allTags },
    { data: stages },
    { data: quickReplies },
    { data: templates },
  ] = await Promise.all([
    supabase
      .from('conversations')
      .select(`
        *,
        contacts (
          id, first_name, last_name, phone, wa_id, email, company, city,
          funnel_stage_id, lead_score, source, ai_active, last_incoming_at,
          custom_fields, notes, updated_at, created_at,
          funnel_stages (id, name, color, position),
          contact_tags (tags (id, name, color))
        )
      `)
      .eq('org_id', orgId)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(100),
    supabase.from('tags').select('*').eq('org_id', orgId).order('name'),
    supabase.from('funnel_stages').select('*').eq('org_id', orgId).order('position'),
    supabase.from('quick_replies').select('*').eq('org_id', orgId).order('name'),
    supabase.from('message_templates').select('*').eq('org_id', orgId).order('name'),
  ])

  return (
    <MensajesClient
      orgId={orgId}
      initialConversations={conversations ?? []}
      allTags={allTags ?? []}
      stages={stages ?? []}
      quickReplies={quickReplies ?? []}
      templates={templates ?? []}
    />
  )
}
