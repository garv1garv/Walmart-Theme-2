"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { ModelViewer } from "@/components/model-viewer"
import type { Product } from "@/lib/types"

interface AIStylistPanelProps {
  product: Product
  cart: Array<Product & { quantity: number }>
  onUpdateCart: (cart: Array<Product & { quantity: number }>) => void
}

export function AIStylistPanel({ product, cart, onUpdateCart }: AIStylistPanelProps) {
  const [showCart, setShowCart] = useState(false)

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      onUpdateCart(cart.filter((item) => item.id !== productId))
    } else {
      onUpdateCart(cart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const removeItem = (productId: string) => {
    onUpdateCart(cart.filter((item) => item.id !== productId))
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <h2 className="text-2xl font-bold">AI Stylist</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCart(!showCart)}
          className="text-white hover:bg-gray-700 relative"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItemCount}
            </span>
          )}
        </Button>
      </div>

      {showCart ? (
        /* Cart View */
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold">Shopping Cart</h3>
          </div>

          <ScrollArea className="flex-1 p-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <Card key={item.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={item.imageUrl || "/placeholder.svg"}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">{item.title}</h4>
                          <p className="text-gray-400">${item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0 text-white hover:bg-gray-700"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-white">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 text-white hover:bg-gray-700"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 p-0 text-red-400 hover:bg-gray-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>

          {cart.length > 0 && (
            <div className="p-4 border-t border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold text-blue-400">${cartTotal.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Proceed to Checkout</Button>
            </div>
          )}
        </div>
      ) : (
        /* 3D Model View */
        <>
          <div className="flex-shrink-0 h-80 bg-gray-800 relative">
            <ModelViewer src="https://modelviewer.dev/shared-assets/models/Astronaut.glb" alt={product.title} />
          </div>

          <div className="flex-1 p-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
              <p className="text-gray-300 text-sm mb-3">{product.description.substring(0, 100)}...</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-blue-400">${product.price}</span>
                <span className="text-sm text-gray-400">{product.category}</span>
              </div>
            </div>

            <div className="mt-4 text-center text-gray-400">
              <p className="text-sm">Use the AI assistant below to get personalized styling advice!</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
