'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Edit2, Trash2, Tag, UtensilsCrossed } from 'lucide-react'
import { DEMO_DATA, MenuItem } from '@/lib/demo-data'
import { AddMenuItemModal } from '@/components/menu/add-menu-item-modal'

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>(DEMO_DATA.menu)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('All')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)

    // Categories for filter
    const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks']

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    const handleAddItem = (newItem: Omit<MenuItem, 'id'>) => {
        const item: MenuItem = {
            ...newItem,
            id: `new-${Date.now()}`, // Simple ID generation
        }
        setMenuItems([item, ...menuItems])
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Menu Management</h1>
                    <p className="text-gray-500">Manage your restaurant's food and drinks.</p>
                </div>
                <Button
                    className="gap-2 bg-black text-white hover:bg-gray-800"
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <Plus size={16} /> Add Item
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-col md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search items..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${categoryFilter === cat
                                ? 'bg-primary text-black bg-gray-200'
                                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Menu List */}
            <div className="grid grid-cols-1 gap-4">
                {filteredItems.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 transition-all hover:shadow-md">
                        {/* Image */}
                        <div className="h-24 w-24 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                            {item.image_url ? (
                                <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-gray-400">
                                    <UtensilsCrossed size={24} />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                                        <Tag size={10} className="mr-1" /> {item.category}
                                    </span>
                                </div>
                                <span className="font-bold text-lg">${item.price}</span>
                            </div>

                            <p className="text-gray-500 text-sm mt-2 line-clamp-2">{item.description}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2 justify-center border-l pl-4 ml-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary">
                                <Edit2 size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500">
                                <Trash2 size={16} />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Item Modal */}
            {isAddModalOpen && (
                <AddMenuItemModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddItem}
                />
            )}
        </div>
    )
}
