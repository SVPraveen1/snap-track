import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { expires?: Date }) {
          try {
            cookieStore.set({
              name,
              value,
              expires: options?.expires,
              httpOnly: true,
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          } catch (error) {
            // Unable to set cookie
          }
        },
        remove(name: string, options: { expires?: Date }) {
          try {
            cookieStore.delete(name)
          } catch (error) {
            // Unable to delete cookie
          }
        },
      },
    }
  )
} 