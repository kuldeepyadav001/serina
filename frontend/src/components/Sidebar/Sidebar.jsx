function Sidebar({ isOpen, document, isUploading, uploadError, onUpload, onClearDocument }) {
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await onUpload(file)
    } finally {
      e.target.value = ""
    }
  }

  return (
    <div
      className={`${
        isOpen ? "w-72" : "w-0"
      } bg-[#12121a] border-r border-[#1f1f2e] transition-all duration-300 overflow-hidden flex flex-col`}
    >
      <div className="p-5 min-w-72">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Document
        </h2>

        <label className="block border border-dashed border-[#2a2a3a] hover:border-blue-500/50 rounded-xl p-5 text-center cursor-pointer transition group">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="text-blue-400 text-sm">
              <div className="mb-1">Processing...</div>
              <div className="text-xs text-gray-500">Extracting & embedding</div>
            </div>
          ) : (
            <div className="text-gray-400 group-hover:text-gray-300 text-sm">
              <div className="text-2xl mb-2">📄</div>
              Upload PDF
              <div className="text-xs text-gray-600 mt-1">Click to browse</div>
            </div>
          )}
        </label>

        {uploadError && (
          <div className="mt-3 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg p-2.5">
            {uploadError}
          </div>
        )}

        {document && (
          <div className="mt-5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Active
            </h3>

            <div className="bg-[#1a1a24] border border-[#1f1f2e] rounded-xl p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
                <span className="text-xs text-green-400 font-medium">Ready</span>
              </div>
              <div className="text-sm text-white truncate mb-1" title={document.filename}>
                {document.filename}
              </div>
              <div className="text-xs text-gray-500">
                {document.chunks_count} chunks indexed
              </div>

              <button
                onClick={onClearDocument}
                className="mt-3 w-full px-2 py-1.5 text-xs text-gray-400 hover:text-white bg-[#12121a] hover:bg-[#22222e] rounded-lg transition"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar