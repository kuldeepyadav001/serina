function TopBar({ onNewChat }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <h1 className="text-lg font-bold text-white">DocuChat AI</h1>
      </div>
      <button
        onClick={onNewChat}
        className="px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
      >
        + New Chat
      </button>
    </div>
  )
}

export default TopBar