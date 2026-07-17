import { useEffect, useRef } from "react"
import MessageBubble from "./MessageBubble"
import TypingIndicator from "./TypingIndicator"
import logo from "../../assets/logo.jpg"

function ChatArea({ messages, isLoading }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[70vh] text-center">
            <img src={logo} alt="Serina" className="w-20 h-20 rounded-2xl mb-6 opacity-90" />
            <h2 className="text-2xl font-semibold text-white mb-2">How can I help you today?</h2>
            <p className="text-sm text-gray-500">Ask anything, or upload a PDF to chat with your document</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <MessageBubble key={index} message={msg} />
        ))}

        {isLoading && messages[messages.length - 1]?.content === "" && <TypingIndicator />}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

export default ChatArea