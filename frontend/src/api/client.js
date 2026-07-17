const API_BASE = "/api"

export async function sendMessage(message, sessionId) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      session_id: sessionId,
    }),
  })

  if (!response.ok) throw new Error("Chat request failed")
  return response.json()
}

export async function sendMessageStream(message, sessionId, onChunk) {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      session_id: sessionId,
    }),
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