import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"
import { PRODUCTS_DB } from "@/lib/products"
import type { AIResponse } from "@/lib/types"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const image = formData.get("image") as File
    const query = formData.get("query") as string

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const imageBytes = await image.arrayBuffer()
    const base64Image = Buffer.from(imageBytes).toString("base64")

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
    You are an AI fashion and shopping assistant. Analyze this image and the user's query to provide helpful shopping recommendations.
    
    AVAILABLE PRODUCTS:
    ${JSON.stringify(PRODUCTS_DB, null, 2)}
    
    USER QUERY: "${query}"
    
    Based on the image and query, provide:
    1. A natural explanation of what you see and how you can help
    2. An action plan with specific steps
    3. A generative prompt for style recommendations if relevant
    
    Return as JSON with this structure:
    {
      "explanation": "string",
      "action_plan": [{"action": "string", "target": "string", "value": "optional"}],
      "generative_prompt": "string or null"
    }
    `

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: image.type,
      },
    }

    const result = await model.generateContent([prompt, imagePart])
    const response = await result.response
    const text = response.text()

    // Clean and parse JSON response
    let cleanText = text.trim()
    if (cleanText.startsWith("```json")) {
      const startIndex = cleanText.indexOf("{")
      const endIndex = cleanText.lastIndexOf("}") + 1
      cleanText = cleanText.substring(startIndex, endIndex)
    }

    const aiResponse: AIResponse = JSON.parse(cleanText)

    return NextResponse.json(aiResponse)
  } catch (error) {
    console.error("Image analysis error:", error)
    return NextResponse.json(
      {
        explanation: "I'm having trouble analyzing this image. Please try again with a different image.",
        action_plan: [],
        generative_prompt: null,
      },
      { status: 500 },
    )
  }
}
