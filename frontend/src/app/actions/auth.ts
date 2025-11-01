'use server'

import { createClient } from '@/utils/supabase/server'

export async function signUp(email: string, password: string, firstName?: string, lastName?: string) {
  const supabase = await createClient()
  const displayName = [firstName, lastName].filter(Boolean).join(' ').trim() || undefined

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      data: displayName ? { display_name: displayName } : undefined,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { data, error: null }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Expose Supabase error code to the client (e.g., 'email_not_confirmed')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorCode = (error as any)?.code ?? null
    return { error: error.message, errorCode }
  }

  return { data, error: null, errorCode: null }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return { error: null }
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
