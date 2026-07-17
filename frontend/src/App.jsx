import { useState } from "react"
import TopBar from "./components/TopBar"
import Sidebar from "./components/Sidebar/Sidebar"
import ChatArea from "./components/ChatArea/ChatArea"
import MessageInput from "./components/MessageInput"
import { useChat } from "./hooks/useChat"
import { useDocuments } from "./hooks/useDocuments"

function App() {
  const [sidebarOpen] = useState(true)

  const { messages, isLoading, sendMessage, clearChat } = useChat()
  const {
    document,
    isUploading,
    error: uploadError,
    uploadDocument,
    clearDocument,
  } = useDocuments()

  const handleSendMessage = (text) => {
    const docId = document?.document_id || null
    sendMessage(text, docId)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <TopBar
        onNewChat={() => {
          clearChat()
          clearDocument()
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          document={document}
          isUploading={isUploading}
          uploadError={uploadError}
          onUpload={uploadDocument}
          onClearDocument={clearDocument}
        />

        <div className="flex flex-col flex-1">
          <ChatArea messages={messages} isLoading={isLoading} />
          <MessageInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default App