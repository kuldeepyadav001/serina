function TypingIndicator() {
  return (
    <div className="flex justify-start mb-5">
      <div className="bg-[#1a1a24] border border-[#1f1f2e] px-4 py-3.5 rounded-2xl rounded-bl-md">
        <div className="flex gap-1.5">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator