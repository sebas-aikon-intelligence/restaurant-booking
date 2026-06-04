'use client'

import React, { useState } from 'react'
import { X, Upload, DollarSign, Tag, AlignLeft, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MenuItem } from '@/lib/demo-data'

interface AddMenuItemModalProps {
    onClose: () => void
    onSave: (item: Omit<MenuItem, 'id'>) => void
}

export function AddMenuItemModal({ onClose, onSave }: AddMenuItemModalProps) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [category, setCategory] = useState<MenuItem['category']>('Mains')
    const [imageUrl, setImageUrl] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        onSave({
            name,
            description,
            price: Number(price),
            category,
            image_url: imageUrl,
            is_available: true
        })
        onClose()
    }

    const categories: MenuItem['category'][] = ['Starters', 'Mains', 'Desserts', 'Drinks']

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-bold">Add New Item</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X size={18} />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Name */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Type size={12} /> Name
                        </label>
                        <Input
                            placeholder="e.g. Lobster Risotto"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-gray-50"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <AlignLeft size={12} /> Description
                        </label>
                        <textarea
                            placeholder="Describe the dish..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" // Tailwind classes matching Input but for textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Price */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <DollarSign size={12} /> Price
                            </label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                className="bg-gray-50"
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <Tag size={12} /> Category
                            </label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={category}
                                onChange={(e) => setCategory(e.target.value as MenuItem['category'])}
                            >
                                {categories.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Image URL */}
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <Upload size={12} /> Image URL (Optional)
                        </label>
                        <Input
                            placeholder="https://..."
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="bg-gray-50"
                        />
                    </div>


                    <div className="pt-2 flex gap-2">
                        <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-black text-white hover:bg-gray-800">
                            Add Item
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
