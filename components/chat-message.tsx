import { cn } from "@/lib/utils"
import type { Message } from "ai"

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user"

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-xs lg:max-w-sm px-4 py-2 rounded-lg text-sm",
          isUser ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100",
        )}
      >
        {message.content}
      </div>
    </div>
  )
}
