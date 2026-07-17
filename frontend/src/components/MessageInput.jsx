import { useState } from "react"

function MessageInput({ onSend, isLoading }) {
  const [text, setText] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || isLoading) return
    onSend(text.trim())
    setText("")
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="border-t border-[#1f1f2e] bg-[#0a0a0f]">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Serina..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 bg-[#1a1a24] text-white rounded-xl border border-[#1f1f2e] focus:outline-none focus:border-blue-500/50 focus:shadow-[0_0_20px_rgba(59,130,246,0.1)] placeholder-gray-600 disabled:opacity-50 transition text-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition disabled:opacity-40 disabled:hover:bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  )
}

export default MessageInput