import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'file';
}

interface ChatUser {
  id: string;
  name: string;
  role: 'intern' | 'organization';
  avatar?: string;
  online: boolean;
  lastSeen?: string;
}

interface ChatWindowProps {
  recipient: ChatUser;
  onClose: () => void;
  isMinimized?: boolean;
  onMinimize?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  recipient, 
  onClose, 
  isMinimized = false, 
  onMinimize 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock messages for demonstration
  useEffect(() => {
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: recipient.id,
        receiverId: user?.id || '',
        content: `Hi ${user?.name}! I saw your application for our internship position. I'd love to discuss the opportunity with you.`,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: true,
        type: 'text'
      },
      {
        id: '2',
        senderId: user?.id || '',
        receiverId: recipient.id,
        content: 'Thank you for reaching out! I\'m very excited about this opportunity. When would be a good time to discuss the details?',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        read: true,
        type: 'text'
      },
      {
        id: '3',
        senderId: recipient.id,
        receiverId: user?.id || '',
        content: 'How about we schedule a call for tomorrow at 2 PM? I can share more details about the role and answer any questions you might have.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        read: true,
        type: 'text'
      }
    ];
    setMessages(mockMessages);
  }, [recipient.id, user?.id, user?.name]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: Message = {
      id: `msg_${Date.now()}`,
      senderId: user.id,
      receiverId: recipient.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate typing indicator and response
    setTimeout(() => {
      setIsTyping(true);
    }, 1000);

    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: `msg_${Date.now() + 1}`,
        senderId: recipient.id,
        receiverId: user.id,
        content: 'Thanks for your message! I\'ll get back to you shortly.',
        timestamp: new Date().toISOString(),
        read: false,
        type: 'text'
      };
      setMessages(prev => [...prev, response]);
    }, 3000);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 w-64 cursor-pointer"
        onClick={onMinimize}
      >
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-indigo-700">
                  {recipient.name.charAt(0)}
                </span>
              </div>
              {recipient.online && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <p className="font-medium text-sm text-gray-900">{recipient.name}</p>
              <p className="text-xs text-gray-500">
                {recipient.online ? 'Online' : `Last seen ${recipient.lastSeen || 'recently'}`}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 w-96 h-[500px] flex flex-col z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {recipient.name.charAt(0)}
              </span>
            </div>
            {recipient.online && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <h3 className="font-medium">{recipient.name}</h3>
            <p className="text-xs text-indigo-100">
              {recipient.online ? 'Online' : `Last seen ${recipient.lastSeen || 'recently'}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
            <Phone className="h-4 w-4" />
          </button>
          <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
            <Video className="h-4 w-4" />
          </button>
          <button className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            >
              <span className="text-xs">−</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === user?.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.senderId === user?.id ? 'text-indigo-200' : 'text-gray-500'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Smile className="h-4 w-4" />
            </button>
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatWindow;