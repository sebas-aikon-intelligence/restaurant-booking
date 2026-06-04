'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DEMO_DATA, MenuItem } from '@/lib/demo-data'
import { Table } from '@/types'
import { Search, ShoppingCart, ChevronLeft, CreditCard, ChefHat, Trash2, Plus, Minus } from 'lucide-react'

// Extended type for Cart Item
interface CartItem extends MenuItem {
    quantity: number
}

export default function POSPage() {
    const [selectedTable, setSelectedTable] = useState<Table | null>(null)
    const [cart, setCart] = useState<CartItem[]>([])
    const [activeCategory, setActiveCategory] = useState<string>('All')
    const [searchQuery, setSearchQuery] = useState('')

    // Table Selection View
    if (!selectedTable) {
        return (
            <div className="h-[calc(100vh-100px)] flex flex-col">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Point of Sale</h1>
                <p className="text-gray-500 mb-8">Select a table to start an order.</p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {DEMO_DATA.tables.map(table => (
                        <button
                            key={table.id}
                            onClick={() => setSelectedTable(table)}
                            className="bg-white border rounded-2xl p-8 hover:shadow-xl hover:border-primary transition-all text-center group flex flex-col items-center justify-center gap-4 h-48"
                        >
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-2xl font-bold text-gray-600 group-hover:bg-black group-hover:text-white transition-colors">
                                {table.number}
                            </div>
                            <div>
                                <span className="block text-lg font-bold text-gray-900">Table {table.number}</span>
                                <span className="text-sm text-gray-500">{table.seats} Seats</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    // POS View
    const filteredMenu = DEMO_DATA.menu.filter(item => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const categories = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks']

    const addToCart = (item: MenuItem) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id)
            if (existing) {
                return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
            }
            return [...prev, { ...item, quantity: 1 }]
        })
    }

    const removeFromCart = (itemId: string) => {
        setCart(prev => prev.filter(i => i.id !== itemId))
    }

    const updateQuantity = (itemId: string, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === itemId) {
                const newQty = Math.max(1, i.quantity + delta)
                return { ...i, quantity: newQty }
            }
            return i
        }))
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + tax

    return (
        <div className="flex h-[calc(100vh-120px)] -m-6 overflow-hidden">
            {/* Left: Menu & Categories */}
            <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                {/* Header */}
                <div className="bg-white p-4 border-b border-gray-200 flex items-center gap-4">
                    <Button variant="ghost" className="gap-2" onClick={() => setSelectedTable(null)}>
                        <ChevronLeft /> Change Table
                    </Button>
                    <div className="h-8 w-px bg-gray-200" />
                    <h2 className="font-bold text-lg">Order for Table {selectedTable.number}</h2>

                    <div className="flex-1 max-w-md ml-auto relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            placeholder="Search menu..."
                            className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="px-6 py-4 flex gap-3 overflow-x-auto bg-white border-b border-gray-200 shadow-sm z-10">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat
                                ? 'bg-black text-white shadow-md transform scale-105'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredMenu.map(item => (
                            <button
                                key={item.id}
                                onClick={() => addToCart(item)}
                                className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md hover:border-black/20 transition-all text-left flex flex-col h-full group"
                            >
                                <div className="aspect-video w-full rounded-lg bg-gray-100 mb-3 overflow-hidden relative">
                                    {item.image_url ? (
                                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                                    )}
                                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                                        ${item.price}
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 leading-tight mb-1">{item.name}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Cart/Order */}
            <div className="w-[400px] bg-white border-l border-gray-200 flex flex-col shadow-2xl z-20">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                        <ShoppingCart size={20} /> Current Order
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {cart.length === 0 ? (
                        <div className="text-center py-20 text-gray-400 flex flex-col items-center">
                            <ShoppingCart size={48} className="mb-4 opacity-20" />
                            <p>No items added yet</p>
                            <p className="text-sm">Select items from the menu to start</p>
                        </div>
                    ) : (
                        cart.map(item => (
                            <div key={item.id} className="flex gap-4 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                                    <p className="text-xs text-gray-500">${item.price} each</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-white rounded-lg border border-gray-200">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                    <span className="font-bold w-12 text-right">${item.price * item.quantity}</span>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-gray-400 hover:text-red-500 ml-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer Section */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 space-y-4">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                            <span>Tax (10%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl h-12 gap-2"
                            disabled={cart.length === 0}
                        >
                            <ChefHat size={18} /> To Kitchen
                        </Button>
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-12 gap-2"
                            disabled={cart.length === 0}
                        >
                            <CreditCard size={18} /> Checkout
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
