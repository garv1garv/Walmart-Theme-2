"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Sparkles, Zap, Shield, MessageSquare } from "lucide-react"
import { PRODUCTS_DB } from "@/lib/products"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const { addToCart } = useCart()
  const { toast } = useToast()

  const featuredProducts = PRODUCTS_DB.slice(0, 3)

  const handleAddToCart = (product: any) => {
    addToCart(product)
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to Shopmart</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Experience the future of shopping with our AI-powered assistant, AR try-on features, and personalized
            recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/shop">Start Shopping</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
          <div className="mt-8 p-6 bg-white/10 rounded-lg backdrop-blur-sm">
            <h3 className="text-xl font-semibold mb-4">🥽 Experience AR Shopping</h3>
            <p className="mb-4">Try our revolutionary AR features - view products in your space before buying!</p>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/20 bg-transparent">
              <Link href="/ar-showcase">Try AR Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Shopmart?</h2>
            <p className="text-lg text-gray-600">Revolutionary features that transform your shopping experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Assistant</h3>
                <p className="text-gray-600">
                  Get personalized recommendations, voice commands, and intelligent shopping assistance.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 border-2 border-purple-200 bg-purple-50">
              <CardContent className="pt-6">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AR/VR Experience</h3>
                <p className="text-gray-600">Visualize products in your space with cutting-edge AR technology.</p>
                <Button asChild size="sm" className="mt-3 bg-purple-600 hover:bg-purple-700">
                  <Link href="/ar-showcase">Try AR</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Fast</h3>
                <p className="text-gray-600">Enterprise-grade security with lightning-fast delivery.</p>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="pt-6">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Voice Shopping</h3>
                <p className="text-gray-600">Shop hands-free with voice commands and spoken responses.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600">Discover our most popular items</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <img
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{product.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/product/${product.id}`}>View</Link>
                        </Button>
                        <Button size="sm" onClick={() => handleAddToCart(product)}>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/shop">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
