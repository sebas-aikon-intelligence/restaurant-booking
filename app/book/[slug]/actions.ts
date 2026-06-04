'use server'

import { createClient } from '@/lib/supabase/server'

export async function getRestaurantBySlug(slug: string) {
    const supabase = await createClient()

    const { data: org, error } = await supabase
        .from('organizations')
        .select('id, name, description, logo_url, cover_image_url, primary_color, secondary_color')
        .eq('slug', slug)
        .maybeSingle()

    if (error) {
        console.error('Error fetching restaurant:', error)
        return null
    }

    return org
}

export async function createReservation(data: {
    orgId: string
    customerName: string
    customerEmail?: string
    customerPhone: string
    partySize: number
    reservationDate: string
    reservationTime: string
    notes?: string
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('reservations')
        .insert({
            org_id: data.orgId,
            customer_name: data.customerName,
            customer_email: data.customerEmail,
            customer_phone: data.customerPhone,
            party_size: data.partySize,
            reservation_date: data.reservationDate,
            reservation_time: data.reservationTime,
            notes: data.notes,
            status: 'pending'
        })

    if (error) {
        console.error('Error creating reservation:', error)
        throw new Error('Failed to create reservation')
    }
}
