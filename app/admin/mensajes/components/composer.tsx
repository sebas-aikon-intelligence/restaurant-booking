'use client'

import { useState, useRef } from 'react'
import {
  Send, Paperclip, Smile, Zap, LayoutTemplate, Mic,
  ChevronDown, X, Image as ImageIcon, FileText, Volume2
} from 'lucide-react'
import type { QuickReply, MessageTemplate } from '@/lib/types/crm'

type MessageType = 'text' | 'image' | 'document' | 'audio' | 'template'

export function Composer({
  conversationId,
  windowExpired,
  quickReplies,
  templates,
  onSend,
}: {
  conversationId: string
  windowExpired: boolean
  quickReplies: QuickReply[]
  templates: MessageTemplate[]
  onSend: (content: string, type?: MessageType, mediaUrl?: string) => Promise<void>
}) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [quickSearch, setQuickSearch] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSend = async () => {
    const msg = text.trim()
    if (!msg || sending) return
    setSending(true)
    setText('')
    await onSend(msg, 'text')
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const applyQuickReply = (qr: QuickReply) => {
    setText(qr.content)
    setShowQuickReplies(false)
    setQuickSearch('')
  }

  const applyTemplate = async (tmpl: MessageTemplate) => {
    setSending(true)
    setShowTemplates(false)
    await onSend(tmpl.content, 'template')
    setSending(false)
  }

  const filteredQR = quickReplies.filter(qr =>
    !quickSearch || qr.name.toLowerCase().includes(quickSearch.toLowerCase()) ||
    qr.content.toLowerCase().includes(quickSearch.toLowerCase())
  )

  if (windowExpired) {
    return (
      <div className="border-t border-gray-200 bg-amber-50 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 bg-amber-500 rounded-full" />
            Ventana de 24h expirada. Solo puedes enviar plantillas HSM aprobadas.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {templates.filter(t => t.status === 'APPROVED').map(tmpl => (
            <button
              key={tmpl.id}
              onClick={() => applyTemplate(tmpl)}
              disabled={sending}
              className="px-3 py-1.5 bg-white border border-amber-300 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-50 transition disabled:opacity-60"
            >
              {tmpl.name}
            </button>
          ))}
          {templates.filter(t => t.status === 'APPROVED').length === 0 && (
            <p className="text-xs text-amber-600">No hay plantillas aprobadas disponibles.</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-gray-200 bg-white">
      {/* Quick replies overlay */}
      {showQuickReplies && (
        <div className="border-b border-gray-100 px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-indigo-500" />
              Respuestas Rápidas
            </p>
            <button onClick={() => setShowQuickReplies(false)}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <input
            value={quickSearch}
            onChange={e => setQuickSearch(e.target.value)}
            placeholder="Buscar respuesta..."
            className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-lg mb-2 focus:outline-none focus:border-indigo-400"
          />
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {filteredQR.map(qr => (
              <button
                key={qr.id}
                onClick={() => applyQuickReply(qr)}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-white transition text-xs"
              >
                <p className="font-semibold text-gray-700">/{qr.name}</p>
                <p className="text-gray-500 truncate">{qr.content}</p>
              </button>
            ))}
            {filteredQR.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">Sin resultados</p>
            )}
          </div>
        </div>
      )}

      {/* Templates overlay */}
      {showTemplates && (
        <div className="border-b border-gray-100 px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600 flex items-center gap-1">
              <LayoutTemplate className="w-3.5 h-3.5 text-purple-500" />
              Plantillas HSM
            </p>
            <button onClick={() => setShowTemplates(false)}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {templates.map(tmpl => (
              <button
                key={tmpl.id}
                onClick={() => applyTemplate(tmpl)}
                disabled={sending || tmpl.status !== 'APPROVED'}
                className="w-full text-left px-3 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 transition disabled:opacity-50"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-xs text-gray-700">{tmpl.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    tmpl.status === 'APPROVED' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{tmpl.status}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{tmpl.content}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main input area */}
      <div className="px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Attachment options */}
          <div className="flex gap-1 pb-1">
            <button
              onClick={() => fileRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              title="Adjuntar archivo"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowQuickReplies(!showQuickReplies)}
              className={`p-2 rounded-lg transition ${showQuickReplies ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              title="Respuestas rápidas"
            >
              <Zap className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className={`p-2 rounded-lg transition ${showTemplates ? 'text-purple-600 bg-purple-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
              title="Plantillas"
            >
              <LayoutTemplate className="w-4 h-4" />
            </button>
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje... (Enter para enviar)"
              rows={1}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-indigo-400 resize-none max-h-32 overflow-y-auto placeholder:text-gray-400"
              style={{ minHeight: '42px' }}
            />
          </div>

          {/* Send / Mic button */}
          {text.trim() ? (
            <button
              onClick={handleSend}
              disabled={sending}
              className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition disabled:opacity-60 flex-shrink-0 mb-0.5"
            >
              <Send className="w-4 h-4" />
            </button>
          ) : (
            <button
              className="p-2.5 bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition flex-shrink-0 mb-0.5"
              title="Grabar audio"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*,audio/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={() => { /* handle upload */ }}
      />
    </div>
  )
}
