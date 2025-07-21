import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';

interface ChatUser {
  id: string;
  name: string;
  role: 'intern' | 'organization';
  avatar?: string;
  online: boolean;
  lastSeen?: string;
}

const ChatButton: React.FC = () => {
  const [showChatList, setShowChatList] = useState(false);
  const [activeChats, setActiveChats] = useState<ChatUser[]>([]);
  const [minimizedChats, setMinimizedChats] = useState<string[]>([]);

  const handleSelectChat = (user: ChatUser) => {
    // Check if chat is already open
    const existingChat = activeChats.find(chat => chat.id === user.id);
    if (!existingChat) {
      setActiveChats(prev => [...prev, user]);
    }
    
    // Remove from minimized if it was minimized
    setMinimizedChats(prev => prev.filter(id => id !== user.id));
    setShowChatList(false);
  };

  const handleCloseChat = (userId: string) => {
    setActiveChats(prev => prev.filter(chat => chat.id !== userId));
    setMinimizedChats(prev => prev.filter(id => id !== userId));
  };

  const handleMinimizeChat = (userId: string) => {
    setMinimizedChats(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        className="fixed bottom-4 left-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors z-40"
        onClick={() => setShowChatList(!showChatList)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="h-6 w-6" />
        {/* Notification badge */}
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold">2</span>
        </div>
      </motion.button>

      {/* Chat List */}
      <AnimatePresence>
        {showChatList && (
          <ChatList
            onSelectChat={handleSelectChat}
            onClose={() => setShowChatList(false)}
          />
        )}
      </AnimatePresence>

      {/* Active Chat Windows */}
      <AnimatePresence>
        {activeChats.map((chat, index) => (
          <div
            key={chat.id}
            style={{
              right: `${420 + (index * 20)}px`,
              bottom: '16px',
              zIndex: 50 - index
            }}
            className="fixed"
          >
            <ChatWindow
              recipient={chat}
              onClose={() => handleCloseChat(chat.id)}
              isMinimized={minimizedChats.includes(chat.id)}
              onMinimize={() => handleMinimizeChat(chat.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </>
  );
};

export default ChatButton;