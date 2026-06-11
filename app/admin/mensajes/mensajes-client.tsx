'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bot, User, UserPlus, CheckCheck, ChevronDown, MessageSquare, Phone, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ConversationList } from './components/conversation-list'
import { ChatView } from './components/chat-view'
import { ContactPanel } from './components/contact-panel'
import { Composer } from './components/composer'
import type {
  Conversation, ChatMessage, CRMContact, FunnelStage, Tag, QuickReply, MessageTemplate
} from '@/lib/types/crm'

type Filter = 'all' | 'open' | 'resolved' | 'pending'

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

export default function MensajesClient({
  orgId,
  initialConversations,
  allTags,
  stages,
  quickReplies,
  templates,
}: {
  orgId: string
  initialConversations: Conversation[]
  allTags: Tag[]
  stages: FunnelStage[]
  quickReplies: QuickReply[]
  templates: MessageTemplate[]
}) {
  const supabase = createClient()

  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')
  const [contactTags, setContactTags] = useState<Tag[]>([])
  const [activeTab, setActiveTab] = useState<'contact' | 'ai'>('contact')

  // Load messages for selected conversation
  const loadMessages = useCallback(async (convId: string) => {
    setLoadingMessages(true)
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(100)
    setMessages(data ?? [])
    setLoadingMessages(false)
  }, [supabase])

  // Load contact tags
  const loadContactTags = useCallback(async (contactId: string) => {
    const { data } = await supabase
      .from('contact_tags')
      .select('tags(*)')
      .eq('contact_id', contactId)
    const tags = (data ?? []).map((row: { tags: Tag | Tag[] }) =>
      Array.isArray(row.tags) ? row.tags[0] : row.tags
    ).filter(Boolean)
    setContactTags(tags as Tag[])
  }, [supabase])

  // Select conversation
  const handleSelect = useCallback(async (conv: Conversation) => {
    setSelected(conv)
    setMessages([])
    loadMessages(conv.id)
    if (conv.contacts?.id) loadContactTags(conv.contacts.id)
    // Mark as read
    if (conv.unread_count > 0) {
      await supabase.from('conversations').update({ unread_count: 0 }).eq('id', conv.id)
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread_count: 0 } : c))
    }
  }, [loadMessages, loadContactTags, supabase])

  // Real-time subscription
  useEffect(() => {
    const channel = supabase.channel('crm-realtime')
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'conversations',
        filter: `org_id=eq.${orgId}`
      }, async () => {
        // Reload conversations
        const { data } = await supabase
          .from('conversations')
          .select('*, contacts(*, funnel_stages(*), contact_tags(tags(*)))')
          .eq('org_id', orgId)
          .order('last_message_at', { ascending: false })
          .limit(100)
        if (data) setConversations(data as Conversation[])
      })
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
      }, (payload) => {
        const msg = payload.new as ChatMessage
        if (selected && msg.conversation_id === selected.id) {
          setMessages(prev => [...prev, msg])
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [orgId, selected, supabase])

  // Send message
  const handleSend = async (content: string, contentType: 'text' | 'image' | 'document' | 'audio' | 'template' = 'text') => {
    if (!selected || !orgId) return
    const res = await fetch('/api/webhooks/n8n/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: selected.id,
        content,
        content_type: contentType,
      }),
    })
    if (!res.ok) {
      // Fallback: direct insert
      const { data: msg } = await supabase.from('chat_messages').insert({
        org_id: orgId,
        conversation_id: selected.id,
        contact_id: selected.contact_id,
        content,
        content_type: contentType,
        direction: 'outbound',
        sender_type: 'agent',
        delivery_status: 'sent',
      }).select('*').single()
      if (msg) setMessages(prev => [...prev, msg as ChatMessage])
    }
  }

  // Toggle AI control
  const handleToggleAI = async () => {
    if (!selected) return
    const action = selected.ai_active ? 'take_control' : 'release_control'
    await fetch('/api/webhooks/n8n/take-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: selected.id, action }),
    })
    const updated = { ...selected, ai_active: !selected.ai_active }
    setSelected(updated)
    setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, ai_active: !c.ai_active } : c))
  }

  // Resolve conversation
  const handleResolve = async () => {
    if (!selected) return
    await supabase.from('conversations').update({ status: 'resolved' }).eq('id', selected.id)
    const updated = { ...selected, status: 'resolved' as const }
    setSelected(updated)
    setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, status: 'resolved' as const } : c))
  }

  // Update contact in state
  const handleContactUpdate = (updated: Partial<CRMContact>) => {
    if (!selected?.contacts) return
    const updatedContact = { ...selected.contacts, ...updated }
    setSelected({ ...selected, contacts: updatedContact })
    setConversations(prev => prev.map(c => c.id === selected.id ? { ...c, contacts: updatedContact } : c))
  }

  const contact = selected?.contacts
  const contactName = contact ? `${contact.first_name} ${contact.last_name ?? ''}`.trim() : ''
  const windowExpired = selected?.window_expires_at
    ? new Date(selected.window_expires_at) < new Date()
    : false

  return (
    <div className="flex h-full bg-gray-50 overflow-hidden">
      {/* Left panel: conversation list */}
      <div className="w-[300px] flex-shrink-0 flex flex-col h-full">
        <ConversationList
          conversations={conversations}
          selectedId={selected?.id ?? null}
          onSelect={handleSelect}
          filter={filter}
          onFilterChange={setFilter}
          search={search}
          onSearchChange={setSearch}
        />
      </div>

      {/* Center: chat */}
      <div className="flex-1 flex flex-col min-w-0 border-x border-gray-200 bg-white">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50 gap-3">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageSquare className="w-9 h-9 opacity-40" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-500">Selecciona una conversación</p>
              <p className="text-sm text-gray-400 mt-1">Elige un chat de la lista para comenzar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 bg-white flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {contactName ? getInitials(contactName) : '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{contactName || 'Desconocido'}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {contact?.phone ?? contact?.wa_id ?? 'Sin teléfono'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* AI badge */}
                {selected.ai_active ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                    <Bot className="w-3.5 h-3.5" /> IA Activa
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
                    <User className="w-3.5 h-3.5" /> Humano
                  </span>
                )}

                {/* 24h window */}
                {windowExpired && (
                  <span className="flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                    <AlertCircle className="w-3.5 h-3.5" /> Ventana expirada
                  </span>
                )}

                {/* Assign */}
                <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition">
                  <UserPlus className="w-3.5 h-3.5" />
                  Asignar
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {/* Take / release control */}
                <button
                  onClick={handleToggleAI}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition border ${
                    selected.ai_active
                      ? 'text-red-600 bg-red-50 border-red-200 hover:bg-red-100'
                      : 'text-green-600 bg-green-50 border-green-200 hover:bg-green-100'
                  }`}
                >
                  {selected.ai_active ? (
                    <><User className="w-3.5 h-3.5" /> Tomar Control</>
                  ) : (
                    <><Bot className="w-3.5 h-3.5" /> Activar IA</>
                  )}
                </button>

                {/* Resolve */}
                {selected.status !== 'resolved' && (
                  <button
                    onClick={handleResolve}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 hover:border-gray-300 px-3 py-1.5 rounded-lg transition"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Resolver
                  </button>
                )}

                {/* Tabs toggle */}
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setActiveTab('contact')}
                    className={`px-3 py-1.5 text-xs font-medium transition ${activeTab === 'contact' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    Contacto
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`px-3 py-1.5 text-xs font-medium transition ${activeTab === 'ai' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                    Mente IA
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ChatView messages={messages} loading={loadingMessages} />

            {/* Composer */}
            <Composer
              conversationId={selected.id}
              windowExpired={windowExpired}
              quickReplies={quickReplies}
              templates={templates}
              onSend={handleSend}
            />
          </>
        )}
      </div>

      {/* Right panel: contact info */}
      {selected && contact && (
        activeTab === 'contact' ? (
          <ContactPanel
            contact={contact}
            tags={contactTags}
            allTags={allTags}
            stages={stages}
            onUpdate={handleContactUpdate}
          />
        ) : (
          <AIPanel sessionId={contact.wa_id ?? ''} />
        )
      )}
    </div>
  )
}

// Mente IA panel — shows n8n chat history
function AIPanel({ sessionId }: { sessionId: string }) {
  const supabase = createClient()
  const [history, setHistory] = useState<{ id: number; message: { type: string; content: string }; time_stamp: string }[]>([])

  useEffect(() => {
    if (!sessionId) return
    supabase
      .from('n8n_chat_histories')
      .select('id, message, time_stamp')
      .eq('session_id', sessionId)
      .order('time_stamp', { ascending: false })
      .limit(50)
      .then(({ data }) => setHistory(data ?? []))
  }, [sessionId, supabase])

  return (
    <div className="w-80 flex flex-col h-full bg-white border-l border-gray-200">
      <div className="px-4 py-3 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Bot className="w-4 h-4 text-indigo-500" />
          Historial IA (n8n)
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">Memoria del agente para sesión {sessionId}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <div className="text-center text-xs text-gray-400 py-8">
            <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Sin historial de IA para este contacto
          </div>
        ) : (
          [...history].reverse().map(entry => (
            <div key={entry.id} className={`rounded-xl px-3 py-2 text-xs ${
              entry.message.type === 'human'
                ? 'bg-gray-100 text-gray-700'
                : entry.message.type === 'ai'
                ? 'bg-indigo-50 text-indigo-800'
                : 'bg-amber-50 text-amber-800 font-mono'
            }`}>
              <p className="font-semibold opacity-60 mb-1 capitalize">{entry.message.type}</p>
              <p className="leading-relaxed line-clamp-4">{entry.message.content}</p>
              <p className="text-gray-400 mt-1 text-[10px]">
                {new Date(entry.time_stamp).toLocaleString('es', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
