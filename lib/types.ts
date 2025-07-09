export interface Product {
  id: string
  title: string
  brand: string
  description: string
  tags: string[]
  category: string
  price: number
  imageUrl: string
  reviews: Review[]
}

export interface Review {
  rating: number
  user: string
  comment: string
}

export interface Action {
  action: string
  target: string
  value?: any
}

export interface AIResponse {
  explanation: string
  action_plan: Action[]
  generative_prompt?: string
}

export interface UserInput {
  session_id: string
  chat_history: Array<{ role: string; content: string }>
  query: string
  screen_context: string
  language?: string
}

export interface ScreenContext {
  current_page: string
  url: string
  visible_products: Array<{
    id: string
    title: string
    price: number
    category: string
  }>
  cart_items: number
  cart_total: number
  search_query?: string
}
