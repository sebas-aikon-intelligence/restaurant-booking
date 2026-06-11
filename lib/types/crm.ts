export type FunnelStage = {
  id: string
  org_id: string
  name: string
  color: string
  position: number
  is_default: boolean
  created_at: string
}

export type Tag = {
  id: string
  org_id: string
  name: string
  color: string
  created_at: string
}

export type CRMContact = {
  id: string
  org_id: string
  first_name: string
  last_name?: string
  phone?: string
  wa_id?: string
  email?: string
  company?: string
  city?: string
  funnel_stage_id?: string
  lead_score: number
  source: string
  assigned_to?: string
  ai_active: boolean
  last_incoming_at?: string
  custom_fields: Record<string, string>
  notes?: string
  created_at: string
  updated_at: string
  // Joined
  funnel_stages?: FunnelStage | null
  contact_tags?: { tags: Tag }[]
}

export type Conversation = {
  id: string
  org_id: string
  contact_id: string
  status: 'open' | 'resolved' | 'pending' | 'snoozed'
  ai_active: boolean
  assigned_agent_id?: string
  window_expires_at?: string
  unread_count: number
  last_message_at?: string
  last_message_preview?: string
  last_message_direction?: 'inbound' | 'outbound'
  created_at: string
  updated_at: string
  // Joined
  contacts?: CRMContact
}

export type ChatMessage = {
  id: string
  org_id: string
  conversation_id: string
  contact_id: string
  content?: string
  content_type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'template' | 'reaction'
  direction: 'inbound' | 'outbound'
  sender_type: 'contact' | 'agent' | 'bot' | 'system'
  sender_id?: string
  media_url?: string
  media_mime_type?: string
  media_filename?: string
  wa_message_id?: string
  delivery_status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  created_at: string
  updated_at: string
}

export type QuickReply = {
  id: string
  org_id: string
  name: string
  content: string
  created_at: string
}

export type MessageTemplate = {
  id: string
  org_id: string
  name: string
  content: string
  category: string
  status: string
  variables_count: number
  created_at: string
}

export type N8nChatHistory = {
  id: number
  session_id: string
  message: {
    type: 'human' | 'ai' | 'tool'
    content: string
    tool_calls?: { id: string; name: string; args: Record<string, unknown> }[]
  }
  time_stamp: string
}
