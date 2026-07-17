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
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-4 bg-gray-800 border-t border-gray-700"
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={isLoading}
        className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 placeholder-gray-400 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isLoading || !text.trim()}
        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition disabled:opacity-50 disabled:hover:bg-blue-600"
      >
        Send ➤
      </button>
    </form>
  )
}

export default MessageInput