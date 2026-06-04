'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Type-casting here for simplicity
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return redirect('/login?error=Invalid credentials')
    }

    return redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const restaurantName = formData.get('restaurantName') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                restaurant_name: restaurantName,
            },
        },
    })

    if (error) {
        console.error('Signup error:', error)
        return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
    }

    return redirect('/login?message=Check email to continue sign in process')
}
