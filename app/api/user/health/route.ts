import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const supabase = createClient()
    
    // Get the most recent health record
    const { data, error } = await supabase
      .from("user_health")
      .select("*")
      .eq("user_id", session.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // If no records found, return null
      if (error.code === 'PGRST116') {
        return NextResponse.json(null)
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching user health:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await req.json()
    const supabase = createClient()

    // First, delete all existing records for this user
    await supabase
      .from("user_health")
      .delete()
      .eq("user_id", session.id)

    // Insert new record
    const { data, error } = await supabase
      .from("user_health")
      .insert({
        user_id: session.id,
        age: body.age,
        weight: body.weight,
        height: body.height,
        gender: body.gender,
        activity_level: body.activity_level,
        goal: body.goal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating user health:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 