import { useEffect, useRef } from "react"
import MessageBubble from "./MessageBubble"
import TypingIndicator from "./TypingIndicator"

function ChatArea({ messages, isLoading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <span className="text-4xl mb-4">🤖</span>
          <p className="text-lg">Start a conversation</p>
          <p className="text-sm mt-1">Ask me anything or upload a PDF</p>
        </div>
      )}

      {messages.map((msg, index) => (
        <MessageBubble key={index} message={msg} />
      ))}

      {isLoading && messages[messages.length - 1]?.content === "" && (
        <TypingIndicator />
      )}

      <div ref={bottomRef} />
    </div>
  )
}

export default ChatArea