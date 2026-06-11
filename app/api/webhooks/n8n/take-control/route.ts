import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// Tomar / soltar control de la IA sobre una conversación
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { conversation_id, action } = await req.json()
  // action: 'take_control' | 'release_control'

  if (!conversation_id || !action) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const ai_active = action === 'release_control'

  const { error } = await supabase
    .from('conversations')
    .update({
      ai_active,
      assigned_agent_id: action === 'take_control' ? user.id : null,
    })
    .eq('id', conversation_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Notify n8n if configured
  const n8nUrl = process.env.N8N_BASE_URL
  const n8nSecret = process.env.N8N_WEBHOOK_SECRET
  if (n8nUrl && n8nSecret) {
    const { data: conv } = await supabase
      .from('conversations')
      .select('contacts(wa_id)')
      .eq('id', conversation_id)
      .single()
    const contact = conv?.contacts as { wa_id?: string } | null
    try {
      await fetch(`${n8nUrl}/webhook/take-control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-webhook-secret': n8nSecret },
        body: JSON.stringify({ wa_id: contact?.wa_id, action, conversation_id }),
      })
    } catch { /* n8n not configured */ }
  }

  return NextResponse.json({ success: true, ai_active })
}
