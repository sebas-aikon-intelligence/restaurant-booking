'use client'

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { GripHorizontal, PauseCircle } from 'lucide-react';
import { Table } from '@/types';

interface TableNodeProps extends Table {
    isEditing?: boolean;
    onEdit?: () => void;
}

export function TableNode({ id, number, seats, position, isEditing, is_active, onEdit }: TableNodeProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        data: { id, number, seats },
        disabled: !isEditing,
    });

    // Calculate new position while dragging (visual only)
    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    // Actual absolute position on the canvas
    const absoluteStyle = {
        left: position?.x || 0,
        top: position?.y || 0,
    };

    return (
        <div
            ref={setNodeRef}
            style={{ ...absoluteStyle, ...style }}
            className={cn(
                "absolute flex flex-col items-center justify-center rounded-2xl bg-white shadow-xl transition-all border cursor-pointer",
                isDragging && "z-50 scale-105 shadow-2xl opacity-90",
                !is_active && "opacity-50 bg-gray-100 border-gray-400", // Paused state
                is_active && !isEditing && "hover:bg-green-50 border-green-200",
                is_active && isEditing && "border-border",
                "w-24 h-24" // Fixed size for now
            )}
            {...listeners}
            {...attributes}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onEdit?.();
            }}
        >
            {!is_active && (
                <div className="absolute -top-2 -right-2">
                    <PauseCircle size={20} className="text-destructive fill-white" />
                </div>
            )}

            <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 mb-1">
                <GripHorizontal size={12} className={cn(!isEditing && "hidden")} />
                <span>{seats}P</span>
            </div>
            <span className="text-xl font-bold font-mono">{number}</span>

            {/* Visual Status Indicator */}
            {is_active && (
                <div className={cn(
                    "absolute -bottom-2 h-4 w-4 rounded-full border-2 border-white",
                    "bg-green-500 shadow-sm" // Status: Free
                )} />
            )}
        </div>
    );
}
