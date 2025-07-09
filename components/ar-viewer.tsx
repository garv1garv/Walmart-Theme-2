"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Camera, Share2, RotateCcw, ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"

interface ARViewerProps {
  product: Product
  onClose: () => void
}

export function ARViewer({ product, onClose }: ARViewerProps) {
  const modelViewerRef = useRef<any>(null)

  useEffect(() => {
    // Dynamically import model-viewer to avoid SSR issues
    const loadModelViewer = async () => {
      if (typeof window !== "undefined") {
        await import("@google/model-viewer")
      }
    }

    loadModelViewer()
  }, [])

  const handleCapture = async () => {
    if (modelViewerRef.current) {
      try {
        const blob = await modelViewerRef.current.toBlob({
          mimeType: "image/jpeg",
          qualityArgument: 0.9,
        })

        // Create download link
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${product.title}-ar-capture.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error("Failed to capture AR view:", error)
      }
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this ${product.title} in AR!`,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Failed to share:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const resetView = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.resetTurntableRotation()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl h-full max-h-[90vh] overflow-hidden">
        <CardContent className="p-0 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-bold">{product.title}</h2>
              <p className="text-gray-600">AR View</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* AR Viewer */}
          <div className="flex-1 relative bg-gray-100">
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
            >
              {/* AR Button */}
              <Button
                slot="ar-button"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Camera className="h-5 w-5 mr-2" />
                View in Your Space
              </Button>
            </model-viewer>

            {/* Loading indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 rounded-lg p-4 shadow-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Loading 3D model...</p>
              </div>
            </div>
          </div>

          {/* Enhanced Controls */}
          <div className="p-6 border-t bg-white">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold mb-2">AR Controls</h3>
              <p className="text-sm text-gray-600">
                📱 <strong>Mobile:</strong> Tap "View in Your Space" to use camera AR
                <br />
                🖱️ <strong>Desktop:</strong> Drag to rotate • Scroll to zoom • Right-click to pan
              </p>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetView}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset View
                </Button>
                <Button variant="outline" size="sm" onClick={handleCapture}>
                  <Camera className="h-4 w-4 mr-2" />
                  Capture
                </Button>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-800 mb-2">💡 AR Tips:</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Point your camera at a flat surface for best results</li>
                <li>• Ensure good lighting for accurate placement</li>
                <li>• Move your device slowly for better tracking</li>
                <li>• Tap and hold to place the product in your space</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
