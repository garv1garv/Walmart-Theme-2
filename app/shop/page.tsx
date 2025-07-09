"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Filter } from "lucide-react"
import { PRODUCTS_DB, getCategories, searchProducts } from "@/lib/products"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/lib/types"

export default function ShopPage() {
  const searchParams = useSearchParams()
  const { addToCart } = useCart()
  const { toast } = useToast()

  const [products, setProducts] = useState<Product[]>(PRODUCTS_DB)
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS_DB)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all")
  const [sortBy, setSortBy] = useState("name")

  const categories = getCategories()

  useEffect(() => {
    let filtered = PRODUCTS_DB

    // Apply search filter
    if (searchQuery) {
      filtered = searchProducts(searchQuery)
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "name":
        default:
          return a.title.localeCompare(b.title)
      }
    })

    setFilteredProducts(filtered)
  }, [searchQuery, selectedCategory, sortBy])

  const handleAddToCart = (product: Product) => {
    addToCart(product)
    toast({
      title: "Added to cart",
      description: `${product.title} has been added to your cart.`,
    })
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSortBy("name")
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Shop All Products</h1>
          <p className="text-gray-600">Discover our complete collection of products with AI-powered recommendations</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Sort by Name</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""}
              </Badge>
              {(searchQuery || selectedCategory !== "all") && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ShoppingCart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <Link href={`/product/${product.id}`}>
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </Link>
                  <div className="p-4">
                    <div className="mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    </div>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-lg font-semibold mb-2 hover:text-blue-600 cursor-pointer line-clamp-2">
                        {product.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-blue-600">${product.price}</span>
                      <Button size="sm" onClick={() => handleAddToCart(product)}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
