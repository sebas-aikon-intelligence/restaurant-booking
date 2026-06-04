'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getRestaurantSettings() {
    const supabase = await createClient()

    const { data: profiles } = await supabase
        .from('profiles')
        .select('org_id')
        .order('created_at', { ascending: false })
        .limit(1)

    if (!profiles || profiles.length === 0 || !profiles[0]?.org_id) {
        return null
    }

    const { data: org, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', profiles[0].org_id)
        .maybeSingle()

    if (error) {
        console.error('Error fetching organization:', error)
        return null
    }

    return org
}

export async function updateRestaurantSettings(updates: {
    name?: string
    slug?: string
    logo_url?: string
    cover_image_url?: string
    gallery_urls?: string[]
    primary_color?: string
    secondary_color?: string
    description?: string
}) {
    const supabase = await createClient()

    // Get user's profile (use first one if multiple exist)
    const { data: profiles } = await supabase
        .from('profiles')
        .select('org_id')
        .order('created_at', { ascending: false })
        .limit(1)

    if (!profiles || profiles.length === 0 || !profiles[0]?.org_id) {
        throw new Error('No organization found')
    }

    const orgId = profiles[0].org_id

    // If updating slug, check for conflicts
    if (updates.slug) {
        const { data: existing } = await supabase
            .from('organizations')
            .select('id')
            .eq('slug', updates.slug)
            .neq('id', orgId)
            .maybeSingle()

        if (existing) {
            throw new Error('This booking URL is already taken. Please choose another.')
        }
    }

    // Filter out undefined values
    const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined && v !== '')
    )

    console.log('Updating org:', orgId, 'with:', cleanUpdates)

    const { data, error } = await supabase
        .from('organizations')
        .update(cleanUpdates)
        .eq('id', orgId)
        .select()
        .maybeSingle()

    if (error) {
        console.error('Supabase error details:', error)
        throw new Error(`Failed to update settings: ${error.message}`)
    }

    if (!data) {
        throw new Error('Organization not found or no permission to update')
    }

    revalidatePath('/dashboard/settings')
    return data
}
