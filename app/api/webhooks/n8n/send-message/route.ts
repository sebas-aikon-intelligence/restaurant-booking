import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// El agente llama este endpoint para enviar mensajes via n8n → WhatsApp
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversation_id, content, content_type = 'text', media_url } = await req.json()

  if (!conversation_id || !content) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Get conversation + contact + org
  const { data: conv } = await supabase
    .from('conversations')
    .select('*, contacts(wa_id, org_id)')
    .eq('id', conversation_id)
    .single()

  if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

  const contact = conv.contacts as { wa_id: string; org_id: string } | null
  const { data: profile } = await supabase.from('profiles').select('org_id').eq('id', user.id).single()

  // Insert message optimistically into DB
  const { data: msg } = await supabase
    .from('chat_messages')
    .insert({
      org_id: profile?.org_id,
      conversation_id,
      contact_id: conv.contact_id,
      content,
      content_type,
      direction: 'outbound',
      sender_type: 'agent',
      sender_id: user.id,
      media_url: media_url || null,
      delivery_status: 'pending',
    })
    .select('id')
    .single()

  // Update conversation preview
  await supabase.from('conversations').update({
    last_message_at: new Date().toISOString(),
    last_message_preview: content.substring(0, 100),
    last_message_direction: 'outbound',
    unread_count: 0,
  }).eq('id', conversation_id)

  // Forward to n8n if configured
  const n8nUrl = process.env.N8N_BASE_URL
  const n8nSecret = process.env.N8N_WEBHOOK_SECRET
  if (n8nUrl && n8nSecret && contact?.wa_id) {
    try {
      await fetch(`${n8nUrl}/webhook/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': n8nSecret,
        },
        body: JSON.stringify({
          wa_id: contact.wa_id,
          message: content,
          message_type: content_type,
          media_url,
          message_id: msg?.id,
        }),
      })
    } catch {
      // n8n not configured, message still saved locally
    }
  }

  return NextResponse.json({ success: true, message_id: msg?.id })
}
