import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, role, orgId } = await req.json()
  if (!email || !role || !orgId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Verify caller belongs to the org
  const { data: profile } = await supabase
    .from('profiles').select('org_id, role').eq('id', user.id).single()

  if (!profile || profile.org_id !== orgId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({ org_id: orgId, email, role, invited_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ token: invitation.token, invitation })
}
