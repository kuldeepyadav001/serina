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
        isOpen ? "w-64" : "w-0"
      } bg-gray-800 border-r border-gray-700 transition-all duration-300 overflow-hidden flex flex-col`}
    >
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Documents
        </h2>

        <label className="block border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg p-4 text-center text-gray-400 text-sm cursor-pointer transition">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div>
              <div className="text-blue-400 mb-1">Processing...</div>
              <div className="text-xs text-gray-500">
                Extracting, chunking, embedding
              </div>
            </div>
          ) : (
            <div>
              📤 Upload PDF
              <br />
              <span className="text-xs text-gray-500">
                Single PDF for v1
              </span>
            </div>
          )}
        </label>

        {uploadError && (
          <div className="mt-3 text-sm text-red-400 bg-red-950/40 border border-red-800 rounded-lg p-2">
            {uploadError}
          </div>
        )}

        {document && (
          <div className="mt-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Active Document
            </h3>

            <div className="bg-gray-700 rounded-lg p-3 text-sm">
              <div className="text-green-400 mb-1">✅ Ready</div>
              <div className="text-white truncate" title={document.filename}>
                {document.filename}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {document.chunks_count} chunks stored
              </div>

              <button
                onClick={onClearDocument}
                className="mt-3 w-full px-2 py-1.5 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition"
              >
                Clear Document
              </button>
            </div>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Chat History
          </h3>
          <div className="text-sm text-gray-500">
            Current chat only in v1
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar