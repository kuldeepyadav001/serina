import { useState } from "react"
import TopBar from "./components/TopBar"
import Sidebar from "./components/Sidebar/Sidebar"
import ChatArea from "./components/ChatArea/ChatArea"
import MessageInput from "./components/MessageInput"
import { useChat } from "./hooks/useChat"

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { messages, isLoading, sendMessage, clearChat } = useChat()

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <TopBar
        onNewChat={() => {
          clearChat()
        }}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />

        <div className="flex flex-col flex-1">
          <ChatArea messages={messages} isLoading={isLoading} />
          <MessageInput onSend={sendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default App