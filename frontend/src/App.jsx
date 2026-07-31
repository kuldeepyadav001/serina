import { useState } from "react"
import TopBar from "./components/TopBar"
import Sidebar from "./components/Sidebar/Sidebar"
import ChatArea from "./components/ChatArea/ChatArea"
import MessageInput from "./components/MessageInput"
import { useChat } from "./hooks/useChat"
import { useDocuments } from "./hooks/useDocuments"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { messages, isLoading, sendMessage, clearChat } = useChat()
  const {
    documents,
    activeDocumentId,
    isUploading,
    error: uploadError,
    uploadDocument,
    removeDocument,
    selectDocument,
  } = useDocuments()

  const handleSend = (text) => sendMessage(text, activeDocumentId)

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0f]">
      <TopBar
        onNewChat={() => {
          clearChat()
          selectDocument(null)
        }}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          documents={documents}
          activeDocumentId={activeDocumentId}
          isUploading={isUploading}
          uploadError={uploadError}
          onUpload={uploadDocument}
          onSelectDocument={selectDocument}
          onRemoveDocument={removeDocument}
        />

        <div className="flex flex-col flex-1">
          <ChatArea messages={messages} isLoading={isLoading} onSuggestionClick={handleSend} />
          <MessageInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default App