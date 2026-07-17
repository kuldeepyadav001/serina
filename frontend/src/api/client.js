const API_BASE = "/api"

export async function sendMessage(message, sessionId, documentId) {
  const body = {
    message,
    session_id: sessionId,
  }
  if (documentId) body.document_id = documentId

  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) throw new Error("Chat request failed")
  return response.json()
}

export async function sendMessageStream(message, sessionId, documentId, onChunk) {
  const body = {
    message,
    session_id: sessionId,
  }
  if (documentId) body.document_id = documentId

  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) throw new Error("Stream request failed")

  const newSessionId = response.headers.get("X-Session-Id")
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    fullText += chunk
    onChunk(fullText)
  }

  return { reply: fullText, session_id: newSessionId }
}

export async function uploadDocument(file) {
  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.detail || "Document upload failed")
  }

  return response.json()
}