function MessageBubble({ message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-5`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-blue-600 text-white rounded-br-md shadow-[0_0_20px_rgba(59,130,246,0.15)]"
            : "bg-[#1a1a24] text-gray-100 rounded-bl-md border border-[#1f1f2e]"
        }`}
      >
        {message.content}
      </div>
    </div>
  )
}

export default MessageBubble