import { NextAuthOptions } from "next-auth"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from "@/lib/supabase/server"
import { authOptions } from "@/lib/auth-options"

// Define custom types for better type safety
declare module "next-auth" {
  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  
  interface Session {
    user: User & {
      id: string
    }
  }
}

// Import your database utilities if needed

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }