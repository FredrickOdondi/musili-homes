
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Send, User, Bell } from 'lucide-react';
import { propertyAI } from '@/services/aiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isNotification?: boolean;
}

interface ChatInterfaceProps {
  onNewMessage?: (message: ChatMessage) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNewMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Property Assistant. I can help you with information about our luxury properties, pricing, locations, and even help you schedule property viewings with our agents. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get AI response
      const aiResponse = await propertyAI.generateResponse(inputMessage, messages);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        isNotification: aiResponse.includes('notified') || aiResponse.includes('Next Steps')
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (onNewMessage) {
        onNewMessage(assistantMessage);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try asking about our properties, pricing, locations, or scheduling viewings, and I'll do my best to help!",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const formatMessage = (content: string) => {
    // Convert simple markdown-like formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('**') && line.endsWith('**')) {
          return <div key={index} className="font-bold mb-1 text-gold">{line.slice(2, -2)}</div>;
        }
        if (line.startsWith('• ')) {
          return <div key={index} className="ml-4 mb-1">{line}</div>;
        }
        if (line.includes('**') && !line.startsWith('**')) {
          // Handle inline bold text
          const parts = line.split('**');
          return (
            <div key={index} className="mb-1">
              {parts.map((part, partIndex) => 
                partIndex % 2 === 1 ? 
                  <span key={partIndex} className="font-bold text-gold">{part}</span> : 
                  part
              )}
            </div>
          );
        }
        return line && <div key={index} className="mb-1">{line}</div>;
      });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <div className={`p-2 rounded-full flex-shrink-0 ${
                message.isNotification ? 'bg-green-500' : 'bg-gold'
              }`}>
                {message.isNotification ? (
                  <Bell className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-gray-900" />
                )}
              </div>
            )}
            
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white rounded-br-sm'
                  : message.isNotification
                  ? 'bg-green-500/20 text-white border border-green-500/30 rounded-bl-sm'
                  : 'bg-white/10 text-white rounded-bl-sm'
              }`}
            >
              <div className="text-sm leading-relaxed">
                {formatMessage(message.content)}
              </div>
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            {message.role === 'user' && (
              <div className="bg-blue-500 p-2 rounded-full flex-shrink-0">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="bg-gold p-2 rounded-full">
              <Bot className="h-4 w-4 text-gray-900" />
            </div>
            <div className="bg-white/10 text-white p-3 rounded-lg rounded-bl-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-white/20 flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask about properties, schedule viewings, get pricing info..."
          className="flex-grow bg-white/20 border-white/20 text-white placeholder:text-white/50"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          className="bg-gold text-gray-900 hover:bg-gold/90"
          disabled={isLoading || !inputMessage.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
