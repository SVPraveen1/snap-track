import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Session } from "@supabase/supabase-js"

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for session changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return session
} 