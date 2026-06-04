'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Mail, Phone, MoreHorizontal, User } from 'lucide-react'
import { DEMO_DATA, Staff } from '@/lib/demo-data'

export default function StaffPage() {
    const [staffMembers, setStaffMembers] = useState<Staff[]>(DEMO_DATA.staff)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('All')

    // Roles for filter
    const roles = ['All', 'Manager', 'Head Chef', 'Waiter', 'Bartender', 'Host']

    const filteredStaff = staffMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === 'All' || member.role === roleFilter
        return matchesSearch && matchesRole
    })

    const getStatusColor = (status: Staff['status']) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-700'
            case 'On Leave': return 'bg-yellow-100 text-yellow-700'
            case 'Inactive': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Staff Management</h1>
                    <p className="text-gray-500">Manage your restaurant team and roles.</p>
                </div>
                <Button className="gap-2 bg-black text-white hover:bg-gray-800">
                    <Plus size={16} /> Add Member
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 flex-col md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        placeholder="Search staff by name or email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {roles.map(role => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${roleFilter === role
                                ? 'bg-primary text-black bg-gray-200'
                                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Staff Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredStaff.map((member) => (
                    <div key={member.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                        {/* More Options */}
                        <button className="absolute top-4 right-4 text-gray-300 hover:text-gray-600">
                            <MoreHorizontal size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-3">
                            {/* Avatar */}
                            <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden ring-4 ring-white shadow-sm">
                                {member.avatar_url ? (
                                    <img src={member.avatar_url} alt={member.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                        <User size={32} />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                                <div className="mt-1 flex items-center justify-center gap-2">
                                    <span className="text-sm text-gray-500 font-medium">{member.role}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-bold ${getStatusColor(member.status)}`}>
                                        {member.status}
                                    </span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-full border-t border-gray-100 my-2" />

                            {/* Contact */}
                            <div className="w-full space-y-2 text-sm">
                                <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-50">
                                    <Mail size={14} />
                                    <span className="truncate">{member.email}</span>
                                </a>
                                <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors p-2 rounded-md hover:bg-gray-50">
                                    <Phone size={14} />
                                    <span>{member.phone}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
