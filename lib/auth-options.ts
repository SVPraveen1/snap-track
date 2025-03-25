import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { createClient } from "@/lib/supabase/server"

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

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password")
        }

        try {
          const supabase = createClient()
          
          // Sign in with Supabase
          const { data: { user }, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error) {
            console.error("Supabase auth error:", error)
            throw new Error("Invalid email or password")
          }

          if (!user) {
            throw new Error("Invalid email or password")
          }

          return {
            id: user.id,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            email: user.email,
            image: user.user_metadata?.avatar_url,
          }
        } catch (error: any) {
          console.error("Authentication error:", error)
          throw new Error("Invalid email or password")
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      if (account?.provider === "google") {
        const supabase = createClient()
        const { data: { user: supabaseUser }, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: account.id_token || '',
        })

        if (error) {
          console.error("Google auth error:", error)
          return token
        }

        if (supabaseUser) {
          token.id = supabaseUser.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Handle callback URLs
      if (url.startsWith("/api/auth/callback")) {
        return `${baseUrl}/dashboard`
      }
      
      // Handle relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      
      // Handle URLs on the same origin
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // Default redirect to dashboard
      return `${baseUrl}/dashboard`
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
    signOut: '/auth/signout',
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET
} 