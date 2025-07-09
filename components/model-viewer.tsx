"use client"

import { useEffect, useRef, forwardRef } from "react"
import { Button } from "@/components/ui/button"

interface ModelViewerProps {
  src: string
  alt: string
}

export const ModelViewer = forwardRef<any, ModelViewerProps>(({ src, alt }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Dynamically import model-viewer to avoid SSR issues
    const loadModelViewer = async () => {
      if (typeof window !== "undefined") {
        await import("@google/model-viewer")
      }
    }

    loadModelViewer()
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <model-viewer
        ref={ref}
        src={src}
        alt={alt}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        autoplay
        shadow-intensity="1"
        style={{ width: "100%", height: "100%" }}
      >
        <Button slot="ar-button" className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700">
          Try in AR
        </Button>
      </model-viewer>
    </div>
  )
})

ModelViewer.displayName = "ModelViewer"
