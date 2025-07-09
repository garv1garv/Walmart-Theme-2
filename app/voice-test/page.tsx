"use client"

import { VoiceTestPanel } from "@/components/voice-test-panel"

export default function VoiceTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Voice System Test</h1>
          <p className="text-lg text-gray-600">Test and debug the voice recognition system</p>
        </div>

        <VoiceTestPanel />
      </div>
    </div>
  )
}
