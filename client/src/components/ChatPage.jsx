import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Input } from './ui/input'
import { Send, Bot, User, Loader2, RefreshCw } from 'lucide-react'
import moment from 'moment'

export function ChatPage() {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [currentModel, setCurrentModel] = useState('microsoft/DialoGPT-medium')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('https://fmaa-backend.fly.dev', {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    newSocket.on('message_received', (message) => {
      setMessages(prev => [...prev, message])
    })

    newSocket.on('message_start', (message) => {
      setMessages(prev => [...prev, { ...message, text: '', isStreaming: true }])
    })

    newSocket.on('message_chunk', (data) => {
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage && lastMessage.id === data.id) {
          lastMessage.text = data.fullText
        }
        return newMessages
      })
    })

    newSocket.on('message_complete', (message) => {
      setMessages(prev => {
        const newMessages = [...prev]
        const lastMessage = newMessages[newMessages.length - 1]
        if (lastMessage && lastMessage.id === message.id) {
          lastMessage.text = message.text
          lastMessage.isStreaming = false
        }
        return newMessages
      })
    })

    newSocket.on('agent_typing', (data) => {
      setIsTyping(data.isTyping)
    })

    newSocket.on('message_error', (error) => {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: error.error,
        sender: 'system',
        timestamp: Date.now()
      }])
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const sendMessage = () => {
    if (inputMessage.trim() && socket && isConnected) {
      socket.emit('send_message', {
        message: inputMessage,
        timestamp: Date.now()
      })
      setInputMessage('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const resetConversation = () => {
    if (socket) {
      socket.emit('reset_conversation')
      setMessages([])
    }
  }

  const switchModel = (model) => {
    if (socket) {
      socket.emit('switch_model', { model })
      setCurrentModel(model)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Chat</h1>
          <p className="text-muted-foreground">
            Chat with FMAA AI Assistant powered by Hugging Face
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Connected" : "Disconnected"}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={resetConversation}
            disabled={!isConnected}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Chat
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Selection</CardTitle>
            <CardDescription>
              Choose the AI model for your conversation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {[
                'microsoft/DialoGPT-medium',
                'microsoft/DialoGPT-large',
                'facebook/blenderbot-400M-distill'
              ].map((model) => (
                <Button
                  key={model}
                  variant={currentModel === model ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchModel(model)}
                  disabled={!isConnected}
                >
                  {model.split('/')[1]}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>
              {isTyping && (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  AI is typing...
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 border rounded-lg p-4 mb-4 overflow-y-auto">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Start a conversation with FMAA AI Assistant</p>
                    <p className="text-sm">Ask me anything!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] ${
                          message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          {message.sender === 'user' ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary text-secondary-foreground'
                          }`}
                        >
                          <p className="text-sm">
                            {message.text}
                            {message.isStreaming && (
                              <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
                            )}
                          </p>
                          <p className="text-xs opacity-70 mt-1">
                            {moment(message.timestamp).format('HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!isConnected || isTyping}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || !isConnected || isTyping}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}