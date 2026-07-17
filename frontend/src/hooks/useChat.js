import { useState, useCallback } from "react"
import { sendMessageStream } from "../api/client"

export function useChat() {
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (text, documentId) => {
    if (!text.trim() || isLoading) return

    const userMessage = { role: "user", content: text }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    const assistantMessage = { role: "assistant", content: "" }
    setMessages(prev => [...prev, assistantMessage])

    try {
      const result = await sendMessageStream(text, sessionId, documentId, (streamedText) => {
        // Strip sources marker from displayed text
        let displayText = streamedText
        const sourcesIdx = displayText.indexOf("__SOURCES__")
        if (sourcesIdx !== -1) {
          displayText = displayText.substring(0, sourcesIdx).trim()
        }

        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: "assistant",
            content: displayText,
          }
          return updated
        })
      })

      if (result.session_id) {
        setSessionId(result.session_id)
      }
    } catch (error) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, isLoading])

  const clearChat = useCallback(() => {
    setMessages([])
    setSessionId(null)
  }, [])

  return { messages, isLoading, sendMessage, clearChat }
}