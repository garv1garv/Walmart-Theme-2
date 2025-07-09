"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Bot, Mic, MicOff, Camera, Send, MessageSquare, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AIResponse, UserInput, ScreenContext } from "@/lib/types"

interface AIAssistantFABProps {
  onActionPlan: (actions: any[]) => void
  onShowResponse: (message: string) => void
  screenContext: ScreenContext
  chatHistory: Array<{ role: string; content: string }>
  onUpdateChatHistory: (history: Array<{ role: string; content: string }>) => void
}

export function AIAssistantFAB({
  onActionPlan,
  onShowResponse,
  screenContext,
  chatHistory,
  onUpdateChatHistory,
}: AIAssistantFABProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [textInput, setTextInput] = useState("")

  const recognitionRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const sessionId = useRef(`session_${Date.now()}`)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          handleAIQuery(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current.onerror = () => {
          setIsListening(false)
          toast({
            title: "Speech recognition error",
            description: "Please try again or use text input.",
            variant: "destructive",
          })
        }
      }
    }
  }, [])

  const handleAIQuery = async (query: string) => {
    if (!query.trim() || isProcessing) return

    setIsProcessing(true)

    const userInput: UserInput = {
      session_id: sessionId.current,
      chat_history: chatHistory,
      query: query.trim(),
      screen_context: JSON.stringify(screenContext),
      language: "en-US",
    }

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userInput),
      })

      if (!response.ok) throw new Error("AI request failed")

      const aiResponse: AIResponse = await response.json()

      // Update chat history
      const newHistory = [
        ...chatHistory,
        { role: "user", content: query },
        { role: "assistant", content: aiResponse.explanation },
      ]
      onUpdateChatHistory(newHistory)

      // Show AI response
      onShowResponse(aiResponse.explanation)

      // Execute action plan
      if (aiResponse.action_plan?.length > 0) {
        onActionPlan(aiResponse.action_plan)
      }
    } catch (error) {
      console.error("AI query failed:", error)
      toast({
        title: "AI Assistant Error",
        description: "Sorry, I'm having trouble connecting. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImageAnalysis = async (file: File, query: string) => {
    setIsProcessing(true)

    const formData = new FormData()
    formData.append("image", file)
    formData.append("query", query)

    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Image analysis failed")

      const aiResponse: AIResponse = await response.json()

      // Update chat history
      const newHistory = [
        ...chatHistory,
        { role: "user", content: `[Image uploaded] ${query}` },
        { role: "assistant", content: aiResponse.explanation },
      ]
      onUpdateChatHistory(newHistory)

      onShowResponse(aiResponse.explanation)

      if (aiResponse.action_plan?.length > 0) {
        onActionPlan(aiResponse.action_plan)
      }
    } catch (error) {
      console.error("Image analysis failed:", error)
      toast({
        title: "Image Analysis Error",
        description: "Sorry, I couldn't analyze that image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const startVoiceRecording = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Speech not supported",
        description: "Please use text input instead.",
        variant: "destructive",
      })
      return
    }

    setIsListening(true)
    recognitionRef.current.start()
  }

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      handleAIQuery(textInput)
      setTextInput("")
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const query =
        prompt("What would you like me to analyze about this image?") ||
        "Analyze this image and suggest related products"
      handleImageAnalysis(file, query)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Speed Dial Menu */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 space-y-3 mb-4">
          {/* Text Input */}
          <div className="flex items-center space-x-2">
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Ask AI assistant..."
              className="w-64"
              onKeyPress={(e) => e.key === "Enter" && handleTextSubmit()}
              disabled={isProcessing}
            />
            <Button
              size="icon"
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isProcessing}
              className="bg-green-500 hover:bg-green-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Photo Upload */}
          <div className="flex items-center space-x-2">
            <Card className="px-3 py-2 bg-white shadow-lg">
              <span className="text-sm font-medium">Upload Photo</span>
            </Card>
            <Button
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>

          {/* Voice Input */}
          <div className="flex items-center space-x-2">
            <Card className="px-3 py-2 bg-white shadow-lg">
              <span className="text-sm font-medium">Voice Command</span>
            </Card>
            <Button
              size="icon"
              onClick={isListening ? stopVoiceRecording : startVoiceRecording}
              disabled={isProcessing}
              className={`${isListening ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"} ${isListening ? "animate-pulse" : ""}`}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>

          {/* Feedback */}
          <div className="flex items-center space-x-2">
            <Card className="px-3 py-2 bg-white shadow-lg">
              <span className="text-sm font-medium">Feedback</span>
            </Card>
            <Button
              size="icon"
              onClick={() => {
                const feedback = prompt("Please share your feedback:")
                if (feedback) handleAIQuery(`User feedback: ${feedback}`)
              }}
              disabled={isProcessing}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main FAB */}
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 ${
          isOpen ? "rotate-45" : "rotate-0"
        } ${isProcessing ? "animate-pulse" : ""}`}
        disabled={isProcessing}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </Button>
    </div>
  )
}
