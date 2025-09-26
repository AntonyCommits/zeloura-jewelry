"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Bot, Phone, Mail, Clock, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quick-reply' | 'product' | 'order';
}

interface QuickReply {
  id: string;
  text: string;
  action: string;
}

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentStatus, setAgentStatus] = useState<'online' | 'away' | 'offline'>('online');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies: QuickReply[] = [
    { id: '1', text: 'Track my order', action: 'track_order' },
    { id: '2', text: 'Product information', action: 'product_info' },
    { id: '3', text: 'Return & Exchange', action: 'returns' },
    { id: '4', text: 'Size guide', action: 'size_guide' },
    { id: '5', text: 'Speak to agent', action: 'human_agent' },
  ];

  const botResponses = {
    greeting: "Hi! Welcome to Zeloura 💎 I'm here to help you find the perfect jewelry. How can I assist you today?",
    track_order: "I'd be happy to help you track your order! Please provide your order number or email address used for the purchase.",
    product_info: "I can help you with product details! Are you looking for information about a specific item? You can share the product name or ask about our collections.",
    returns: "Our return policy allows returns within 30 days of purchase. Items should be in original condition with tags. Would you like me to initiate a return or exchange?",
    size_guide: "Here's our size guide information:\n\n📍 Rings: Measure your finger circumference\n📍 Necklaces: Standard lengths available\n📍 Bracelets: Adjustable sizing\n\nWould you like specific measurements?",
    human_agent: "I'm connecting you with one of our jewelry experts. They'll be with you shortly! ⏰",
    default: "I understand you need help. Let me connect you with a specialist who can better assist you with your specific query."
  };

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
      // Send welcome message when chat opens
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: botResponses.greeting,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length, botResponses.greeting]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isOpen && messages.length > 0) {
      setUnreadCount(messages.filter(m => m.sender !== 'user').length);
    } else {
      setUnreadCount(0);
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (text: string, type: 'text' | 'quick-reply' = 'text') => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
      type,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate bot typing
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateBotResponse = (userText: string): string => {
    const text = userText.toLowerCase();

    if (text.includes('order') || text.includes('track')) {
      return botResponses.track_order;
    } else if (text.includes('return') || text.includes('exchange') || text.includes('refund')) {
      return botResponses.returns;
    } else if (text.includes('size') || text.includes('fit')) {
      return botResponses.size_guide;
    } else if (text.includes('product') || text.includes('item') || text.includes('jewelry')) {
      return botResponses.product_info;
    } else if (text.includes('agent') || text.includes('human') || text.includes('representative')) {
      setTimeout(() => setAgentStatus('online'), 2000);
      return botResponses.human_agent;
    } else if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
      return "Hello! How can I help you with your jewelry needs today? 😊";
    } else if (text.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with?";
    } else {
      return botResponses.default;
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    sendMessage(reply.text, 'quick-reply');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-pink-600 hover:bg-pink-700 text-white rounded-full w-14 h-14 shadow-lg relative"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-80 shadow-xl transition-all duration-300 ${isMinimized ? 'h-16' : 'h-96'}`}>
        {/* Header */}
        <CardHeader className="p-4 bg-pink-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-pink-600" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                  agentStatus === 'online' ? 'bg-green-400' :
                  agentStatus === 'away' ? 'bg-yellow-400' : 'bg-gray-400'
                }`} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Zeloura Support</h3>
                <p className="text-xs opacity-90">
                  {agentStatus === 'online' ? 'Online now' :
                   agentStatus === 'away' ? 'Away' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 h-80 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-lg p-3 text-sm ${
                        message.sender === 'user'
                          ? 'bg-pink-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-1">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.sender !== 'user' && (
                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center mr-2 order-1 flex-shrink-0">
                      <Bot className="h-3 w-3 text-pink-600" />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center mr-2 flex-shrink-0">
                    <Bot className="h-3 w-3 text-pink-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {messages.length <= 1 && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-xs text-gray-600 mb-2">Quick actions:</p>
                <div className="flex flex-wrap gap-1">
                  {quickReplies.slice(0, 3).map((reply) => (
                    <Button
                      key={reply.id}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => handleQuickReply(reply)}
                    >
                      {reply.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <Button
                  onClick={() => sendMessage(inputText)}
                  disabled={!inputText.trim()}
                  size="icon"
                  className="bg-pink-600 hover:bg-pink-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Contact Options */}
              <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  <span>+91 8075338239</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>care@zeloura.co</span>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
