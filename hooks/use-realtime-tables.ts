'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Table } from '@/types'

export function useRealtimeTables(
    initialTables: Table[],
    setTables: React.Dispatch<React.SetStateAction<Table[]>>,
    isEditing: boolean
) {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        const channel = supabase
            .channel('realtime_tables')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen to INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'tables',
                },
                (payload) => {
                    // console.log('Realtime Event:', payload)

                    if (payload.eventType === 'UPDATE') {
                        // Update local state "optimistically" from remote
                        // But if I'm editing, I might ignore this to avoid jitter? 
                        // For now, let's sync everything.
                        const newTable = payload.new as Table
                        setTables((currentTables) =>
                            currentTables.map(t => t.id === newTable.id ? { ...t, ...newTable } : t)
                        )
                    } else if (payload.eventType === 'INSERT') {
                        const rawTable = payload.new as any
                        const parsedTable: Table = {
                            ...rawTable,
                            position: typeof rawTable.position === 'string'
                                ? JSON.parse(rawTable.position)
                                : rawTable.position
                        }
                        setTables((current) => [...current, parsedTable])
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, setTables])
}
