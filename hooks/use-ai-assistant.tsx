"use client"

import { useState, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { useSimpleSpeech } from "./use-simple-speech"
import type { AIResponse, UserInput, ScreenContext } from "@/lib/types"

export function useAIAssistant() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([])

  const sessionId = useRef(`session_${Date.now()}`)
  const { toast } = useToast()
  const { isListening, isSupported, startListening, stopListening } = useSimpleSpeech()

  // Simple text-to-speech
  const speak = useCallback(
    (text: string) => {
      if (!speechEnabled || typeof window === "undefined") return

      try {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1.0
        utterance.volume = 0.8

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error("Text-to-speech error:", error)
        setIsSpeaking(false)
      }
    },
    [speechEnabled],
  )

  // Get current screen context
  const getScreenContext = useCallback((): ScreenContext => {
    if (typeof window === "undefined") {
      return {
        current_page: "/",
        url: "/",
        visible_products: [],
        cart_items: 0,
        cart_total: 0,
      }
    }

    return {
      current_page: window.location.pathname,
      url: window.location.href,
      visible_products: [],
      cart_items: 0,
      cart_total: 0,
      search_query: new URLSearchParams(window.location.search).get("search"),
    }
  }, [])

  // Send text query to AI
  const sendTextQuery = useCallback(
    async (query: string) => {
      if (!query.trim() || isProcessing) return

      console.log("Sending query to AI:", query)
      setIsProcessing(true)

      const userInput: UserInput = {
        session_id: sessionId.current,
        chat_history: chatHistory,
        query: query.trim(),
        screen_context: JSON.stringify(getScreenContext()),
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
        setChatHistory(newHistory)

        toast({
          title: "✨ Aura AI",
          description: aiResponse.explanation,
          duration: 6000,
        })

        // Speak the response
        if (speechEnabled) {
          speak(aiResponse.explanation)
        }

        // Execute action plan
        if (aiResponse.action_plan?.length > 0) {
          executeActions(aiResponse.action_plan)
        }
      } catch (error) {
        console.error("AI query failed:", error)
        const errorMessage = "I'm having trouble right now, could you try again?"
        toast({
          title: "AI Assistant Error",
          description: errorMessage,
          variant: "destructive",
        })
        if (speechEnabled) {
          speak(errorMessage)
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [chatHistory, getScreenContext, isProcessing, speechEnabled, speak, toast],
  )

  // Send image query to AI
  const sendImageQuery = useCallback(
    async (file: File, query: string) => {
      if (isProcessing) return

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
        setChatHistory(newHistory)

        toast({
          title: "✨ Aura AI",
          description: aiResponse.explanation,
          duration: 6000,
        })

        if (speechEnabled) {
          speak(aiResponse.explanation)
        }

        if (aiResponse.action_plan?.length > 0) {
          executeActions(aiResponse.action_plan)
        }
      } catch (error) {
        console.error("Image analysis failed:", error)
        const errorMessage = "Couldn't analyze that image, mind trying once more?"
        toast({
          title: "Image Analysis Error",
          description: errorMessage,
          variant: "destructive",
        })
        if (speechEnabled) {
          speak(errorMessage)
        }
      } finally {
        setIsProcessing(false)
      }
    },
    [chatHistory, isProcessing, speechEnabled, speak, toast],
  )

  // Execute AI actions
  const executeActions = useCallback((actions: any[]) => {
    actions.forEach((action, index) => {
      setTimeout(() => {
        switch (action.action) {
          case "NAVIGATE":
            if (typeof window !== "undefined") {
              window.location.href = action.target
            }
            break
          case "SEARCH":
            if (typeof window !== "undefined") {
              window.location.href = `/shop?search=${encodeURIComponent(action.value || action.target)}`
            }
            break
          default:
            console.log("Unknown action:", action)
        }
      }, index * 500)
    })
  }, [])

  // Voice controls
  const startVoiceListening = useCallback(() => {
    console.log("Starting voice listening...")
    return startListening((transcript) => {
      console.log("Voice transcript received:", transcript)
      sendTextQuery(transcript)
    })
  }, [startListening, sendTextQuery])

  const stopVoiceListening = useCallback(() => {
    console.log("Stopping voice listening...")
    stopListening()
  }, [stopListening])

  const toggleSpeech = useCallback(() => {
    setSpeechEnabled((prev) => !prev)
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSpeaking])

  return {
    isListening,
    isProcessing,
    isSpeaking,
    speechEnabled,
    speechSupported: isSupported,
    chatHistory,
    startListening: startVoiceListening,
    stopListening: stopVoiceListening,
    sendTextQuery,
    sendImageQuery,
    toggleSpeech,
  }
}
