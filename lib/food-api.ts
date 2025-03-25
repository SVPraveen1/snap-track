export async function searchFoodByBarcode(barcode: string) {
  try {
    // Fetch food data from Open Food Facts API
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
    const data = await response.json()

    if (!data.product) {
      return null
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

    return foodData
  } catch (error) {
    console.error("Error searching food by barcode:", error)
    return null
  }
} 