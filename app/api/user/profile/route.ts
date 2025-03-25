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
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", session.id)
      .single()

    if (error) throw error

    return NextResponse.json(data || {})
  } catch (error) {
    console.error("Error fetching user profile:", error)
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

    // Check if profile exists
    const { data: existingData } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", session.id)
      .single()

    let result
    if (existingData) {
      // Update existing profile
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          display_name: body.display_name,
          email: body.email,
          birthday: body.birthday,
          phone_number: body.phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", session.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from("user_profiles")
        .insert({
          user_id: session.id,
          display_name: body.display_name,
          email: body.email,
          birthday: body.birthday,
          phone_number: body.phone_number,
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating user profile:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 