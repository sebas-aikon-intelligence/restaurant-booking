import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// n8n llama este endpoint cuando llega un mensaje de WhatsApp
// El body debe tener: wa_id, phone, name, message, message_type, media_url?, wa_message_id?
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-webhook-secret')
  if (secret !== process.env.N8N_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const body = await req.json()
  const { wa_id, phone, name, message, message_type = 'text', media_url, wa_message_id, org_id } = body

  if (!wa_id || !org_id) {
    return NextResponse.json({ error: 'Missing wa_id or org_id' }, { status: 400 })
  }

  // 1. Upsert contact
  let { data: contact } = await supabase
    .from('contacts')
    .select('id')
    .eq('wa_id', wa_id)
    .eq('org_id', org_id)
    .single()

  if (!contact) {
    const nameParts = (name || 'Unknown').split(' ')
    const { data: newContact } = await supabase
      .from('contacts')
      .insert({
        org_id,
        wa_id,
        phone: phone || `+${wa_id}`,
        first_name: nameParts[0] || 'Unknown',
        last_name: nameParts.slice(1).join(' ') || null,
        source: 'whatsapp',
        last_incoming_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    contact = newContact
  } else {
    await supabase
      .from('contacts')
      .update({ last_incoming_at: new Date().toISOString() })
      .eq('id', contact.id)
  }

  if (!contact) {
    return NextResponse.json({ error: 'Failed to upsert contact' }, { status: 500 })
  }

  // 2. Upsert conversation
  let { data: conversation } = await supabase
    .from('conversations')
    .select('id')
    .eq('contact_id', contact.id)
    .eq('org_id', org_id)
    .neq('status', 'resolved')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  const windowExpires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  if (!conversation) {
    const { data: newConv } = await supabase
      .from('conversations')
      .insert({
        org_id,
        contact_id: contact.id,
        status: 'open',
        ai_active: true,
        window_expires_at: windowExpires,
        unread_count: 1,
        last_message_at: new Date().toISOString(),
        last_message_preview: message?.substring(0, 100),
        last_message_direction: 'inbound',
      })
      .select('id')
      .single()
    conversation = newConv
  } else {
    await supabase
      .from('conversations')
      .update({
        window_expires_at: windowExpires,
        unread_count: supabase.rpc as unknown as number, // increment handled below
        last_message_at: new Date().toISOString(),
        last_message_preview: message?.substring(0, 100),
        last_message_direction: 'inbound',
        status: 'open',
      })
      .eq('id', conversation.id)
    await supabase.rpc('increment_unread', { conv_id: conversation.id })
  }

  if (!conversation) {
    return NextResponse.json({ error: 'Failed to upsert conversation' }, { status: 500 })
  }

  // 3. Insert message
  await supabase.from('chat_messages').insert({
    org_id,
    conversation_id: conversation.id,
    contact_id: contact.id,
    content: message,
    content_type: message_type,
    direction: 'inbound',
    sender_type: 'contact',
    media_url: media_url || null,
    wa_message_id: wa_message_id || null,
    delivery_status: 'delivered',
  })

  return NextResponse.json({ success: true, conversation_id: conversation.id })
}
