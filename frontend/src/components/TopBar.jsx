import logo from "../assets/logo.jpg"

function TopBar({ onNewChat, onToggleSidebar }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-[#12121a] border-b border-[#1f1f2e]">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 hover:bg-[#1a1a24] rounded-lg transition text-gray-400 hover:text-white"
          title="Toggle sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <img src={logo} alt="Serina" className="w-8 h-8 rounded-lg object-cover" />
          <h1 className="text-lg font-semibold text-white tracking-tight">Serina</h1>
        </div>
      </div>

      <button
        onClick={onNewChat}
        className="px-4 py-1.5 text-sm bg-[#1a1a24] hover:bg-[#22222e] text-gray-200 rounded-lg transition border border-[#1f1f2e]"
      >
        + New Chat
      </button>
    </div>
  )
}

export default TopBar