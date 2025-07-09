"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Heart, Share2, ArrowLeft } from "lucide-react"
import type { Product } from "@/lib/types"

interface ProductDisplayProps {
  product: Product
  onAddToCart: (productId: string) => void
  onNavigateToShop: () => void
}

export function ProductDisplay({ product, onAddToCart, onNavigateToShop }: ProductDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex items-center space-x-2">
        <button onClick={onNavigateToShop} className="hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Shop
        </button>
        <span>/</span>
        <span className="text-gray-900">{product.category}</span>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <img
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.title}
                className="w-full h-auto object-cover"
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">{product.title}</h1>
            <p className="text-lg text-gray-600 mt-2">by {product.brand}</p>
            <p className="text-3xl font-semibold text-blue-600 mt-4">${product.price.toLocaleString()}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button size="lg" className="flex-1" onClick={() => onAddToCart(product.id)}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            <Button variant="outline" size="lg">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Category and Tags */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Category</h3>
            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{product.category}</span>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Reviews</h3>
            <div className="space-y-4">
              {product.reviews.map((review, index) => (
                <div key={index} className="border-b pb-4">
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400 mr-2">
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
