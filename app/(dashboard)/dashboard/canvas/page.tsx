'use client'

import React, { useState, useRef, useEffect } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { Plus, Save, Loader2, ZoomIn, ZoomOut, Move, GripHorizontal, PauseCircle, MousePointer2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableNode } from '@/components/canvas/table-node'
import { Table, Zone } from '@/types'
import { DEMO_DATA } from '@/lib/demo-data'
import { EditTableModal } from '@/components/canvas/edit-table-modal'

export default function CanvasPage() {
    // Local state for demo mode (initialized empty for hydration safety)
    const [tables, setTables] = useState<Table[]>([])
    const [mounted, setMounted] = useState(false)
    const [zones, setZones] = useState<Zone[]>([{ id: 'z1', name: 'Main Hall', org_id: 'demo', created_at: '' }])
    const [selectedZone, setSelectedZone] = useState<string>('z1')

    useEffect(() => {
        setMounted(true)
        setTables(DEMO_DATA.tables as unknown as Table[])
    }, [])

    // UI State
    const [isSaving, setIsSaving] = useState(false)
    const [isEditMode, setIsEditMode] = useState(true) // Default to edit mode
    const [zoom, setZoom] = useState(1)
    const [isPanning, setIsPanning] = useState(false)
    const [panStart, setPanStart] = useState({ x: 0, y: 0 })
    const [viewportOffset, setViewportOffset] = useState({ x: 0, y: 0 })
    const [editingTable, setEditingTable] = useState<Table | null>(null)

    if (!mounted) return <div className="p-8">Loading canvas...</div>

    // Canvas panning logic
    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.button === 1 || (e.button === 0 && e.shiftKey)) { // Middle click or Shift+Click
            setIsPanning(true)
            setPanStart({ x: e.clientX - viewportOffset.x, y: e.clientY - viewportOffset.y })
            e.preventDefault()
        }
    }

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setViewportOffset({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
            })
        }
    }

    const handleCanvasMouseUp = () => setIsPanning(false)

    // Zoom logic
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            const delta = e.deltaY > 0 ? -0.1 : 0.1
            setZoom(prev => Math.min(Math.max(prev + delta, 0.25), 3))
            e.preventDefault()
        }
    }

    // Drag and Drop Logic
    function handleDragEnd(event: DragEndEvent) {
        const { active, delta } = event

        setTables((prev) =>
            prev.map((table) => {
                if (table.id === active.id) {
                    // Calculate new position considering zoom
                    const newX = table.position.x + (delta.x / zoom)
                    const newY = table.position.y + (delta.y / zoom)

                    return {
                        ...table,
                        position: {
                            ...table.position,
                            x: Math.round(newX / 20) * 20, // Snap to grid (20px)
                            y: Math.round(newY / 20) * 20
                        }
                    }
                }
                return table
            })
        )
    }

    // Add Table (Mock)
    function handleAddTable() {
        const newTable: Table = {
            id: `temp-${Date.now()}`,
            org_id: 'demo',
            zone_id: selectedZone,
            number: `T${tables.length + 1}`,
            seats: 4,
            position: { x: 400, y: 300, rotation: 0, shape: 'rect' },
            is_active: true,
            created_at: new Date().toISOString()
        }
        setTables([...tables, newTable])
    }

    // Save Layout (Mock)
    function handleSaveLayout() {
        setIsSaving(true)
        setTimeout(() => {
            setIsSaving(false)
            alert("Layout saved! (Demo Mode)")
        }, 800)
    }

    // Update Table (Mock)
    function handleUpdateTable(updates: Partial<Table>) {
        if (!editingTable) return

        setTables(prev => prev.map(t =>
            t.id === editingTable.id
                ? { ...t, ...updates }
                : t
        ))
        setEditingTable(null)
    }

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] flex flex-col relative overflow-hidden bg-[#F8F9FA] rounded-3xl border border-gray-200 shadow-sm">

            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex gap-2 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-100">
                <div className="flex items-center gap-1 border-r border-gray-200 pr-2 mr-1">
                    <span className="text-xs font-bold px-2 text-gray-500 uppercase tracking-wider">Main Floor</span>
                    <Button
                        variant={isEditMode ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 text-xs"
                        onClick={() => setIsEditMode(true)}
                    >
                        Edit
                    </Button>
                    <Button
                        variant={!isEditMode ? "secondary" : "ghost"}
                        size="sm"
                        className="h-8 text-xs bg-gray-100"
                        onClick={() => setIsEditMode(false)}
                    >
                        Live
                    </Button>
                </div>

                <Button variant="secondary" size="sm" onClick={() => setZoom(z => Math.max(z - 0.1, 0.25))}>
                    <ZoomOut size={16} />
                </Button>
                <div className="flex items-center px-2 min-w-[3rem] justify-center font-mono text-xs">
                    {Math.round(zoom * 100)}%
                </div>
                <Button variant="secondary" size="sm" onClick={() => setZoom(z => Math.min(z + 0.1, 3))}>
                    <ZoomIn size={16} />
                </Button>

                <div className="w-px bg-gray-200 mx-1" />

                <Button
                    variant="primary"
                    onClick={handleAddTable}
                    className="gap-2 bg-black text-white hover:bg-gray-800 transition-all font-medium"
                >
                    <Plus size={16} /> Add Table
                </Button>

                <Button
                    variant="secondary"
                    onClick={handleSaveLayout}
                    disabled={isSaving}
                    className="gap-2"
                >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                </Button>
            </div>

            {/* Hint Overlay */}
            <div className="absolute bottom-4 left-4 z-10 text-xs text-gray-400 pointer-events-none select-none bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
                Hold Shift + Drag to pan • Scroll to zoom • Double click to edit
            </div>

            {/* Canvas Area */}
            <div
                className={`w-full h-full relative overflow-hidden cursor-${isPanning ? 'grabbing' : 'default'}`}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onWheel={handleWheel}
            >
                <DndContext onDragEnd={handleDragEnd}>
                    <div
                        style={{
                            transform: `translate(${viewportOffset.x}px, ${viewportOffset.y}px) scale(${zoom})`,
                            transformOrigin: '0 0',
                            width: '100%',
                            height: '100%',
                            transition: isPanning ? 'none' : 'transform 0.1s ease-out'
                        }}
                    >
                        {/* Grid Background */}
                        <div
                            className="absolute inset-[-200%] w-[500%] h-[500%] pointer-events-none opacity-20"
                            style={{
                                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                                backgroundSize: '40px 40px'
                            }}
                        />

                        {/* Drop Zone */}
                        <div className="w-full h-full absolute inset-0">
                            {tables.map(table => (
                                <TableNode
                                    key={table.id}
                                    {...table}
                                    isEditing={isEditMode}
                                    onEdit={() => setEditingTable(table)}
                                />
                            ))}
                        </div>
                    </div>
                </DndContext>
            </div>

            {editingTable && (
                <EditTableModal
                    table={editingTable}
                    onClose={() => setEditingTable(null)}
                    onSave={handleUpdateTable}
                />
            )}
        </div>
    )
}
