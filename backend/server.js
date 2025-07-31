const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "https://fmaa.vercel.app", "https://fmaa1.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Hugging Face API Configuration
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/";
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Store active conversations
const conversations = new Map();

// AI Agent Class
class FMAAAgent {
  constructor(name = "FMAA Assistant", personality = "helpful") {
    this.id = uuidv4();
    this.name = name;
    this.personality = personality;
    this.context = [];
    this.model = process.env.HUGGINGFACE_MODEL || "microsoft/DialoGPT-medium";
  }

  async generateResponse(message, conversation = []) {
    try {
      const systemPrompt = this.getSystemPrompt();
      
      // Format conversation for Hugging Face
      let fullPrompt = systemPrompt + "\n\n";
      
      // Add conversation history
      conversation.forEach(msg => {
        if (msg.role === 'user') {
          fullPrompt += `User: ${msg.content}\n`;
        } else if (msg.role === 'assistant') {
          fullPrompt += `Assistant: ${msg.content}\n`;
        }
      });
      
      // Add current message
      fullPrompt += `User: ${message}\nAssistant:`;

      // Call Hugging Face API
      const response = await axios.post(
        HUGGINGFACE_API_URL + this.model,
        {
          inputs: fullPrompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            do_sample: true,
            return_full_text: false
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract response text
      const responseText = response.data[0]?.generated_text || "I'm sorry, I couldn't generate a response.";
      
      // Create a mock stream for compatibility
      return this.createMockStream(responseText);
    } catch (error) {
      console.error('AI Agent Error:', error);
      throw error;
    }
  }

  createMockStream(text) {
    // Create an async generator to simulate streaming
    return (async function* () {
      const words = text.split(' ');
      for (let i = 0; i < words.length; i++) {
        yield {
          choices: [{
            delta: {
              content: words[i] + (i < words.length - 1 ? ' ' : '')
            }
          }]
        };
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    })();
  }

  getSystemPrompt() {
    return `You are ${this.name}, a ${this.personality} AI assistant. 
    You are part of the FMAA (FullMetal Agent Architecture) system.
    
    Guidelines:
    - Be conversational and engaging
    - Provide helpful and accurate information
    - Remember the conversation context
    - If you don't know something, say so honestly
    - Be creative but factual
    - Keep responses reasonably concise unless asked for detail
    
    Your personality: ${this.personality}`;
  }
}

// Socket.IO Connection Handler
io.on('connection', (socket) => {
  console.log(`🔗 User connected: ${socket.id}`);

  // Initialize agent for this connection
  const agent = new FMAAAgent("FMAA Assistant", "helpful and friendly");
  conversations.set(socket.id, {
    agent: agent,
    messages: [],
    isTyping: false
  });

  // Handle incoming messages
  socket.on('send_message', async (data) => {
    const { message, timestamp = Date.now() } = data;
    const conversation = conversations.get(socket.id);
    
    if (!conversation) return;

    try {
      // Add user message to conversation
      const userMessage = {
        id: uuidv4(),
        text: message,
        sender: 'user',
        timestamp: timestamp
      };

      conversation.messages.push({
        role: 'user',
        content: message
      });

      // Emit user message to client
      socket.emit('message_received', userMessage);

      // Show typing indicator
      socket.emit('agent_typing', { isTyping: true });

      // Generate AI response
      const stream = await conversation.agent.generateResponse(
        message, 
        conversation.messages
      );

      let fullResponse = '';
      const responseId = uuidv4();

      // Start streaming response
      socket.emit('message_start', {
        id: responseId,
        sender: 'agent',
        timestamp: Date.now()
      });

      // Stream the response
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          socket.emit('message_chunk', {
            id: responseId,
            chunk: content,
            fullText: fullResponse
          });
        }
      }

      // End streaming
      socket.emit('message_complete', {
        id: responseId,
        text: fullResponse,
        sender: 'agent',
        timestamp: Date.now()
      });

      // Stop typing indicator
      socket.emit('agent_typing', { isTyping: false });

      // Add agent response to conversation
      conversation.messages.push({
        role: 'assistant',
        content: fullResponse
      });

    } catch (error) {
      console.error('Message handling error:', error);
      socket.emit('agent_typing', { isTyping: false });
      socket.emit('message_error', {
        error: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now()
      });
    }
  });

  // Handle model switching
  socket.on('switch_model', (data) => {
    const { model } = data;
    const conversation = conversations.get(socket.id);
    if (conversation && conversation.agent) {
      conversation.agent.model = model;
      socket.emit('model_switched', { model, success: true });
    }
  });

  // Handle conversation reset
  socket.on('reset_conversation', () => {
    const conversation = conversations.get(socket.id);
    if (conversation) {
      conversation.messages = [];
      conversation.agent = new FMAAAgent("FMAA Assistant", "helpful and friendly");
      socket.emit('conversation_reset', { success: true });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
    conversations.delete(socket.id);
  });
});

// REST API Endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    uptime: process.uptime(),
    connections: conversations.size,
    timestamp: Date.now()
  });
});

app.get('/api/agent/info', (req, res) => {
  res.json({
    name: "FMAA Assistant",
    version: "1.0.0",
    model: process.env.HUGGINGFACE_MODEL || "microsoft/DialoGPT-medium",
    provider: "Hugging Face",
    capabilities: [
      "Real-time chat",
      "Context awareness", 
      "Multi-model support",
      "Streaming responses"
    ]
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`🚀 FMAA Chat Server running on port ${PORT}`);
  console.log(`🔗 Socket.IO server ready for connections`);
  console.log(`🤖 AI Agent ready with model: ${process.env.HUGGINGFACE_MODEL || "microsoft/DialoGPT-medium"}`);
});