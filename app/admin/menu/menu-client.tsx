'use client'

import { useState } from 'react'
import { UtensilsCrossed, Plus, Trash2, X, Loader2, Star, Eye, EyeOff, Edit2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/ui/image-upload'

type Category = { id: string; name: string; sort_order: number }
type MenuItem = {
  id: string; name: string; description?: string; price?: number;
  image_url?: string; is_active: boolean; is_featured: boolean;
  category_id?: string; sort_order: number
}

export default function MenuClient({
  categories: initCats,
  items: initItems,
  orgId
}: {
  categories: Category[]
  items: MenuItem[]
  orgId: string | null
}) {
  const [categories, setCategories] = useState(initCats)
  const [items, setItems] = useState(initItems)
  const [activeCategory, setActiveCategory] = useState<string | null>(initCats[0]?.id ?? 'all')
  const [showCatModal, setShowCatModal] = useState(false)
  const [showItemModal, setShowItemModal] = useState(false)
  const [editItem, setEditItem] = useState<MenuItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [catName, setCatName] = useState('')
  const [itemForm, setItemForm] = useState({
    name: '', description: '', price: '', category_id: initCats[0]?.id ?? '', is_featured: false
  })

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter(i => i.category_id === activeCategory)

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    setIsSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('menu_categories')
      .insert({ org_id: orgId, name: catName, sort_order: categories.length })
      .select().single()
    if (data) { setCategories(prev => [...prev, data]); setActiveCategory(data.id) }
    setShowCatModal(false); setCatName(''); setIsSaving(false)
  }

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orgId) return
    setIsSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('menu_items').insert({
      org_id: orgId,
      name: itemForm.name,
      description: itemForm.description || null,
      price: itemForm.price ? parseFloat(itemForm.price) : null,
      image_url: imageUrl || null,
      category_id: itemForm.category_id || null,
      is_featured: itemForm.is_featured,
      is_active: true,
      sort_order: items.length
    }).select().single()
    if (data) setItems(prev => [...prev, data])
    setShowItemModal(false)
    setItemForm({ name: '', description: '', price: '', category_id: categories[0]?.id ?? '', is_featured: false })
    setImageUrl(null)
    setIsSaving(false)
  }

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editItem) return
    setIsSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('menu_items').update({
      name: itemForm.name,
      description: itemForm.description || null,
      price: itemForm.price ? parseFloat(itemForm.price) : null,
      image_url: imageUrl || null,
      category_id: itemForm.category_id || null,
      is_featured: itemForm.is_featured,
    }).eq('id', editItem.id).select().single()
    if (data) setItems(prev => prev.map(i => i.id === editItem.id ? data : i))
    setEditItem(null); setImageUrl(null); setIsSaving(false)
  }

  const toggleActive = async (item: MenuItem) => {
    const supabase = createClient()
    await supabase.from('menu_items').update({ is_active: !item.is_active }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_active: !i.is_active } : i))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return
    const supabase = createClient()
    await supabase.from('menu_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const openEdit = (item: MenuItem) => {
    setEditItem(item)
    setItemForm({ name: item.name, description: item.description ?? '', price: item.price?.toString() ?? '', category_id: item.category_id ?? '', is_featured: item.is_featured })
    setImageUrl(item.image_url ?? null)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="w-5 h-5 text-gray-700" />
          <h1 className="text-lg font-semibold text-gray-900">Menú</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowCatModal(true)}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            <Plus className="w-4 h-4" /> Categoría
          </button>
          <button onClick={() => { setImageUrl(null); setShowItemModal(true) }}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition">
            <Plus className="w-4 h-4" /> Producto
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Categories sidebar */}
        <div className="w-52 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-3 space-y-0.5 overflow-y-auto">
            <button
              onClick={() => setActiveCategory('all')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeCategory === 'all' ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Todos ({items.length})
            </button>
            {categories.map(c => (
              <div key={c.id} className="group flex items-center justify-between">
                <button
                  onClick={() => setActiveCategory(c.id)}
                  className={`flex-1 text-left px-3 py-2.5 rounded-xl text-sm font-medium transition ${activeCategory === c.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {c.name} <span className={`text-xs ${activeCategory === c.id ? 'text-white/60' : 'text-gray-400'}`}>
                    ({items.filter(i => i.category_id === c.id).length})
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Items grid */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <UtensilsCrossed className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-medium">Sin productos</p>
              <p className="text-sm">Agrega tu primer plato o bebida.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className={`bg-white rounded-2xl border border-gray-200 p-5 transition hover:shadow-sm ${!item.is_active ? 'opacity-50' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {item.is_featured && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                      <h3 className="font-semibold text-gray-900 text-sm">{item.name}</h3>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toggleActive(item)} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400">
                        {item.is_active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => openEdit(item)} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {item.description && <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>}
                  <div className="flex items-center justify-between">
                    {item.price != null ? (
                      <span className="text-sm font-semibold text-gray-900">${item.price.toFixed(2)}</span>
                    ) : (
                      <span className="text-xs text-gray-400">Sin precio</span>
                    )}
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                      {categories.find(c => c.id === item.category_id)?.name ?? 'Sin categoría'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold">Nueva Categoría</h2>
              <button onClick={() => setShowCatModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateCategory} className="px-6 py-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Nombre *</label>
                <input required value={catName} onChange={e => setCatName(e.target.value)} placeholder="Ej. Entradas, Bebidas..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCatModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {(showItemModal || editItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold">{editItem ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => { setShowItemModal(false); setEditItem(null) }}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={editItem ? handleUpdateItem : handleCreateItem} className="px-6 py-5 space-y-4">
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                path={`${orgId}/menu/${editItem?.id ?? 'new-' + Date.now()}`}
                aspect="landscape"
                label="Foto del producto"
                hint="Recomendado: 800×600px."
              />
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Nombre *</label>
                <input required value={itemForm.name} onChange={e => setItemForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">Descripción</label>
                <textarea value={itemForm.description} onChange={e => setItemForm(p => ({ ...p, description: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Precio</label>
                  <input type="number" step="0.01" min="0" value={itemForm.price} onChange={e => setItemForm(p => ({ ...p, price: e.target.value }))}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">Categoría</label>
                  <select value={itemForm.category_id} onChange={e => setItemForm(p => ({ ...p, category_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-black bg-white">
                    <option value="">Sin categoría</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={itemForm.is_featured} onChange={e => setItemForm(p => ({ ...p, is_featured: e.target.checked }))}
                  className="rounded" />
                <span className="text-sm text-gray-700 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" /> Producto destacado
                </span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowItemModal(false); setEditItem(null) }}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
                <button type="submit" disabled={isSaving}
                  className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-60 flex items-center justify-center gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editItem ? 'Guardar' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
