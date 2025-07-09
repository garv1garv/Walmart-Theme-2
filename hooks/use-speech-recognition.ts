"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface SpeechRecognitionConfig {
  continuous?: boolean
  interimResults?: boolean
  lang?: string
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
  onEnd?: () => void
}

export function useSpeechRecognition() {
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()

  // Check if speech recognition is supported
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)

      if (SpeechRecognition) {
        checkMicrophonePermission()
      }
    }
  }, [])

  const checkMicrophonePermission = async () => {
    try {
      // Method 1: Check permissions API
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: "microphone" as PermissionName })
        if (permission.state === "granted") {
          setHasPermission(true)
          return true
        } else if (permission.state === "denied") {
          setHasPermission(false)
          return false
        }
      }

      // Method 2: Try to access microphone directly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setHasPermission(true)
      return true
    } catch (error) {
      console.log("Microphone permission check failed:", error)
      setHasPermission(false)
      return false
    }
  }

  const createRecognition = useCallback(
    (config: SpeechRecognitionConfig) => {
      if (!isSupported) return null

      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = config.continuous || false
      recognition.interimResults = config.interimResults || false
      recognition.lang = config.lang || "en-US"

      recognition.onstart = () => {
        console.log("Speech recognition started")
      }

      recognition.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        if (config.onResult) {
          config.onResult(transcript.trim())
        }
      }

      recognition.onerror = (event: any) => {
        console.log("Speech recognition error:", event.error)

        let errorMessage = "Speech recognition error occurred."

        switch (event.error) {
          case "not-allowed":
          case "service-not-allowed":
            errorMessage = "Microphone access denied. Please allow microphone access in your browser settings."
            setHasPermission(false)
            break
          case "no-speech":
            errorMessage = "No speech detected. Please try speaking again."
            break
          case "audio-capture":
            errorMessage = "No microphone found. Please check your microphone connection."
            break
          case "network":
            errorMessage = "Network error. Please check your internet connection."
            break
          case "aborted":
            errorMessage = "Speech recognition was aborted."
            break
          default:
            errorMessage = `Speech recognition error: ${event.error}`
        }

        if (config.onError) {
          config.onError(errorMessage)
        }
      }

      recognition.onend = () => {
        console.log("Speech recognition ended")
        if (config.onEnd) {
          config.onEnd()
        }
      }

      return recognition
    },
    [isSupported],
  )

  const startListening = useCallback(
    async (config: SpeechRecognitionConfig) => {
      if (!isSupported) {
        toast({
          title: "Speech Recognition Not Supported",
          description: "Your browser doesn't support speech recognition. Please use text input.",
          variant: "destructive",
        })
        return false
      }

      // Check permission first
      const hasPermission = await checkMicrophonePermission()
      if (!hasPermission) {
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to use voice features.",
          variant: "destructive",
        })
        return false
      }

      try {
        // Stop any existing recognition
        if (recognitionRef.current) {
          recognitionRef.current.stop()
        }

        // Create new recognition instance
        recognitionRef.current = createRecognition(config)
        if (!recognitionRef.current) return false

        setIsListening(true)
        recognitionRef.current.start()
        return true
      } catch (error) {
        console.error("Failed to start speech recognition:", error)
        setIsListening(false)
        toast({
          title: "Speech Recognition Error",
          description: "Failed to start voice recognition. Please try again.",
          variant: "destructive",
        })
        return false
      }
    },
    [isSupported, createRecognition, toast],
  )

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log("Error stopping recognition:", error)
      }
    }
    setIsListening(false)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.log("Cleanup error:", error)
        }
      }
    }
  }, [])

  return {
    isSupported,
    isListening,
    hasPermission,
    startListening,
    stopListening,
    checkMicrophonePermission,
  }
}
