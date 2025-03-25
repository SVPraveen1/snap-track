import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()
    const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", session.id).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch user preferences" }, { status: 500 })
    }

    // Return default preferences if none exist
    if (!data) {
      return NextResponse.json({
        success: true,
        preferences: {
          daily_calorie_goal: 2000,
          daily_protein_goal: 50,
          daily_carbs_goal: 250,
          daily_fat_goal: 70,
          reminder_enabled: false,
          reminder_time: "19:00",
        },
      })
    }

    return NextResponse.json({
      success: true,
      preferences: data,
    })
  } catch (error) {
    console.error("Error fetching user preferences:", error)
    return NextResponse.json({ error: "Failed to fetch user preferences" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const {
      daily_calorie_goal,
      daily_protein_goal,
      daily_carbs_goal,
      daily_fat_goal,
      reminder_enabled,
      reminder_time,
    } = body

    const supabase = createClient()

    // Check if preferences already exist
    const { data: existingData } = await supabase
      .from("user_preferences")
      .select("id")
      .eq("user_id", session.id)
      .single()

    let result

    if (existingData) {
      // Update existing preferences
      result = await supabase
        .from("user_preferences")
        .update({
          daily_calorie_goal,
          daily_protein_goal,
          daily_carbs_goal,
          daily_fat_goal,
          reminder_enabled,
          reminder_time,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingData.id)
        .select()
    } else {
      // Insert new preferences
      result = await supabase
        .from("user_preferences")
        .insert({
          user_id: session.id,
          daily_calorie_goal,
          daily_protein_goal,
          daily_carbs_goal,
          daily_fat_goal,
          reminder_enabled,
          reminder_time,
        })
        .select()
    }

    if (result.error) {
      console.error("Database error:", result.error)
      return NextResponse.json({ error: "Failed to save user preferences" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      preferences: result.data[0],
    })
  } catch (error) {
    console.error("Error saving user preferences:", error)
    return NextResponse.json({ error: "Failed to save user preferences" }, { status: 500 })
  }
}

