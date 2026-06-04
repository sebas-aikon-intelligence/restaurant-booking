'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Calendar, Clock, Users, CheckCircle2, XCircle, UserCheck, Phone, LayoutGrid } from 'lucide-react'
import { DEMO_DATA, Reservation } from '@/lib/demo-data'

export default function HostPage() {
    const [reservations, setReservations] = useState<Reservation[]>(DEMO_DATA.reservations)
    const [searchTerm, setSearchTerm] = useState('')
    const [activeTab, setActiveTab] = useState<'upcoming' | 'seated' | 'monitoring'>('upcoming')

    // Filter logic
    const filteredReservations = reservations.filter(res => {
        const matchesSearch = res.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            res.id.includes(searchTerm)

        if (activeTab === 'upcoming') {
            return matchesSearch && (res.status === 'pending' || res.status === 'confirmed')
        } else if (activeTab === 'seated') {
            return matchesSearch && (res.status === 'seated')
        }
        return matchesSearch
    })

    const handleStatusChange = (id: string, newStatus: Reservation['status']) => {
        setReservations(reservations.map(res =>
            res.id === id ? { ...res, status: newStatus } : res
        ))
    }

    const getStatusColor = (status: Reservation['status']) => {
        switch (status) {
            case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200'
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
            case 'seated': return 'bg-green-100 text-green-700 border-green-200'
            case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200'
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Host Station</h1>
                    <p className="text-gray-500">Manage reservations and table assignments.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white p-2 rounded-lg border shadow-sm flex items-center gap-3 px-4">
                        <div className="text-center">
                            <span className="block text-xs text-gray-400 font-bold uppercase">Expected</span>
                            <span className="text-lg font-bold">24</span>
                        </div>
                        <div className="w-px h-8 bg-gray-100"></div>
                        <div className="text-center">
                            <span className="block text-xs text-gray-400 font-bold uppercase">Seated</span>
                            <span className="text-lg font-bold text-green-600">8</span>
                        </div>
                        <div className="w-px h-8 bg-gray-100"></div>
                        <div className="text-center">
                            <span className="block text-xs text-gray-400 font-bold uppercase">Open</span>
                            <span className="text-lg font-bold text-blue-600">4</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Interface */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left Panel: Reservations List */}
                <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50/50">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <Input
                                placeholder="Search guest name or reservation ID..."
                                className="pl-10 bg-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-gray-200 rounded-lg p-1 gap-1">
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'upcoming' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Arrivals
                            </button>
                            <button
                                onClick={() => setActiveTab('seated')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'seated' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Seated
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {filteredReservations.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <Users size={48} className="mx-auto mb-4 opacity-50" />
                                <p>No reservations found for this filter.</p>
                            </div>
                        ) : (
                            filteredReservations.map(res => (
                                <div key={res.id} className="group bg-white border border-gray-100 rounded-xl p-4 hover:border-primary/50 hover:shadow-md transition-all relative">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-lg font-bold text-gray-600">
                                                {res.party_size}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 leading-tight">{res.customer_name}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                                    <Clock size={14} />
                                                    <span>{res.reservation_time}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] border uppercase tracking-wider font-bold ${getStatusColor(res.status)}`}>
                                                        {res.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {activeTab === 'upcoming' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => handleStatusChange(res.id, 'cancelled')}
                                                    >
                                                        <XCircle size={18} className="mr-1" /> No Show
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => handleStatusChange(res.id, 'seated')}
                                                    >
                                                        <UserCheck size={18} className="mr-1" /> Seat Guest
                                                    </Button>
                                                </>
                                            )}
                                            {activeTab === 'seated' && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleStatusChange(res.id, 'completed')}
                                                >
                                                    <CheckCircle2 size={18} className="mr-1" /> Finish
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {res.notes && (
                                        <div className="mt-3 bg-yellow-50 text-yellow-800 text-sm px-3 py-2 rounded-lg border border-yellow-100 inline-block">
                                            Note: {res.notes}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Floor Overview (Mini) */}
                <div className="w-1/3 bg-gray-900 rounded-2xl p-6 text-white flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <LayoutGrid /> Floor Status
                        </h2>
                        <span className="text-sm text-gray-400">Live View</span>
                    </div>

                    <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-4 relative">
                        {/* Placeholder for visual map - Simple Grid for now */}
                        <div className="grid grid-cols-2 gap-4">
                            {DEMO_DATA.tables.map(table => (
                                <div
                                    key={table.id}
                                    className={`p-4 rounded-xl border flex flex-col items-center justify-center aspect-square transition-all ${table.is_active
                                            ? 'bg-green-500/10 border-green-500/30 text-green-400'
                                            : 'bg-red-500/10 border-red-500/30 text-red-400'
                                        }`}
                                >
                                    <span className="text-2xl font-bold mb-1">{table.number}</span>
                                    <span className="text-xs uppercase tracking-widest opacity-70">
                                        {table.is_active ? 'Available' : 'Occupied'}
                                    </span>
                                    <span className="mt-2 text-xs flex items-center gap-1 opacity-50">
                                        <Users size={12} /> {table.seats}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
