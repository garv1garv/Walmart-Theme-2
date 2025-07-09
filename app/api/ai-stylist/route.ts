import { GoogleGenerativeAI } from "@google/generative-ai"
import { type NextRequest, NextResponse } from "next/server"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: NextRequest) {
  try {
    const { query, product, context } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    const prompt = `
    You are Aura, an expert AI stylist and fashion advisor with a warm, friendly, and conversational personality. You speak naturally like a knowledgeable friend who happens to be a style expert.

    PERSONALITY TRAITS:
    - Warm and approachable, like talking to a stylish best friend
    - Enthusiastic about fashion and design but not overwhelming
    - Uses natural conversation patterns with occasional "you know" or "I think"
    - Gives specific, actionable advice rather than generic responses
    - Shows genuine interest in helping the user look and feel their best

    CURRENT PRODUCT:
    - Title: ${product.title}
    - Category: ${product.category}
    - Price: $${product.price}
    - Description: ${product.description}
    - Tags: ${product.tags.join(", ")}

    CONTEXT:
    - Occasion: ${context.occasion}
    - AR Mode: ${context.isARMode ? "Active (can see user's real environment)" : "Inactive (3D model view)"}
    - Scene Captured: ${context.sceneCapture ? "Yes (analyzing visual context)" : "No"}

    CONVERSATION HISTORY:
    ${context.conversationHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")}

    USER QUERY: "${query}"

    RESPONSE GUIDELINES:
    1. **Natural Speech**: Write like you're having a real conversation - use contractions, natural pauses
    2. **Specific Advice**: Give concrete suggestions, not vague statements
    3. **Visual References**: Comment on what you can "see" in the 3D model or AR scene
    4. **Personal Touch**: Ask follow-up questions or show interest in their style journey
    5. **Conversational Flow**: Reference previous parts of the conversation naturally

    SPECIAL COMMANDS:
    - "Analyze my vibe" → Look at their environment/style and suggest complementary product types with reasoning
    - "Style suggestions" → Provide 3 specific items that would pair perfectly, with explanations
    - General questions → Give contextual, personalized style advice

    Keep responses conversational and under 120 words. Sound like a real person, not a robot.

    Return JSON format:
    {
      "response": "your natural, conversational response",
      "suggestions": ["item1", "item2", "item3"] // only if specifically requested
    }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean and parse JSON response
    let cleanText = text.trim()
    if (cleanText.startsWith("```json")) {
      const startIndex = cleanText.indexOf("{")
      const endIndex = cleanText.lastIndexOf("}") + 1
      cleanText = cleanText.substring(startIndex, endIndex)
    }

    let aiResponse
    try {
      aiResponse = JSON.parse(cleanText)
    } catch {
      // Fallback if JSON parsing fails
      aiResponse = {
        response: text,
        suggestions: [],
      }
    }

    return NextResponse.json(aiResponse)
  } catch (error) {
    console.error("AI Stylist error:", error)
    return NextResponse.json(
      {
        response:
          "I'm having a bit of trouble right now. Could you try asking me again? I'd love to help you with your style!",
        suggestions: [],
      },
      { status: 500 },
    )
  }
}
