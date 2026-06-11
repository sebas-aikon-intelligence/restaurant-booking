'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Loader2, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type AspectRatio = 'square' | 'landscape' | 'cover' | 'wide'

const ASPECT: Record<AspectRatio, string> = {
  square:    'aspect-square',
  landscape: 'aspect-[4/3]',
  cover:     'aspect-[16/6]',
  wide:      'aspect-[16/9]',
}

export function ImageUpload({
  value,
  onChange,
  path,
  aspect = 'square',
  label,
  hint,
  bucket = 'restaurant-media',
}: {
  value?: string | null
  onChange: (url: string | null) => void
  path: string          // e.g. 'cb27f789/menu/item-123'
  aspect?: AspectRatio
  label?: string
  hint?: string
  bucket?: string
}) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const upload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    const ext      = file.name.split('.').pop() ?? 'jpg'
    const filePath = `${path}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true })
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath)
      onChange(`${publicUrl}?t=${Date.now()}`)
    }
    setUploading(false)
  }, [bucket, path, onChange, supabase])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) upload(f)
  }

  return (
    <div className="space-y-1.5">
      {label && <p className="text-xs font-medium text-gray-600">{label}</p>}
      <div
        className={`relative ${ASPECT[aspect]} rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group ${
          dragOver   ? 'border-black bg-gray-50 scale-[1.01]' :
          value      ? 'border-gray-200' :
                       'border-gray-200 hover:border-gray-400 bg-gray-50'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !value && inputRef.current?.click()}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" className="w-full h-full object-cover" />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                className="bg-white text-black text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                Cambiar
              </button>
              <button
                type="button"
                onClick={e => { e.stopPropagation(); onChange(null) }}
                className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition"
              >
                Quitar
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition p-4">
            {uploading
              ? <Loader2 className="w-6 h-6 animate-spin" />
              : <><Upload className="w-6 h-6" /><span className="text-xs text-center">Click o arrastra una imagen<br/><span className="text-gray-300">JPG, PNG, WEBP · max 10MB</span></span></>
            }
          </div>
        )}
        {/* Upload progress overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-gray-600" />
          </div>
        )}
      </div>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }}
      />
    </div>
  )
}
