import { useState, useCallback, useEffect } from "react"
import { 
  uploadDocument as uploadDocumentApi, 
  listDocuments,
  deleteDocument as deleteDocumentApi,
} from "../api/client"

export function useDocuments() {
  const [documents, setDocuments] = useState([])
  const [activeDocumentId, setActiveDocumentId] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch documents on mount
  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await listDocuments()
      setDocuments(docs)
    } catch (err) {
      console.error("Failed to fetch documents:", err)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const uploadDocument = useCallback(async (file) => {
    if (!file) return
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadDocumentApi(file)
      // Refresh full list after upload
      await fetchDocuments()
      // Auto-select the newly uploaded doc
      setActiveDocumentId(result.id)
      return result
    } catch (err) {
      setError(err.message || "Upload failed")
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [fetchDocuments])

  const removeDocument = useCallback(async (documentId) => {
    try {
      await deleteDocumentApi(documentId)
      // If we deleted the active doc, clear selection
      if (activeDocumentId === documentId) {
        setActiveDocumentId(null)
      }
      await fetchDocuments()
    } catch (err) {
      setError(err.message || "Delete failed")
    }
  }, [activeDocumentId, fetchDocuments])

  const selectDocument = useCallback((documentId) => {
    setActiveDocumentId(documentId)
  }, [])

  return {
    documents,
    activeDocumentId,
    isUploading,
    error,
    uploadDocument,
    removeDocument,
    selectDocument,
  }
}