import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"
import { PRODUCTS_DB } from "@/lib/products"
import type { UserInput, AIResponse } from "@/lib/types"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const userInput: UserInput = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
    You are a "sentient" AI shopping assistant for a website called Shopmart. You have access to the store's product database.
    Your task is to convert the user's request into a precise, step-by-step action plan for the frontend to execute.

    AVAILABLE PRODUCTS (from products.json):
    ---
    ${JSON.stringify(PRODUCTS_DB, null, 2)}
    ---

    CURRENT SCREEN CONTEXT:
    ---
    ${userInput.screen_context}
    ---

    USER'S LATEST COMMAND: "${userInput.query}"

    Based on all available information, perform the following tasks:
    1.  **Explanation**: Write a natural, conversational response to confirm the action you are about to take.
    2.  **Action Plan**: Create a list of JSON objects, where each object represents a single action. Each object MUST have an "action" key and a "target" key. The \`value\` key is optional and used for actions like 'TYPE' or 'DISPLAY_PRODUCTS'.
        -   Example for navigation: {"action": "NAVIGATE", "target": "/shop?category=Apparel"}
        -   Example for displaying products: {"action": "DISPLAY_PRODUCTS", "target": "product-grid", "value": ["WIILAYOK_MODERN_SOFA"]}
        -   Example for typing: {"action": "TYPE", "target": "#searchInput", "value": "running shoes"}
    3.  **Generative Prompt**: If relevant, create a detailed prompt for a lookbook image. Otherwise, return null.

    Return your response as a single, valid JSON object with the structure:
    {
      "explanation": "string",
      "action_plan": [{"action": "string", "target": "string", "value": "optional"}],
      "generative_prompt": "string or null"
    }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean the response to extract JSON
    let cleanText = text.trim()
    if (cleanText.startsWith("```json")) {
      const startIndex = cleanText.indexOf("{")
      const endIndex = cleanText.lastIndexOf("}") + 1
      cleanText = cleanText.substring(startIndex, endIndex)
    }

    const aiResponse: AIResponse = JSON.parse(cleanText)

    return NextResponse.json(aiResponse)
  } catch (error) {
    console.error("AI Assistant error:", error)
    return NextResponse.json(
      {
        explanation: "I'm sorry, I'm having trouble processing that request. Could you please try rephrasing it?",
        action_plan: [],
        generative_prompt: null,
      },
      { status: 500 },
    )
  }
}
