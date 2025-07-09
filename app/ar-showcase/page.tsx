"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Smartphone, ArrowLeft, Sparkles, Mic, Camera, Wand2 } from "lucide-react"
import { PRODUCTS_DB } from "@/lib/products"
import { AdvancedARViewer } from "@/components/advanced-ar-viewer"

export default function ARShowcasePage() {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS_DB[0])
  const [showAdvancedAR, setShowAdvancedAR] = useState(false)

  const arCompatibleProducts = PRODUCTS_DB.filter((p) => p.category === "Furniture" || p.category === "Electronics")

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <h1 className="text-5xl font-bold text-gray-900 mb-4">🥽 Advanced AR Shopping Experience</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the future of shopping with 3D product viewing, AR placement, and AI stylist Aura - your personal
            fashion advisor with conversational memory and proactive suggestions.
          </p>
        </div>

        {/* Advanced Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6 border-2 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3D Product Viewing</h3>
              <p className="text-sm text-gray-600">Rotate, pan, zoom to see products from all angles in stunning 3D</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-2 border-purple-200 bg-purple-50">
            <CardContent className="pt-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AR Placement</h3>
              <p className="text-sm text-gray-600">Place products in your real space using your phone camera</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-2 border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Stylist Aura</h3>
              <p className="text-sm text-gray-600">Voice & text conversations with contextual style advice</p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-2 border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wand2 className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Analysis</h3>
              <p className="text-sm text-gray-600">Scene analysis with proactive style suggestions</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Features Showcase */}
        <Card className="mb-12 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center">🤖 Meet Aura - Your AI Stylist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mic className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Voice & Text Commands</h3>
                <p className="text-sm opacity-90">
                  Talk naturally or type questions. Aura understands context and remembers your conversation.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Scene Analysis</h3>
                <p className="text-sm opacity-90">
                  Aura analyzes your room, outfit, and the 3D product to give comprehensive style advice.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Proactive Suggestions</h3>
                <p className="text-sm opacity-90">
                  "Analyze My Vibe" and "Style Suggestions" for personalized recommendations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Try Advanced AR Now - Live Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Choose a Product for AR Experience:</h3>
                <div className="space-y-4">
                  {arCompatibleProducts.map((product) => (
                    <Card
                      key={product.id}
                      className={`cursor-pointer transition-all ${
                        selectedProduct.id === product.id
                          ? "border-2 border-purple-500 bg-purple-50"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={product.imageUrl || "/placeholder.svg"}
                            alt={product.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold">{product.title}</h4>
                            <p className="text-gray-600">${product.price}</p>
                            <Badge variant="secondary">{product.category}</Badge>
                          </div>
                          {selectedProduct.id === product.id && <Badge className="bg-purple-600">Selected</Badge>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* AR Preview */}
              <div className="text-center">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-8 mb-6 min-h-[300px] flex items-center justify-center">
                  <div>
                    <img
                      src={selectedProduct.imageUrl || "/placeholder.svg"}
                      alt={selectedProduct.title}
                      className="w-48 h-48 object-cover rounded-lg mx-auto mb-4"
                    />
                    <h3 className="text-xl font-semibold mb-2">{selectedProduct.title}</h3>
                    <p className="text-gray-600 mb-4">${selectedProduct.price}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => setShowAdvancedAR(true)}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Launch Advanced AR Experience
                  </Button>

                  <Button asChild variant="outline" size="lg" className="w-full bg-transparent">
                    <Link href={`/product/${selectedProduct.id}`}>View Product Details</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>🎯 3D & AR Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <Badge className="mt-1">1</Badge>
                <div>
                  <div className="font-semibold">Interactive 3D Models</div>
                  <div className="text-sm text-gray-600">Rotate, zoom, and examine products from every angle</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge className="mt-1">2</Badge>
                <div>
                  <div className="font-semibold">Real AR Placement</div>
                  <div className="text-sm text-gray-600">Use camera to place products in your actual space</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge className="mt-1">3</Badge>
                <div>
                  <div className="font-semibold">Scale & Position</div>
                  <div className="text-sm text-gray-600">Resize and move products to see perfect fit</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🤖 AI Stylist Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <Badge className="mt-1 bg-purple-600">✨</Badge>
                <div>
                  <div className="font-semibold">Analyze My Vibe</div>
                  <div className="text-sm text-gray-600">
                    AI analyzes your environment and suggests complementary items
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge className="mt-1 bg-purple-600">🪄</Badge>
                <div>
                  <div className="font-semibold">Style Suggestions</div>
                  <div className="text-sm text-gray-600">Get 3 specific accessories that match your product</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Badge className="mt-1 bg-purple-600">💬</Badge>
                <div>
                  <div className="font-semibold">Conversational Memory</div>
                  <div className="text-sm text-gray-600">Natural follow-up questions without repeating context</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced AR Viewer Modal */}
      {showAdvancedAR && <AdvancedARViewer product={selectedProduct} onClose={() => setShowAdvancedAR(false)} />}
    </div>
  )
}
