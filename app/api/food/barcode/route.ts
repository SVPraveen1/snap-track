import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { searchFoodByBarcode } from "@/lib/food-api"

export async function GET(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const barcode = url.searchParams.get("barcode")

    if (!barcode) {
      return NextResponse.json({ error: "No barcode provided" }, { status: 400 })
    }

    // Fetch food data from Open Food Facts API
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    const data = await response.json()

    if (!data.product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Extract relevant nutritional information
    const product = data.product
    const nutriments = product.nutriments || {}

    const foodData = {
      items: [
        {
          name: product.product_name || "Unknown Product",
          calories: nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0,
          protein: nutriments.proteins_100g || 0,
          carbs: nutriments.carbohydrates_100g || 0,
          fat: nutriments.fat_100g || 0,
          serving_size: product.serving_size || "100g",
          image: product.image_url,
          barcode,
        },
      ],
      total: {
        calories: nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || 0,
        protein: nutriments.proteins_100g || 0,
        carbs: nutriments.carbohydrates_100g || 0,
        fat: nutriments.fat_100g || 0,
      },
    }

    return NextResponse.json({ success: true, data: foodData })
  } catch (error) {
    console.error("Error processing barcode:", error)
    return NextResponse.json({ error: "Failed to process barcode" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { barcode } = await req.json()

    if (!barcode) {
      return NextResponse.json({ error: "Barcode is required" }, { status: 400 })
    }

    // Search for food item using barcode
    const foodData = await searchFoodByBarcode(barcode)

    if (!foodData || !foodData.items || foodData.items.length === 0) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 })
    }

    // Save to database
    const supabase = createClient()
    const { error } = await supabase
      .from("food_entries")
      .insert({
        user_id: session.id,
        entry_type: "barcode",
        food_data: foodData,
        barcode: foodData.items[0]?.barcode,
        meal_type: "other",
        consumed_at: new Date().toISOString(),
      })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to save food entry" }, { status: 500 })
    }

    return NextResponse.json(foodData)
  } catch (error) {
    console.error("Error processing barcode:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

