'use client'

import { Search, SlidersHorizontal, MessageSquare, Bot, User } from 'lucide-react'
import type { Conversation } from '@/lib/types/crm'

type Filter = 'all' | 'open' | 'resolved' | 'pending'

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function timeAgo(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return 'ahora'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  return date.toLocaleDateString('es', { day: '2-digit', month: 'short' })
}

export function ConversationList({
  conversations,
  selectedId,
  onSelect,
  filter,
  onFilterChange,
  search,
  onSearchChange,
}: {
  conversations: Conversation[]
  selectedId: string | null
  onSelect: (c: Conversation) => void
  filter: Filter
  onFilterChange: (f: Filter) => void
  search: string
  onSearchChange: (s: string) => void
}) {
  const filtered = conversations.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (search) {
      const contact = c.contacts
      const q = search.toLowerCase()
      const name = `${contact?.first_name ?? ''} ${contact?.last_name ?? ''}`.toLowerCase()
      const phone = (contact?.phone ?? '').toLowerCase()
      if (!name.includes(q) && !phone.includes(q)) return false
    }
    return true
  })

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'open', label: 'Abiertos' },
    { key: 'pending', label: 'Pendiente' },
    { key: 'resolved', label: 'Resueltos' },
  ]

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900 text-[15px]">Conversaciones</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {conversations.length}
            </span>
          </div>
          <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Nombre, teléfono, correo..."
            className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400 placeholder:text-gray-400"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mt-2">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition ${
                filter === f.key
                  ? 'bg-black text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm gap-2">
            <MessageSquare className="w-8 h-8 opacity-30" />
            <p>Sin conversaciones</p>
          </div>
        ) : (
          filtered.map(conv => {
            const contact = conv.contacts
            const name = contact ? `${contact.first_name} ${contact.last_name ?? ''}`.trim() : 'Desconocido'
            const initials = getInitials(name)
            const isSelected = selectedId === conv.id
            const hasUnread = conv.unread_count > 0
            const isInbound = conv.last_message_direction === 'inbound'

            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv)}
                className={`w-full text-left px-4 py-3.5 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                      {initials}
                    </div>
                    {conv.ai_active && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" title="IA Activa" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {name}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {conv.last_message_at ? timeAgo(conv.last_message_at) : ''}
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 truncate">
                      {contact?.phone}
                    </p>

                    <div className="flex items-center justify-between mt-1 gap-1">
                      <p className={`text-xs truncate flex-1 ${hasUnread && isInbound ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                        {!isInbound && <span className="text-gray-300">Tú: </span>}
                        {conv.last_message_preview}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {conv.ai_active ? (
                          <span className="text-[10px] text-green-600 font-medium bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Bot className="w-2.5 h-2.5" />IA
                          </span>
                        ) : (
                          <span className="text-[10px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <User className="w-2.5 h-2.5" />Humano
                          </span>
                        )}
                        {conv.unread_count > 0 && (
                          <span className="w-5 h-5 bg-indigo-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
