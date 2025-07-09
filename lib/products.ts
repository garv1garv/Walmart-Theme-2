import type { Product } from "./types"
import productsData from "@/data/products.json"

export const PRODUCTS_DB: Product[] = productsData as Product[]

export function getProductById(id: string): Product | undefined {
  return PRODUCTS_DB.find((product) => product.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS_DB.filter((product) => product.category === category)
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase()
  return PRODUCTS_DB.filter(
    (product) =>
      product.title.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery)),
  )
}

export function getCategories(): string[] {
  return [...new Set(PRODUCTS_DB.map((product) => product.category))]
}
