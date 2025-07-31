import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Send, Bot, User, Settings, RotateCcw, Activity, Wifi, WifiOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import moment from 'moment';
import './App.css';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentModel, setCurrentModel] = useState('gpt-4o-mini');
  const [streamingMessage, setStreamingMessage] = useState('');
  const [streamingId, setStreamingId] = useState(null);
  const [serverUrl, setServerUrl] = useState(
    process.env.REACT_APP_SERVER_URL || 
    'https://fmaa-backend.onrender.com' || 
    'http://localhost:5000'
  );
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Available models
  const models = [
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast)' },
    { id: 'gpt-4o', name: 'GPT-4o (Powerful)' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
  ];

  // Demo mode - if no backend available
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    connectToServer();
  }, [serverUrl]);

  const connectToServer = () => {
    try {
      // Initialize socket connection
      const newSocket = io(serverUrl, {
        withCredentials: true,
        timeout: 5000
      });

      setSocket(newSocket);

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('🔗 Connected to FMAA server');
        setIsConnected(true);
        setDemoMode(false);
        addSystemMessage('Connected to FMAA Assistant! How can I help you today?');
      });

      newSocket.on('disconnect', () => {
        console.log('🔌 Disconnected from server');
        setIsConnected(false);
        addSystemMessage('Disconnected from server. Attempting to reconnect...');
      });

      newSocket.on('connect_error', (error) => {
        console.log('❌ Connection failed:', error);
        setIsConnected(false);
        setDemoMode(true);
        addSystemMessage('Backend server not available. Running in demo mode - responses will be simulated.', 'warning');
      });

      // Message event handlers
      newSocket.on('message_received', (message) => {
        addMessage(message);
      });

      newSocket.on('message_start', (data) => {
        setStreamingId(data.id);
        setStreamingMessage('');
        setIsTyping(true);
      });

      newSocket.on('message_chunk', (data) => {
        setStreamingMessage(data.fullText);
      });

      newSocket.on('message_complete', (message) => {
        addMessage(message);
        setStreamingMessage('');
        setStreamingId(null);
        setIsTyping(false);
      });

      newSocket.on('agent_typing', (data) => {
        setIsTyping(data.isTyping);
      });

      newSocket.on('message_error', (error) => {
        addSystemMessage(`Error: ${error.error}`, 'error');
        setIsTyping(false);
      });

      newSocket.on('model_switched', (data) => {
        addSystemMessage(`Switched to model: ${data.model}`);
      });

      newSocket.on('conversation_reset', () => {
        setMessages([]);
        addSystemMessage('Conversation reset. Let\'s start fresh!');
      });

      return () => {
        newSocket.close();
      };
    } catch (error) {
      console.error('Failed to connect:', error);
      setDemoMode(true);
      addSystemMessage('Running in demo mode. Set up a backend server for full functionality.', 'warning');
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const addSystemMessage = (text, type = 'info') => {
    const systemMessage = {
      id: Date.now().toString(),
      text,
      sender: 'system',
      type,
      timestamp: Date.now()
    };
    addMessage(systemMessage);
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;

    const message = inputMessage.trim();
    setInputMessage('');

    // Add user message immediately
    const userMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: Date.now()
    };
    addMessage(userMessage);

    if (socket && isConnected) {
      // Send message to server
      socket.emit('send_message', {
        message,
        timestamp: Date.now()
      });
    } else if (demoMode) {
      // Demo mode - simulate response
      simulateDemoResponse(message);
    }
  };

  const simulateDemoResponse = (userMessage) => {
    setIsTyping(true);
    
    setTimeout(() => {
      const demoResponses = [
        "Hello! I'm FMAA Assistant running in demo mode. To get full AI responses, please connect a backend server with OpenAI API.",
        "This is a simulated response. The frontend is working perfectly! Set up the backend server (server.js) to get real AI conversations.",
        "Demo mode active! ✨ This proves the chat interface is fully functional. Connect to a real AI backend for intelligent responses.",
        `You said: "${userMessage}". In demo mode, I can only provide pre-set responses. Deploy the backend server for dynamic AI conversations!`,
        "🤖 FMAA Chat Frontend is working great! The UI, real-time messaging, and all features are ready. Just need the AI backend to complete the experience."
      ];
      
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      
      const agentMessage = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'agent',
        timestamp: Date.now()
      };
      
      addMessage(agentMessage);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const switchModel = (model) => {
    if (socket && isConnected) {
      socket.emit('switch_model', { model });
      setCurrentModel(model);
    } else {
      setCurrentModel(model);
      addSystemMessage(`Model set to: ${model} (will apply when backend connects)`);
    }
  };

  const resetConversation = () => {
    if (socket && isConnected) {
      socket.emit('reset_conversation');
    } else {
      setMessages([]);
      addSystemMessage('Conversation reset in demo mode.');
    }
  };

  const formatTime = (timestamp) => {
    return moment(timestamp).format('HH:mm');
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.sender === 'user';
    const isSystem = message.sender === 'system';
    const isAgent = message.sender === 'agent';

    if (isSystem) {
      return (
        <div className={`system-message ${message.type || 'info'}`}>
          <Activity size={16} />
          <span>{message.text}</span>
        </div>
      );
    }

    return (
      <div className={`message-wrapper ${isUser ? 'user' : 'agent'}`}>
        <div className="message-bubble">
          <div className="message-header">
            {isUser ? <User size={16} /> : <Bot size={16} />}
            <span className="sender-name">
              {isUser ? 'You' : 'FMAA Assistant'}
            </span>
            <span className="message-time">{formatTime(message.timestamp)}</span>
          </div>
          <div className="message-content">
            {isAgent ? (
              <ReactMarkdown>{message.text}</ReactMarkdown>
            ) : (
              <p>{message.text}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const StreamingMessage = () => {
    if (!streamingMessage) return null;

    return (
      <div className="message-wrapper agent">
        <div className="message-bubble streaming">
          <div className="message-header">
            <Bot size={16} />
            <span className="sender-name">FMAA Assistant</span>
            <span className="typing-indicator">typing...</span>
          </div>
          <div className="message-content">
            <ReactMarkdown>{streamingMessage}</ReactMarkdown>
            <span className="cursor">|</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <h1>🤖 FMAA Chat</h1>
          <div className={`connection-status ${isConnected ? 'connected' : demoMode ? 'demo' : 'disconnected'}`}>
            <div className="status-dot"></div>
            {isConnected ? 'Connected' : demoMode ? 'Demo Mode' : 'Disconnected'}
          </div>
        </div>
        
        <div className="header-controls">
          <select 
            value={currentModel} 
            onChange={(e) => switchModel(e.target.value)}
            className="model-selector"
          >
            {models.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="control-btn"
            title="Settings"
          >
            <Settings size={18} />
          </button>
          
          <button 
            onClick={resetConversation}
            className="control-btn"
            title="Reset Conversation"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      {showSettings && (
        <div className="settings-panel">
          <h3>🔧 Server Settings</h3>
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="Backend Server URL"
            className="server-input"
          />
          <button 
            onClick={connectToServer}
            className="connect-btn"
          >
            Reconnect
          </button>
          <p className="settings-info">
            💡 Default: For full AI functionality, deploy the backend server (server.js) and enter the URL above.
          </p>
        </div>
      )}

      <main className="chat-container">
        <div className="messages-area">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h2>👋 Welcome to FMAA Chat!</h2>
              <p>
                {isConnected 
                  ? "Start chatting with the AI agent below!" 
                  : demoMode 
                  ? "Demo mode active - UI is fully functional! Deploy backend for AI responses."
                  : "Connecting to server..."
                }
              </p>
              <div className="demo-commands">
                <h4>🧪 Try these examples:</h4>
                <div className="command-list">
                  <span>"Hello, how are you?"</span>
                  <span>"Write a poem about coding"</span>
                  <span>"Explain quantum computing"</span>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          <StreamingMessage />
          
          {isTyping && !streamingMessage && (
            <div className="typing-indicator-wrapper">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span>FMAA Assistant is thinking...</span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isConnected 
                  ? "Type your message..." 
                  : demoMode 
                  ? "Try the demo - type anything!"
                  : "Connecting..."
              }
              rows={1}
              className="message-input"
            />
            <button 
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="send-btn"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;