function Sidebar({ isOpen }) {
  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-0"
      } bg-gray-800 border-r border-gray-700 transition-all duration-300 overflow-hidden flex flex-col`}
    >
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Documents
        </h2>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center text-gray-500 text-sm">
          📤 Upload PDF
          <br />
          <span className="text-xs">(Coming in Stage 5)</span>
        </div>
      </div>
    </div>
  )
}

export default Sidebar