"use client"

import { useState, useRef, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

export function useSimpleSpeech() {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  // Initialize speech recognition on first use
  const initializeSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return false

    try {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition

      if (!SpeechRecognition) {
        console.log("Speech recognition not supported")
        return false
      }

      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = "en-US"

        console.log("Speech recognition initialized")
      }

      setIsSupported(true)
      return true
    } catch (error) {
      console.error("Failed to initialize speech recognition:", error)
      setIsSupported(false)
      return false
    }
  }, [])

  const startListening = useCallback(
    async (onResult: (text: string) => void) => {
      console.log("Attempting to start listening...")

      // Initialize if not already done
      if (!initializeSpeechRecognition()) {
        toast({
          title: "Voice Not Available",
          description: "Your browser doesn't support voice recognition. Please use text input.",
          variant: "destructive",
        })
        return false
      }

      // Request microphone permission explicitly
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((track) => track.stop()) // Stop immediately, we just needed permission
        console.log("Microphone permission granted")
      } catch (error) {
        console.error("Microphone permission denied:", error)
        toast({
          title: "Microphone Access Needed",
          description: "Please allow microphone access and try again.",
          variant: "destructive",
        })
        return false
      }

      try {
        // Set up event handlers
        recognitionRef.current.onstart = () => {
          console.log("Speech recognition started")
          setIsListening(true)
          toast({
            title: "🎤 Listening...",
            description: "Speak now! I'm listening to your voice.",
            duration: 3000,
          })
        }

        recognitionRef.current.onresult = (event: any) => {
          console.log("Speech recognition result received")
          let transcript = ""
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          console.log("Transcript:", transcript)
          if (transcript.trim()) {
            onResult(transcript.trim())
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error)
          setIsListening(false)

          let errorMessage = "Voice recognition failed. Please try again."

          switch (event.error) {
            case "not-allowed":
              errorMessage = "Microphone access denied. Please allow microphone access in your browser."
              break
            case "no-speech":
              errorMessage = "No speech detected. Please speak clearly and try again."
              break
            case "audio-capture":
              errorMessage = "No microphone found. Please check your microphone."
              break
            case "network":
              errorMessage = "Network error. Please check your internet connection."
              break
          }

          toast({
            title: "Voice Error",
            description: errorMessage,
            variant: "destructive",
          })
        }

        recognitionRef.current.onend = () => {
          console.log("Speech recognition ended")
          setIsListening(false)
        }

        // Start recognition
        recognitionRef.current.start()
        console.log("Speech recognition start() called")
        return true
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setIsListening(false)
        toast({
          title: "Voice Error",
          description: "Failed to start voice recognition. Please try text input instead.",
          variant: "destructive",
        })
        return false
      }
    },
    [initializeSpeechRecognition, toast],
  )

  const stopListening = useCallback(() => {
    console.log("Stopping speech recognition...")
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error("Error stopping recognition:", error)
      }
    }
    setIsListening(false)
  }, [])

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  }
}
