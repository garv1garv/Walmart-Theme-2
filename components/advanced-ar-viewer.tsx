"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { X, Camera, Mic, MicOff, Send, RotateCcw, Sparkles, Wand2, Volume2, VolumeX, Ear } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

interface AdvancedARViewerProps {
  product: Product
  onClose: () => void
}

export function AdvancedARViewer({ product, onClose }: AdvancedARViewerProps) {
  const modelViewerRef = useRef<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const recognitionRef = useRef<any>(null)
  const wakeWordRecognitionRef = useRef<any>(null)

  const [isARMode, setIsARMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isWakeWordListening, setIsWakeWordListening] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechEnabled, setSpeechEnabled] = useState(true)
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true)
  const [textInput, setTextInput] = useState("")
  const [occasion, setOccasion] = useState("casual")
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content:
        "Hi! I'm Aura, your AI stylist. Just say 'Hello Aura' to talk to me, or I can see the 3D model and analyze how it fits with your space and style. What would you like to know?",
    },
  ])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [lastWakeWordTime, setLastWakeWordTime] = useState(0)

  const { toast } = useToast()

  // Initialize model viewer and speech recognition
  useEffect(() => {
    const loadModelViewer = async () => {
      if (typeof window !== "undefined") {
        await import("@google/model-viewer")

        // Initialize main speech recognition with enhanced error handling
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
        if (SpeechRecognition) {
          // Main recognition for commands
          recognitionRef.current = new SpeechRecognition()
          recognitionRef.current.continuous = false
          recognitionRef.current.interimResults = false
          recognitionRef.current.lang = "en-US"

          recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            handleAIQuery(transcript)
            setIsListening(false)
            // Restart wake word listening after command
            setTimeout(() => {
              if (wakeWordEnabled) startWakeWordListening()
            }, 1000)
          }

          recognitionRef.current.onend = () => {
            setIsListening(false)
            // Restart wake word listening
            if (wakeWordEnabled) {
              setTimeout(() => startWakeWordListening(), 500)
            }
          }

          recognitionRef.current.onerror = (event: any) => {
            console.log("AR Speech recognition error:", event.error)
            setIsListening(false)

            // Handle specific error types
            if (event.error === "not-allowed") {
              toast({
                title: "Microphone Access Denied",
                description: "Please allow microphone access to talk to Aura.",
                variant: "destructive",
              })
            } else if (event.error === "no-speech") {
              toast({
                title: "No Speech Detected",
                description: "Please speak clearly and try again.",
              })
            } else {
              toast({
                title: "Speech recognition error",
                description: "Please try again or use text input.",
                variant: "destructive",
              })
            }

            // Restart wake word listening
            if (wakeWordEnabled) {
              setTimeout(() => startWakeWordListening(), 1000)
            }
          }

          // Wake word recognition with better error handling
          wakeWordRecognitionRef.current = new SpeechRecognition()
          wakeWordRecognitionRef.current.continuous = true
          wakeWordRecognitionRef.current.interimResults = true
          wakeWordRecognitionRef.current.lang = "en-US"

          wakeWordRecognitionRef.current.onresult = (event: any) => {
            const currentTime = Date.now()
            // Prevent multiple triggers within 3 seconds
            if (currentTime - lastWakeWordTime < 3000) return

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript.toLowerCase()

              // Check for wake words
              if (
                transcript.includes("hello aura") ||
                transcript.includes("hey aura") ||
                transcript.includes("hi aura") ||
                transcript.includes("aura")
              ) {
                setLastWakeWordTime(currentTime)
                handleWakeWordDetected()
                break
              }
            }
          }

          wakeWordRecognitionRef.current.onerror = (event: any) => {
            console.log("Wake word recognition error:", event.error)
            setIsWakeWordListening(false)

            // Only restart if it's not a permission error
            if (event.error !== "not-allowed" && event.error !== "service-not-allowed") {
              setTimeout(() => {
                if (wakeWordEnabled) startWakeWordListening()
              }, 2000)
            }
          }

          wakeWordRecognitionRef.current.onend = () => {
            setIsWakeWordListening(false)
            // Restart wake word listening if it stops
            if (wakeWordEnabled && !isListening) {
              setTimeout(() => startWakeWordListening(), 500)
            }
          }

          // Start wake word listening with permission check
          if (wakeWordEnabled) {
            checkMicrophonePermission().then((hasPermission) => {
              if (hasPermission) {
                startWakeWordListening()
              } else {
                toast({
                  title: "Microphone Permission Required",
                  description: "Please allow microphone access to use 'Hello Aura' wake word.",
                })
              }
            })
          }
        } else {
          toast({
            title: "Speech Recognition Not Available",
            description: "Your browser doesn't support speech recognition.",
            variant: "destructive",
          })
        }
      }
    }

    loadModelViewer()

    // Cleanup on unmount
    return () => {
      stopWakeWordListening()
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.log("Error stopping recognition:", error)
        }
      }
    }
  }, [])

  // Add microphone permission check
  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: "microphone" as PermissionName })
        return permission.state === "granted"
      }
      // Fallback: try to access microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      return true
    } catch (error) {
      return false
    }
  }

  // Enhanced manual voice controls with error handling
  const startManualListening = async () => {
    if (recognitionRef.current && !isListening) {
      // Check microphone permission first
      const hasPermission = await checkMicrophonePermission()
      if (!hasPermission) {
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to talk to Aura.",
          variant: "destructive",
        })
        return
      }

      stopWakeWordListening()
      try {
        setIsListening(true)
        recognitionRef.current.start()
      } catch (error) {
        console.log("Manual listening start error:", error)
        setIsListening(false)
        toast({
          title: "Voice Recognition Error",
          description: "Unable to start voice recognition. Please try again.",
          variant: "destructive",
        })
        if (wakeWordEnabled) {
          setTimeout(() => startWakeWordListening(), 500)
        }
      }
    }
  }

  const stopManualListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.log("Manual listening stop error:", error)
      }
    }
    setIsListening(false)
    if (wakeWordEnabled) {
      setTimeout(() => startWakeWordListening(), 500)
    }
  }

  // Wake word listening control
  const startWakeWordListening = useCallback(() => {
    if (wakeWordRecognitionRef.current && wakeWordEnabled && !isListening) {
      try {
        wakeWordRecognitionRef.current.start()
        setIsWakeWordListening(true)
      } catch (error) {
        console.log("Wake word recognition already running")
      }
    }
  }, [wakeWordEnabled, isListening])

  const stopWakeWordListening = useCallback(() => {
    if (wakeWordRecognitionRef.current) {
      try {
        wakeWordRecognitionRef.current.stop()
        setIsWakeWordListening(false)
      } catch (error) {
        console.log("Wake word recognition already stopped")
      }
    }
  }, [])

  // Handle wake word detection
  const handleWakeWordDetected = useCallback(() => {
    if (isListening) return // Already listening

    // Stop wake word listening temporarily
    stopWakeWordListening()

    // Visual and audio feedback
    toast({
      title: "👋 Hello! Aura is listening...",
      description: "I heard you call my name. What can I help you with?",
      duration: 3000,
    })

    // Speak acknowledgment
    if (speechEnabled) {
      speak("Hello! I'm listening. How can I help you?")
    }

    // Start main voice recognition
    setTimeout(() => {
      if (recognitionRef.current) {
        setIsListening(true)
        recognitionRef.current.start()
      }
    }, 1000)
  }, [isListening, speechEnabled])

  // Toggle wake word listening
  const toggleWakeWordListening = useCallback(() => {
    setWakeWordEnabled(!wakeWordEnabled)
    if (!wakeWordEnabled) {
      startWakeWordListening()
      toast({
        title: "Wake word activated",
        description: "Say 'Hello Aura' to start talking!",
      })
    } else {
      stopWakeWordListening()
      toast({
        title: "Wake word deactivated",
        description: "Use the microphone button to talk to Aura.",
      })
    }
  }, [wakeWordEnabled, startWakeWordListening, stopWakeWordListening])

  // Text-to-speech function
  const speak = useCallback(
    (text: string) => {
      if (!speechEnabled || typeof window === "undefined") return

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 0.8

      const voices = window.speechSynthesis.getVoices()
      const preferredVoice =
        voices.find((voice) => voice.name.includes("Google") && voice.lang.startsWith("en")) ||
        voices.find((voice) => voice.lang.startsWith("en-US")) ||
        voices[0]

      if (preferredVoice) utterance.voice = preferredVoice

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    },
    [speechEnabled],
  )

  // Capture scene for AI analysis
  const captureScene = useCallback(async () => {
    try {
      let sceneData = ""

      if (isARMode && videoRef.current) {
        // Capture camera feed for AR analysis
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = videoRef.current.videoWidth
        canvas.height = videoRef.current.videoHeight
        ctx?.drawImage(videoRef.current, 0, 0)
        sceneData = canvas.toDataURL("image/jpeg", 0.8)
      } else if (modelViewerRef.current) {
        // Capture 3D model view
        const blob = await modelViewerRef.current.toBlob({
          mimeType: "image/jpeg",
          qualityArgument: 0.8,
        })
        sceneData = URL.createObjectURL(blob)
      }

      return sceneData
    } catch (error) {
      console.error("Failed to capture scene:", error)
      return null
    }
  }, [isARMode])

  // Handle AI queries with scene analysis
  const handleAIQuery = useCallback(
    async (query: string) => {
      if (!query.trim() || isAnalyzing) return

      setIsAnalyzing(true)

      try {
        const sceneCapture = await captureScene()

        const aiRequest = {
          query,
          product: {
            title: product.title,
            category: product.category,
            price: product.price,
            description: product.description,
            tags: product.tags,
          },
          context: {
            occasion,
            isARMode,
            conversationHistory: conversationHistory.slice(-6), // Last 6 messages for context
            sceneCapture: sceneCapture ? "scene_captured" : null,
          },
        }

        const response = await fetch("/api/ai-stylist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(aiRequest),
        })

        if (!response.ok) throw new Error("AI request failed")

        const aiResponse = await response.json()

        // Update conversation history
        const newHistory = [
          ...conversationHistory,
          { role: "user", content: query },
          { role: "assistant", content: aiResponse.response },
        ]
        setConversationHistory(newHistory)

        // Speak the response
        if (speechEnabled) {
          speak(aiResponse.response)
        }

        // Show suggestions if provided
        if (aiResponse.suggestions?.length > 0) {
          toast({
            title: "AI Suggestions",
            description: `I found ${aiResponse.suggestions.length} style recommendations for you!`,
          })
        }
      } catch (error) {
        console.error("AI query failed:", error)
        toast({
          title: "AI Error",
          description: "Sorry, I'm having trouble analyzing right now. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsAnalyzing(false)
      }
    },
    [product, occasion, conversationHistory, isARMode, captureScene, speechEnabled, speak, toast],
  )

  // Start AR mode
  const startARMode = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsARMode(true)

        toast({
          title: "AR Mode Active",
          description: "Point your camera at a flat surface to place the product!",
        })
      }
    } catch (error) {
      console.error("Failed to start AR:", error)
      toast({
        title: "AR Not Available",
        description: "Please allow camera access or try on a mobile device.",
        variant: "destructive",
      })
    }
  }, [toast])

  // Stop AR mode
  const stopARMode = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsARMode(false)
  }, [])

  // Manual voice controls

  // Handle text input
  const handleTextSubmit = () => {
    if (textInput.trim()) {
      handleAIQuery(textInput.trim())
      setTextInput("")
    }
  }

  // Proactive AI features
  const analyzeVibe = () => {
    handleAIQuery(
      "Analyze my vibe - look at my current environment and style to suggest what type of item would complement it",
    )
  }

  const getStyleSuggestions = () => {
    handleAIQuery("Give me three specific style suggestions that would go perfectly with this product")
  }

  // 3D Model controls
  const resetView = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.resetTurntableRotation()
    }
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex">
      {/* Main AR/3D Viewer */}
      <div className="flex-1 relative">
        {isARMode ? (
          // AR Camera View
          <div className="relative w-full h-full">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

            {/* AR Overlay Controls */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
              <Badge className="bg-red-500 animate-pulse">AR LIVE</Badge>
              <Button variant="ghost" size="sm" onClick={stopARMode} className="text-white bg-black/50">
                Exit AR
              </Button>
            </div>

            {/* AR Instructions */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/80 text-white p-4 rounded-lg text-center">
              <p className="text-sm mb-2">Point camera at flat surface</p>
              <p className="text-xs opacity-75">Tap to place • Pinch to resize • Drag to move</p>
            </div>
          </div>
        ) : (
          // 3D Model Viewer
          <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200">
            <model-viewer
              ref={modelViewerRef}
              src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
              alt={product.title}
              ar
              ar-modes="webxr scene-viewer quick-look"
              camera-controls
              autoplay
              shadow-intensity="1"
              environment-image="neutral"
              style={{ width: "100%", height: "100%" }}
            />

            {/* 3D Controls Overlay */}
            <div className="absolute top-4 left-4 space-y-2">
              <Button size="sm" variant="outline" onClick={resetView} className="bg-white/90">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button size="sm" variant="outline" onClick={startARMode} className="bg-purple-600 text-white">
                <Camera className="h-4 w-4 mr-2" />
                Try in Your Space
              </Button>
            </div>

            {/* 3D Instructions */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg text-sm">
              Drag to rotate • Scroll to zoom • Right-click to pan
            </div>
          </div>
        )}

        {/* Wake Word Status Indicator */}
        {wakeWordEnabled && (
          <div className="absolute top-4 right-4">
            <div
              className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm ${
                isWakeWordListening ? "bg-green-500/90 text-white animate-pulse" : "bg-gray-500/90 text-white"
              }`}
            >
              <Ear className="h-4 w-4" />
              <span>{isWakeWordListening ? "Listening for 'Hello Aura'" : "Wake word paused"}</span>
            </div>
          </div>
        )}
      </div>

      {/* AI Stylist Panel */}
      <div className="w-96 bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">✨ Aura AI Stylist</h2>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-sm opacity-90">Say "Hello Aura" to start talking!</p>
        </div>

        {/* Wake Word Control */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="text-sm font-medium">Wake Word Detection</label>
              <p className="text-xs text-gray-600">Say "Hello Aura" to activate voice</p>
            </div>
            <Switch checked={wakeWordEnabled} onCheckedChange={toggleWakeWordListening} />
          </div>

          {wakeWordEnabled && (
            <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded">
              💡 Try saying: "Hello Aura", "Hey Aura", or just "Aura"
            </div>
          )}
        </div>

        {/* Occasion Selector */}
        <div className="p-4 border-b bg-gray-50">
          <label className="text-sm font-medium mb-2 block">Occasion Context:</label>
          <Select value={occasion} onValueChange={setOccasion}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="party">Party</SelectItem>
              <SelectItem value="home-decor">Home Decor</SelectItem>
              <SelectItem value="workout">Workout</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Conversation History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {conversationHistory.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}

          {isAnalyzing && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg text-sm">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  <span>Analyzing scene and style...</span>
                </div>
              </div>
            </div>
          )}

          {isListening && (
            <div className="flex justify-start">
              <div className="bg-green-100 p-3 rounded-lg text-sm">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse rounded-full h-3 w-3 bg-green-500"></div>
                  <span>Listening... speak now!</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Proactive AI Buttons */}
        <div className="p-4 border-t bg-gray-50">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <Button
              size="sm"
              variant="outline"
              onClick={analyzeVibe}
              disabled={isAnalyzing}
              className="text-xs bg-transparent"
            >
              <Sparkles className="h-3 w-3 mr-1" />
              Analyze My Vibe
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={getStyleSuggestions}
              disabled={isAnalyzing}
              className="text-xs bg-transparent"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Style Suggestions
            </Button>
          </div>
        </div>

        {/* Input Controls */}
        <div className="p-4 border-t">
          <div className="flex items-center space-x-2 mb-3">
            <Input
              placeholder="Or type your question here..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleTextSubmit()}
              disabled={isAnalyzing}
              className="flex-1"
            />
            <Button size="sm" onClick={handleTextSubmit} disabled={!textInput.trim() || isAnalyzing}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant={isListening ? "destructive" : "outline"}
                onClick={isListening ? stopManualListening : startManualListening}
                disabled={isAnalyzing}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>

              <Button size="sm" variant="outline" onClick={() => setSpeechEnabled(!speechEnabled)}>
                {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>

            {isSpeaking && <Badge className="bg-green-500 animate-pulse">Speaking...</Badge>}
          </div>
        </div>
      </div>
    </div>
  )
}
