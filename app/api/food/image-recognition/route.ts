import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// Initialize Google AI
const googleApiKey = process.env.GOOGLE_AI_API_KEY
if (!googleApiKey) {
  console.warn("Missing GOOGLE_AI_API_KEY environment variable. Image recognition will use mock data in development.")
}

const genAI = new GoogleGenerativeAI(googleApiKey || "")

export async function POST(req: NextRequest) {
  try {
    console.log("Image recognition API called")

    const session = await getSession()

    if (!session) {
      console.error("Unauthorized: No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("User authenticated:", session.id)

    const formData = await req.formData()
    const imageFile = formData.get("image") as File

    if (!imageFile) {
      console.error("No image provided in form data")
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    console.log("Image received:", imageFile.name, imageFile.type, `${Math.round(imageFile.size / 1024)}KB`)

    // Convert file to base64
    const fileBuffer = await imageFile.arrayBuffer()
    const fileData = Buffer.from(fileBuffer).toString("base64")

    console.log("Image converted to base64")

    // Mock response for testing if needed
    if (!googleApiKey) {
      console.log("Using mock response because no API key is present")
      const mockResponse = {
        items: [
          {
            name: "Grilled Chicken Salad",
            calories: 350,
            protein: 30,
            carbs: 15,
            fat: 18,
          },
          {
            name: "Cherry Tomatoes",
            calories: 25,
            protein: 1,
            carbs: 5,
            fat: 0,
          },
        ],
        total: {
          calories: 375,
          protein: 31,
          carbs: 20,
          fat: 18,
        },
      }

      // Save mock data to database with enhanced error logging
      console.log("Saving mock data to database")
      const supabase = createClient()
      
      // Log the data being inserted
      const foodEntryData = {
        user_id: session.id,
        entry_type: "image",
        food_name: mockResponse.items[0].name,
        food_data: mockResponse,
        image_url: null,
        meal_type: (formData.get("mealType") as string) || "other",
        consumed_at: (formData.get("consumedAt") as string) || new Date().toISOString(),
      }
      
      console.log("Food entry data to insert:", JSON.stringify(foodEntryData))
      
      const { data, error } = await supabase
        .from("food_entries")
        .insert(foodEntryData)
        .select()

      if (error) {
        console.error("Database error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        return NextResponse.json({ 
          error: `Failed to save food entry: ${error.message}`,
          details: error.details,
          code: error.code
        }, { status: 500 })
      }

      // Ensure food_name is included in the insert
      if (data && data[0] && !data[0].food_name && data[0].food_data?.items?.[0]?.name) {
        data[0].food_name = data[0].food_data.items[0].name
      }

      // Validate required fields
      if (!data?.[0]?.food_name) {
        return NextResponse.json(
          { error: "Food name is required" },
          { status: 400 }
        )
      }

      return NextResponse.json({
        success: true,
        data: mockResponse,
        entry: data[0],
      })
    }

    // Use Gemini 1.5 Flash to analyze the image
    console.log("Calling Gemini API")
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",  // Using pro model for better accuracy
      generationConfig: {
        temperature: 0.4,  // Lower temperature for more consistent results
        topP: 0.8,
        topK: 40,
      }
    })

    const prompt = `
      You are a professional nutritionist and food analyst specializing in global cuisines.
      Analyze this food image and provide accurate nutritional information.
      
      Important Guidelines:
      1. Identify the main dish name only (do not break down into components)
      2. For portion sizes:
         - Standard restaurant serving
         - Rice dishes (1 serving = ~300-350g)
         - Account for all ingredients in nutritional calculations
      
      3. Calculate total nutritional values including:
         - All ingredients
         - Cooking oils and fats
         - Seasonings and garnishes
      
      Format the response as a valid JSON object with this exact structure:
      {
        "items": [
          {
            "name": "dish name (e.g., 'Vegetable Biryani' not individual ingredients)",
            "calories": number,
            "protein": number,
            "carbs": number,
            "fat": number
          }
        ],
        "total": {
          "calories": number,
          "protein": number,
          "carbs": number,
          "fat": number
        }
      }

      Important: 
      - Keep dish names simple and consolidated
      - Include all nutritional values from ingredients in calculations
      - Use standard restaurant portion sizes
    `

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: fileData,
        },
      },
    ])

    const response = result.response
    const text = response.text()

    console.log("Gemini API response received")

    // Extract JSON from the response
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/)
    let foodData

    if (jsonMatch) {
      try {
        foodData = JSON.parse(jsonMatch[1] || jsonMatch[0])
        console.log("Successfully parsed food data:", foodData)
      } catch (e) {
        console.error("Failed to parse JSON from AI response", e)
        return NextResponse.json({ error: "Failed to analyze image" }, { status: 500 })
      }
    } else {
      console.error("Failed to extract food data from response")
      return NextResponse.json({ error: "Failed to extract food data" }, { status: 500 })
    }

    // Save to database with enhanced error logging
    console.log("Saving to database")
    const supabase = createClient()
    
    // Log the data being inserted
    const foodEntryData = {
      user_id: session.id,
      entry_type: "image",
      food_name: foodData.items[0].name,
      food_data: foodData,
      image_url: null,
      meal_type: (formData.get("mealType") as string) || "other",
      consumed_at: (formData.get("consumedAt") as string) || new Date().toISOString(),
    }
    
    // Validate required fields before insert
    if (!foodEntryData.food_name) {
      return NextResponse.json(
        { error: "Food name is required" },
        { status: 400 }
      )
    }

    console.log("Food entry data to insert:", JSON.stringify(foodEntryData))
    
    const { data, error } = await supabase
      .from("food_entries")
      .insert(foodEntryData)
      .select()

    if (error) {
      console.error("Database error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json({ 
        error: `Failed to save food entry: ${error.message}`,
        details: error.details,
        code: error.code
      }, { status: 500 })
    }

    console.log("Food entry saved successfully")

    return NextResponse.json({
      success: true,
      data: foodData,
      entry: data[0],
    })
  } catch (error) {
    console.error("Error processing image:", error)
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: "Failed to process image", 
        message: error.message,
        stack: error.stack
      }, { status: 500 })
    }
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 })
  }
}