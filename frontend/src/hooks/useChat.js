import { useState, useCallback } from "react"
import { sendMessageStream } from "../api/client"

export function useChat() {
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return

    const userMessage = { role: "user", content: text }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    const assistantMessage = { role: "assistant", content: "" }
    setMessages(prev => [...prev, assistantMessage])

    try {
      const result = await sendMessageStream(text, sessionId, (streamedText) => {
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: "assistant",
            content: streamedText,
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