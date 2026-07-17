import { useState } from "react"
import ReactMarkdown from "react-markdown"

function MessageBubble({ message }) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === "user"

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-5 group`}>
      <div className="max-w-[85%] relative">
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? "bg-blue-600 text-white rounded-br-md shadow-[0_0_20px_rgba(59,130,246,0.15)]"
              : "bg-[#1a1a24] text-gray-100 rounded-bl-md border border-[#1f1f2e]"
          }`}
        >
          {isUser ? (
            <div className="whitespace-pre-wrap">{message.content}</div>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && message.content && (
          <button
            onClick={handleCopy}
            className="absolute -bottom-6 left-2 text-xs text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  )
}

export default MessageBubble