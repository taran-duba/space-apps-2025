import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=Could not authenticate user`
        )
      }

      // After successful OAuth, enrich auth metadata for Google users
      const { data: userRes } = await supabase.auth.getUser()
      const user = userRes?.user
      if (user) {
        const identities = (user.identities || []) as Array<{ provider?: string }>
        const isGoogle = identities.some((i) => i?.provider === 'google')
        if (isGoogle) {
          const meta: Record<string, unknown> = (user.user_metadata ?? {}) as Record<string, unknown>
          const getStr = (k: string): string | undefined => {
            const v = meta[k]
            return typeof v === 'string' ? v : undefined
          }
          const given = getStr('given_name')
          const family = getStr('family_name')
          const hasAvatar = typeof getStr('avatar_url') === 'string'
          const hasDisplayName = typeof getStr('display_name') === 'string'
          const picture = getStr('avatar_url') || getStr('picture') || getStr('avatar') || getStr('picture_url') || null
          const composed = [given, family].filter(Boolean).join(' ').trim()
          const name = getStr('display_name') || getStr('full_name') || getStr('name') || (composed || null)

          const dataToUpdate: Record<string, string> = {}
          if (!hasAvatar && picture) dataToUpdate.avatar_url = picture
          if (!hasDisplayName && name) dataToUpdate.display_name = name

          try {
            // Mirror Google profile picture into Storage and overwrite avatar_url to our Storage URL
            if (picture) {
              const resp = await fetch(picture)
              if (resp.ok) {
                const contentType = resp.headers.get('content-type') || 'image/jpeg'
                const ext = contentType.includes('png') ? 'png' : 'jpg'
                const bytes = new Uint8Array(await resp.arrayBuffer())
                const filePath = `${user.id}/profile-picture.${ext}`
                const { error: upErr } = await supabase.storage
                  .from('profile-pics')
                  .upload(filePath, bytes, { upsert: true, contentType })
                if (!upErr) {
                  const { data: pub } = supabase.storage.from('profile-pics').getPublicUrl(filePath)
                  if (pub?.publicUrl) {
                    dataToUpdate.avatar_url = pub.publicUrl
                  }
                } else {
                  console.error('Failed to mirror Google avatar to Storage:', upErr)
                }
              }
            }
          } catch (mirrorErr) {
            console.error('Error mirroring Google avatar:', mirrorErr)
          }

          if (Object.keys(dataToUpdate).length > 0) {
            const { error: updateErr } = await supabase.auth.updateUser({ data: dataToUpdate })
            if (updateErr) {
              console.error('Failed to set Google profile metadata:', updateErr)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in auth callback:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/login?error=An unexpected error occurred`
      )
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
