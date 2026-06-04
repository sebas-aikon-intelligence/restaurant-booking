'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Table } from '@/types'

export async function getTables(): Promise<Table[]> {
    const supabase = await createClient()

    // Get current user's org
    const { data: profile } = await supabase.from('profiles').select('org_id').single()
    if (!profile?.org_id) return []

    // Ideally filter by Zone, but fetching all for MVP
    const { data: tables, error } = await supabase
        .from('tables')
        .select('*')
        .eq('org_id', profile.org_id)
        .order('created_at')

    if (error) {
        console.error('Error fetching tables:', error)
        return []
    }

    // Parse JSONB position safely
    return tables.map(t => ({
        ...t,
        position: typeof t.position === 'string' ? JSON.parse(t.position) : t.position
    })) as Table[]
}

export async function saveTableLayout(tables: Table[]) {
    const supabase = await createClient()

    // Optimistic updates are handled in client, this persists final state
    const updates = tables.map(t => ({
        id: t.id,
        org_id: t.org_id,
        zone_id: t.zone_id,
        number: t.number,
        seats: t.seats,
        position: t.position
    }))

    const { error } = await supabase
        .from('tables')
        .upsert(updates)

    if (error) {
        console.error('Error saving layout:', error)
        throw new Error('Failed to save layout')
    }

    revalidatePath('/dashboard/canvas')
}

export async function updateTable(tableId: string, updates: Partial<Table>) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('tables')
        .update({
            number: updates.number,
            seats: updates.seats,
            is_active: updates.is_active
        })
        .eq('id', tableId)

    if (error) {
        console.error('Error updating table:', error)
        throw new Error('Failed to update table')
    }

    revalidatePath('/dashboard/canvas')
}

export async function createTable() {
    const supabase = await createClient()

    // 1. Get Org from Profile
    const { data: profile } = await supabase.from('profiles').select('org_id').single()
    if (!profile?.org_id) throw new Error("No Organization found")

    // 2. Get Default Zone (First one)
    let { data: zones } = await supabase.from('zones').select('id').eq('org_id', profile.org_id).limit(1)

    let zoneId: string;

    if (!zones || zones.length === 0) {
        // Auto-create default zone if none exists
        const { data: newZone, error: zoneError } = await supabase
            .from('zones')
            .insert({ org_id: profile.org_id, name: 'Main Hall' })
            .select('id')
            .single()

        if (zoneError) {
            console.error("Error creating default zone:", zoneError)
            throw new Error("Failed to create default zone")
        }
        zoneId = newZone.id
    } else {
        zoneId = zones[0].id
    }

    // 3. Generate a simple Table Number (Count + 1 strategy)
    const { count } = await supabase.from('tables').select('*', { count: 'exact', head: true }).eq('zone_id', zoneId)
    const nextNum = `T${(count || 0) + 1}`

    // 4. Calculate position in a grid (3 columns)
    const tableIndex = count || 0
    const col = tableIndex % 3
    const row = Math.floor(tableIndex / 3)
    const gridSpacing = 200
    const position = {
        x: 150 + col * gridSpacing,
        y: 150 + row * gridSpacing,
        rotation: 0,
        shape: 'rect' as const
    }

    // 5. Insert Table
    const { data, error } = await supabase
        .from('tables')
        .insert({
            org_id: profile.org_id,
            zone_id: zoneId,
            number: nextNum, // e.g. T5
            seats: 4,
            position: position,
            is_active: true
        })
        .select()
        .single()

    if (error) throw error
    revalidatePath('/dashboard/canvas')

    // Return formatted for client
    return {
        ...data,
        position: typeof data.position === 'string' ? JSON.parse(data.position) : data.position
    } as Table
}
