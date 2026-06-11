'use client'

import { useEffect, useRef } from 'react'
import { Check, CheckCheck, Clock, AlertTriangle, Bot, User, Paperclip, Volume2, FileText } from 'lucide-react'
import type { ChatMessage } from '@/lib/types/crm'

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Hoy'
  if (date.toDateString() === yesterday.toDateString()) return 'Ayer'
  return date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
}

function DeliveryIcon({ status }: { status: ChatMessage['delivery_status'] }) {
  if (status === 'pending') return <Clock className="w-3 h-3 text-gray-400" />
  if (status === 'sent') return <Check className="w-3 h-3 text-gray-400" />
  if (status === 'delivered') return <CheckCheck className="w-3 h-3 text-gray-400" />
  if (status === 'read') return <CheckCheck className="w-3 h-3 text-indigo-500" />
  if (status === 'failed') return <AlertTriangle className="w-3 h-3 text-red-400" />
  return null
}

function SenderLabel({ senderType }: { senderType: ChatMessage['sender_type'] }) {
  if (senderType === 'bot') return (
    <span className="flex items-center gap-1 text-[10px] text-indigo-500 font-medium mb-0.5">
      <Bot className="w-3 h-3" /> IA Agente
    </span>
  )
  if (senderType === 'agent') return (
    <span className="flex items-center gap-1 text-[10px] text-blue-500 font-medium mb-0.5">
      <User className="w-3 h-3" /> Agente
    </span>
  )
  return null
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isOutbound = message.direction === 'outbound'

  const renderContent = () => {
    if (message.content_type === 'audio') {
      return (
        <div className="flex items-center gap-2 min-w-[160px]">
          <Volume2 className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1 h-1 bg-white/30 rounded-full" />
          <span className="text-xs opacity-70">0:00</span>
        </div>
      )
    }
    if (message.content_type === 'image' && message.media_url) {
      return (
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={message.media_url} alt="Imagen" className="rounded-lg max-w-[240px] max-h-[200px] object-cover" />
          {message.content && <p className="text-sm mt-1">{message.content}</p>}
        </div>
      )
    }
    if (message.content_type === 'document' && message.media_url) {
      return (
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">{message.media_filename || 'Documento'}</p>
            <p className="text-xs opacity-70">Toca para abrir</p>
          </div>
        </div>
      )
    }
    if (message.content_type === 'template') {
      return (
        <div>
          <div className="text-[10px] opacity-60 uppercase tracking-wide mb-1 flex items-center gap-1">
            <Paperclip className="w-2.5 h-2.5" />Plantilla HSM
          </div>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
      )
    }
    return <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
  }

  if (isOutbound) {
    return (
      <div className="flex justify-end mb-2">
        <div className="max-w-[70%]">
          <SenderLabel senderType={message.sender_type} />
          <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm">
            {renderContent()}
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-[11px] text-indigo-200">{formatTime(message.created_at)}</span>
              <DeliveryIcon status={message.delivery_status} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start mb-2">
      <div className="max-w-[70%]">
        <div className="bg-white text-gray-800 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm border border-gray-100">
          {renderContent()}
          <div className="flex items-center justify-end mt-1">
            <span className="text-[11px] text-gray-400">{formatTime(message.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ChatView({ messages, loading }: { messages: ChatMessage[]; loading: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Group messages by date
  const grouped: { date: string; messages: ChatMessage[] }[] = []
  for (const msg of messages) {
    const date = formatDate(msg.created_at)
    const last = grouped[grouped.length - 1]
    if (last && last.date === date) {
      last.messages.push(msg)
    } else {
      grouped.push({ date, messages: [msg] })
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-400 rounded-full animate-spin" />
          <p className="text-sm">Cargando mensajes...</p>
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-2xl">💬</span>
          </div>
          <p className="text-sm font-medium">Sin mensajes aún</p>
          <p className="text-xs text-gray-400">Los mensajes de WhatsApp aparecerán aquí</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-4">
      {grouped.map(group => (
        <div key={group.date}>
          {/* Date separator */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2">{group.date}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          {group.messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
