"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  ShoppingCart,
  Mic,
  MicOff,
  Camera,
  Send,
  MessageSquare,
  Menu,
  Volume2,
  VolumeX,
  ChevronDown,
  Sparkles,
  User,
  Heart,
  Package,
  Zap,
  AlertCircle,
  Settings,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/hooks/use-cart"
import { useAIAssistant } from "@/hooks/use-ai-assistant"
import { getCategories, searchProducts } from "@/lib/products"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { cart, cartTotal, cartItemCount } = useCart()
  const {
    isListening,
    isProcessing,
    isSpeaking,
    speechSupported,
    startListening,
    stopListening,
    sendTextQuery,
    sendImageQuery,
    toggleSpeech,
    speechEnabled,
  } = useAIAssistant()

  const [searchQuery, setSearchQuery] = useState("")
  const [aiInput, setAiInput] = useState("")
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const categories = getCategories()

  const navLinks = [
    { href: "/", label: "Home", icon: null },
    { href: "/shop", label: "Shop", icon: Package },
    { href: "/ar-showcase", label: "AR Experience", icon: Sparkles },
    { href: "/voice-test", label: "Voice Test", icon: Settings },
    { href: "/about", label: "About", icon: null },
    { href: "/contact", label: "Contact", icon: null },
  ]

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchProducts(searchQuery).slice(0, 8)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearch(false)
      setSearchQuery("")
    }
  }

  const handleProductSelect = (productId: string) => {
    router.push(`/product/${productId}`)
    setShowSearch(false)
    setSearchQuery("")
  }

  const handleCategorySelect = (category: string) => {
    router.push(`/shop?category=${encodeURIComponent(category)}`)
  }

  const handleAITextSubmit = () => {
    if (aiInput.trim()) {
      sendTextQuery(aiInput.trim())
      setAiInput("")
      setShowAIPanel(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const query = prompt("What would you like me to analyze about this image?") || "Analyze this image"
      sendImageQuery(file, query)
      setShowAIPanel(false)
    }
  }

  const handleVoiceClick = async () => {
    console.log("Voice button clicked, isListening:", isListening)

    if (isListening) {
      console.log("Stopping voice...")
      stopListening()
    } else {
      console.log("Starting voice...")
      const success = await startListening()
      console.log("Voice start result:", success)

      if (!success) {
        toast({
          title: "Voice Test Available",
          description: "Having trouble with voice? Try the Voice Test page to debug issues.",
          action: (
            <Button variant="outline" size="sm" onClick={() => router.push("/voice-test")}>
              Test Voice
            </Button>
          ),
        })
      }
    }
  }

  const handleFeedback = () => {
    const feedback = prompt("Please share your feedback:")
    if (feedback) {
      sendTextQuery(`User feedback: ${feedback}`)
      setShowAIPanel(false)
    }
  }

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Shopmart
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium transition-colors rounded-md ${
                  pathname === link.href
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                <span>{link.label}</span>
              </Link>
            ))}

            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-1">
                  <span>Categories</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {categories.map((category) => (
                  <DropdownMenuItem
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="cursor-pointer"
                  >
                    {category}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Enhanced Search */}
            <Popover open={showSearch} onOpenChange={setShowSearch}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="hidden md:flex items-center space-x-2 bg-transparent">
                  <Search className="h-4 w-4" />
                  <span className="text-gray-500">Search products...</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Search products..." value={searchQuery} onValueChange={setSearchQuery} />
                  <CommandList>
                    {searchResults.length === 0 && searchQuery && <CommandEmpty>No products found.</CommandEmpty>}
                    {searchResults.length > 0 && (
                      <CommandGroup heading="Products">
                        {searchResults.map((product) => (
                          <CommandItem
                            key={product.id}
                            onSelect={() => handleProductSelect(product.id)}
                            className="flex items-center space-x-3 cursor-pointer"
                          >
                            <img
                              src={product.imageUrl || "/placeholder.svg"}
                              alt={product.title}
                              className="w-10 h-10 object-cover rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">{product.title}</div>
                              <div className="text-xs text-gray-500">${product.price}</div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {product.category}
                            </Badge>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {/* AI Assistant Panel */}
            <DropdownMenu open={showAIPanel} onOpenChange={setShowAIPanel}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={`relative bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 ${
                    isProcessing ? "animate-pulse" : ""
                  }`}
                  disabled={isProcessing}
                >
                  <Sparkles className="h-4 w-4 mr-2 text-purple-600" />
                  <span className="text-purple-700">Aura AI</span>
                  {isListening && <Badge className="absolute -top-2 -right-2 bg-red-500 animate-pulse">●</Badge>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-4">
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-purple-700">✨ Aura AI Stylist</h3>
                    <p className="text-xs text-gray-600">Your intelligent shopping assistant</p>
                  </div>

                  {/* Voice Status */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Voice Recognition: {speechSupported ? "✅ Available" : "❌ Not Available"}
                      {!speechSupported && (
                        <>
                          <br />
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-xs"
                            onClick={() => router.push("/voice-test")}
                          >
                            → Test Voice System
                          </Button>
                        </>
                      )}
                    </AlertDescription>
                  </Alert>

                  {/* Text Input */}
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Ask AI assistant..."
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAITextSubmit()}
                      disabled={isProcessing}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleAITextSubmit} disabled={!aiInput.trim() || isProcessing}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleVoiceClick}
                      disabled={isProcessing}
                      className={isListening ? "bg-red-50 border-red-200" : ""}
                    >
                      {isListening ? <MicOff className="h-4 w-4 mr-2" /> : <Mic className="h-4 w-4 mr-2" />}
                      {isListening ? "Stop" : "Voice"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isProcessing}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Photo
                    </Button>

                    <Button variant="outline" size="sm" onClick={handleFeedback} disabled={isProcessing}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Feedback
                    </Button>

                    <Button variant="outline" size="sm" onClick={toggleSpeech}>
                      {speechEnabled ? <Volume2 className="h-4 w-4 mr-2" /> : <VolumeX className="h-4 w-4 mr-2" />}
                      {speechEnabled ? "Mute" : "Speak"}
                    </Button>
                  </div>

                  {/* Status Indicators */}
                  {isSpeaking && (
                    <div className="text-center text-sm text-purple-600 animate-pulse">Aura is speaking...</div>
                  )}

                  {isListening && (
                    <div className="text-center">
                      <Badge className="bg-red-500 animate-pulse">🎤 LISTENING - Speak now!</Badge>
                    </div>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wishlist */}
            <Button variant="outline" size="sm" className="hidden md:flex bg-transparent">
              <Heart className="h-4 w-4" />
            </Button>

            {/* Account */}
            <Button variant="outline" size="sm" className="hidden md:flex bg-transparent">
              <User className="h-4 w-4" />
            </Button>

            {/* Cart */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative bg-transparent">
                  <ShoppingCart className="h-4 w-4" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Shopping Cart</span>
                  </SheetTitle>
                  <SheetDescription>
                    {cartItemCount === 0 ? "Your cart is empty" : `${cartItemCount} items • $${cartTotal.toFixed(2)}`}
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p className="text-lg font-medium mb-2">Your cart is empty</p>
                      <p className="text-sm mb-4">Add some products to get started</p>
                      <Button asChild>
                        <Link href="/shop">Start Shopping</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="max-h-96 overflow-y-auto space-y-3">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                            <img
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                              <p className="text-gray-600 text-sm">${item.price}</p>
                              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total:</span>
                          <span className="font-bold text-lg text-blue-600">${cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="space-y-2">
                          <Button className="w-full" size="lg">
                            Proceed to Checkout
                          </Button>
                          <Button variant="outline" className="w-full bg-transparent" asChild>
                            <Link href="/shop">Continue Shopping</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <span>Shopmart</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Mobile Search */}
                  <div>
                    <form onSubmit={handleSearch} className="flex space-x-2">
                      <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" size="sm">
                        <Search className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-2">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center space-x-3 px-3 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                      >
                        {link.icon && <link.icon className="h-5 w-5" />}
                        <span>{link.label}</span>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Categories */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => handleCategorySelect(category)}
                          className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Hidden file input for image upload */}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
    </nav>
  )
}
