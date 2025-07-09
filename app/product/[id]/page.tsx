"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, ShoppingCart, Heart, Share2, Eye, Sparkles } from "lucide-react"
import { getProductById } from "@/lib/products"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import { AdvancedARViewer } from "@/components/advanced-ar-viewer"

export default function ProductPage() {
  const params = useParams()
  const { addToCart } = useCart()
  const { toast } = useToast()
  const [showAdvancedAR, setShowAdvancedAR] = useState(false)

  const product = getProductById(params.id as string)

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/shop">Back to Shop</Link>
          </Button>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    addToCart(product)
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Button asChild variant="ghost" size="sm">
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Shop
            </Link>
          </Button>
          <span>/</span>
          <span>{product.category}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.title}
                  className="w-full h-auto object-cover"
                />
              </CardContent>
            </Card>

            {/* Advanced AR Experience Section */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <Sparkles className="h-12 w-12 mx-auto mb-2 animate-pulse" />
                  <h3 className="text-2xl font-bold mb-2">✨ AI-Powered AR Experience</h3>
                  <p className="opacity-90 mb-4">
                    Experience next-generation shopping with 3D viewing, AR placement, and AI stylist Aura
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="font-semibold mb-1">🎯 3D Product Viewing</div>
                    <div className="opacity-75">Rotate, zoom, examine from all angles</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="font-semibold mb-1">📱 AR Placement</div>
                    <div className="opacity-75">See it in your actual space</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="font-semibold mb-1">🤖 AI Stylist Aura</div>
                    <div className="opacity-75">Voice & text style advice</div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="font-semibold mb-1">✨ Smart Analysis</div>
                    <div className="opacity-75">Contextual recommendations</div>
                  </div>
                </div>

                <Button
                  onClick={() => setShowAdvancedAR(true)}
                  size="lg"
                  className="w-full bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Launch Advanced AR Experience
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{product.title}</h1>
              <p className="text-lg text-gray-600">by {product.brand}</p>
            </div>

            <div>
              <span className="text-4xl font-bold text-blue-600">${product.price.toLocaleString()}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Separator />

            {/* AI Features Highlight */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">🤖 Ask AI Stylist Aura:</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>• "How would this look in my living room?"</div>
                  <div>• "Analyze my vibe and suggest complementary items"</div>
                  <div>• "What accessories would go with this?"</div>
                  <div>• "Is this suitable for a formal occasion?"</div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Tags */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Reviews */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
              <div className="space-y-4">
                {product.reviews.map((review, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400 mr-3">
                          {Array(review.rating)
                            .fill(0)
                            .map((_, i) => (
                              <span key={i}>★</span>
                            ))}
                          {Array(5 - review.rating)
                            .fill(0)
                            .map((_, i) => (
                              <span key={i} className="text-gray-300">
                                ★
                              </span>
                            ))}
                        </div>
                        <span className="font-semibold">{review.user}</span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced AR Viewer Modal */}
      {showAdvancedAR && <AdvancedARViewer product={product} onClose={() => setShowAdvancedAR(false)} />}
    </div>
  )
}
