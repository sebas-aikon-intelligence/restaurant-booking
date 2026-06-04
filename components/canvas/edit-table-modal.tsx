'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X } from 'lucide-react'
import { Table } from '@/types'

interface EditTableModalProps {
    table: Table
    onClose: () => void
    onSave: (updates: Partial<Table>) => void
}

export function EditTableModal({ table, onClose, onSave }: EditTableModalProps) {
    const [number, setNumber] = useState(table.number)
    const [seats, setSeats] = useState(table.seats)
    const [isActive, setIsActive] = useState(table.is_active)

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        onSave({
            number,
            seats: Number(seats),
            is_active: isActive
        })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Edit Table</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Table Number</label>
                        <Input
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            placeholder="T1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Seats</label>
                        <Input
                            type="number"
                            min="1"
                            max="20"
                            value={seats}
                            onChange={(e) => setSeats(Number(e.target.value))}
                            required
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="is_active" className="text-sm font-medium">
                            Table is Active {!isActive && <span className="text-destructive">(Paused)</span>}
                        </label>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1">
                            Save Changes
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
