function Sidebar({
  isOpen,
  documents,
  activeDocumentId,
  isUploading,
  uploadError,
  onUpload,
  onSelectDocument,
  onRemoveDocument,
}) {
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
      <div className="p-5 min-w-72 flex flex-col h-full">
        {/* Upload section */}
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Upload
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

        {/* Documents list */}
        <div className="mt-6 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Documents ({documents.length})
            </h3>
          </div>

          {documents.length === 0 && !isUploading && (
            <div className="text-xs text-gray-600 text-center py-4">
              No documents yet
            </div>
          )}

          {/* "All Documents" option */}
          {documents.length > 0 && (
            <button
              onClick={() => onSelectDocument(null)}
              className={`w-full text-left p-3 mb-2 rounded-lg transition text-sm ${
                activeDocumentId === null
                  ? "bg-blue-600/20 border border-blue-500/50 text-white"
                  : "bg-[#1a1a24] border border-[#1f1f2e] hover:bg-[#22222e] text-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>📚</span>
                <span>All Documents</span>
              </div>
            </button>
          )}

          {/* Individual documents */}
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`p-3 rounded-lg transition ${
                  activeDocumentId === doc.id
                    ? "bg-blue-600/20 border border-blue-500/50"
                    : "bg-[#1a1a24] border border-[#1f1f2e] hover:bg-[#22222e]"
                }`}
              >
                <button
                  onClick={() => onSelectDocument(doc.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {doc.status === "ready" && (
                      <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
                    )}
                    {doc.status === "processing" && (
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    )}
                    {doc.status === "failed" && (
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    )}
                    <span className="text-xs text-gray-400 capitalize">{doc.status}</span>
                  </div>

                  <div className="text-sm text-white truncate mb-1" title={doc.filename}>
                    {doc.filename}
                  </div>

                  <div className="text-xs text-gray-500">
                    {doc.chunks_count} chunks · {(doc.file_size / 1024).toFixed(1)} KB
                  </div>
                </button>

                <button
                  onClick={() => onRemoveDocument(doc.id)}
                  className="mt-2 w-full px-2 py-1 text-xs text-gray-400 hover:text-red-400 bg-[#12121a] hover:bg-red-950/30 rounded transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar