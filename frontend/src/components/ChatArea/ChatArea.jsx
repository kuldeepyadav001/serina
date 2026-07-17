import { useEffect, useRef } from "react"
import MessageBubble from "./MessageBubble"
import TypingIndicator from "./TypingIndicator"
import logo from "../../assets/logo.jpg"

const SUGGESTIONS = [
  { title: "Explain a concept", prompt: "Explain how Docker containers work in simple terms" },
  { title: "Summarize", prompt: "What are the key benefits of microservice architecture?" },
  { title: "Write code", prompt: "Write a Python function to reverse a string" },
  { title: "Ask about a PDF", prompt: "Upload a PDF from the sidebar and ask me anything about it" },
]

function ChatArea({ messages, isLoading, onSuggestionClick }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <img src={logo} alt="Serina" className="w-20 h-20 rounded-2xl mb-6 opacity-90" />
            <h2 className="text-2xl font-semibold text-white mb-2">How can I help you today?</h2>
            <p className="text-sm text-gray-500 mb-10">Ask anything, or upload a PDF to chat with your document</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => onSuggestionClick(s.prompt)}
                  className="text-left p-4 bg-[#12121a] hover:bg-[#1a1a24] border border-[#1f1f2e] hover:border-blue-500/30 rounded-xl transition group"
                >
                  <div className="text-sm font-medium text-white mb-1">{s.title}</div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-400 transition">{s.prompt}</div>
                </button>
              ))}
            </div>
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