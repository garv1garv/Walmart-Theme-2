"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle } from "lucide-react"
import { useSimpleSpeech } from "@/hooks/use-simple-speech"

export function VoiceTestPanel() {
  const [transcript, setTranscript] = useState("")
  const [testResults, setTestResults] = useState<string[]>([])
  const { isListening, isSupported, startListening, stopListening } = useSimpleSpeech()

  const addTestResult = (result: string) => {
    setTestResults((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testVoice = async () => {
    addTestResult("Starting voice test...")
    setTranscript("")

    const success = await startListening((text) => {
      setTranscript(text)
      addTestResult(`Voice captured: "${text}"`)
    })

    if (success) {
      addTestResult("Voice recognition started successfully")
    } else {
      addTestResult("Voice recognition failed to start")
    }
  }

  const testSpeech = () => {
    addTestResult("Testing text-to-speech...")
    try {
      const utterance = new SpeechSynthesisUtterance("Hello! This is a voice test.")
      utterance.onstart = () => addTestResult("Speech started")
      utterance.onend = () => addTestResult("Speech ended")
      utterance.onerror = (e) => addTestResult(`Speech error: ${e.error}`)
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      addTestResult(`Speech test failed: ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
    setTranscript("")
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="h-5 w-5" />
          <span>Voice System Test Panel</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Browser Support Status */}
        <Alert>
          {isSupported ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>
            Speech Recognition: {isSupported ? "✅ Supported" : "❌ Not Supported"}
            <br />
            Browser:{" "}
            {navigator.userAgent.includes("Chrome")
              ? "Chrome"
              : navigator.userAgent.includes("Safari")
                ? "Safari"
                : "Other"}
            <br />
            HTTPS: {window.location.protocol === "https:" ? "✅ Secure" : "❌ Not Secure (required for voice)"}
          </AlertDescription>
        </Alert>

        {/* Test Controls */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={testVoice}
            disabled={!isSupported || isListening}
            variant={isListening ? "destructive" : "default"}
          >
            {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
            {isListening ? "Stop Listening" : "Test Voice Input"}
          </Button>

          <Button onClick={stopListening} disabled={!isListening} variant="outline">
            Stop
          </Button>

          <Button onClick={testSpeech} variant="outline">
            <Volume2 className="h-4 w-4 mr-2" />
            Test Speech Output
          </Button>

          <Button onClick={clearResults} variant="outline">
            Clear Results
          </Button>
        </div>

        {/* Status */}
        {isListening && <Badge className="bg-red-500 animate-pulse">🎤 LISTENING - Speak now!</Badge>}

        {/* Transcript */}
        {transcript && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Last Transcript:</strong> "{transcript}"
            </AlertDescription>
          </Alert>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <div className="space-y-1 text-sm font-mono max-h-40 overflow-y-auto">
              {testResults.map((result, index) => (
                <div key={index} className="text-gray-700">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <Alert>
          <AlertDescription className="text-sm">
            <strong>Instructions:</strong>
            <br />
            1. Click "Test Voice Input" and allow microphone access
            <br />
            2. Speak clearly when you see the red "LISTENING" badge
            <br />
            3. Check the transcript appears below
            <br />
            4. Test speech output to verify audio works
            <br />
            <br />
            <strong>Troubleshooting:</strong>
            <br />• Make sure you're on HTTPS (required for microphone)
            <br />• Allow microphone permissions in your browser
            <br />• Try Chrome or Edge (best support)
            <br />• Check your microphone is working in other apps
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
