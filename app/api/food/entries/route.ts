import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const date = url.searchParams.get("date")
    const limit = Number.parseInt(url.searchParams.get("limit") || "10")

    const supabase = createClient()
    let query = supabase
      .from("food_entries")
      .select("*")
      .eq("user_id", session.id)
      .order("consumed_at", { ascending: false })
      .limit(limit)

    if (date) {
      // Filter by date if provided
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      query = query.gte("consumed_at", startDate.toISOString()).lte("consumed_at", endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to fetch food entries" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      entries: data,
    })
  } catch (error) {
    console.error("Error fetching food entries:", error)
    return NextResponse.json({ error: "Failed to fetch food entries" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { entryId } = body

    if (!entryId) {
      return NextResponse.json({ error: "No entry ID provided" }, { status: 400 })
    }

    const supabase = createClient()
    const { error } = await supabase.from("food_entries").delete().eq("id", entryId).eq("user_id", session.id)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to delete food entry" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error deleting food entry:", error)
    return NextResponse.json({ error: "Failed to delete food entry" }, { status: 500 })
  }
}

