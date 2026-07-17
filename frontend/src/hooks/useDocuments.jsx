import { useState, useCallback } from "react"
import { uploadDocument as uploadDocumentApi } from "../api/client"

export function useDocuments() {
  const [document, setDocument] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)

  const uploadDocument = useCallback(async (file) => {
    if (!file) return

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported in v1.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadDocumentApi(file)
      setDocument(result)
      return result
    } catch (err) {
      setError(err.message || "Upload failed")
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [])

  const clearDocument = useCallback(() => {
    setDocument(null)
    setError(null)
  }, [])

  return {
    document,
    isUploading,
    error,
    uploadDocument,
    clearDocument,
  }
}