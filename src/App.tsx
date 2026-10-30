import { useChatMina } from './hooks/useChatMina'
import Sidebar from './components/Sidebar'
import ChatHeader from './components/ChatHeader'
import MessageList from './components/MessageList'
import WelcomeScreen from './components/WelcomeScreen'
import Composer from './components/Composer'

export default function App() {
  const {
    conversations,
    activeConversation,
    activeId,
    modelId,
    isStreaming,
    sidebarCollapsed,
    newConversation,
    selectConversation,
    deleteConversation,
    changeModel,
    toggleSidebar,
    stopGeneration,
    sendMessage,
  } = useChatMina()

  const hasMessages = !!activeConversation && activeConversation.messages.length > 0

  return (
    <div className="flex h-full w-full overflow-hidden bg-canvas">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        collapsed={sidebarCollapsed}
        onNew={newConversation}
        onSelect={selectConversation}
        onDelete={deleteConversation}
      />

      {!sidebarCollapsed && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={toggleSidebar}
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
        />
      )}

      <main className="flex min-w-0 flex-1 flex-col">
        <ChatHeader
          modelId={modelId}
          collapsed={sidebarCollapsed}
          onModelChange={changeModel}
          onToggleSidebar={toggleSidebar}
        />

        <section className="min-h-0 flex-1">
          {hasMessages && activeConversation ? (
            <MessageList messages={activeConversation.messages} isStreaming={isStreaming} />
          ) : (
            <WelcomeScreen onSuggestion={sendMessage} />
          )}
        </section>

        <Composer isStreaming={isStreaming} onSend={sendMessage} onStop={stopGeneration} />
      </main>
    </div>
  )
}
