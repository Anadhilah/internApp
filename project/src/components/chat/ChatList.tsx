import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Search, X, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ChatUser {
  id: string;
  name: string;
  role: 'intern' | 'organization';
  avatar?: string;
  online: boolean;
  lastSeen?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    unread: boolean;
  };
}

interface ChatListProps {
  onSelectChat: (user: ChatUser) => void;
  onClose: () => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat, onClose }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock chat users
  const chatUsers: ChatUser[] = [
    {
      id: 'org1',
      name: 'TechCorp HR',
      role: 'organization',
      online: true,
      lastMessage: {
        content: 'How about we schedule a call for tomorrow at 2 PM?',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        unread: true
      }
    },
    {
      id: 'org2',
      name: 'DataSystems Recruiting',
      role: 'organization',
      online: false,
      lastSeen: '2 hours ago',
      lastMessage: {
        content: 'Thanks for your interest in our data science internship!',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        unread: false
      }
    },
    {
      id: 'intern1',
      name: 'Sarah Johnson',
      role: 'intern',
      online: true,
      lastMessage: {
        content: 'I\'d love to learn more about the frontend position.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        unread: true
      }
    },
    {
      id: 'intern2',
      name: 'Michael Chen',
      role: 'intern',
      online: false,
      lastSeen: '1 day ago',
      lastMessage: {
        content: 'Thank you for considering my application.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        unread: false
      }
    }
  ];

  const filteredUsers = chatUsers.filter(chatUser =>
    chatUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-4 bottom-4 bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-[500px] flex flex-col z-50"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <h3 className="font-medium">Messages</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations</h3>
            <p className="text-gray-600 text-sm">
              {searchQuery ? 'No conversations match your search.' : 'Start a conversation by applying to internships or posting opportunities.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((chatUser) => (
              <motion.div
                key={chatUser.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectChat(chatUser)}
                whileHover={{ backgroundColor: '#f9fafb' }}
              >
                <div className="flex items-start space-x-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      chatUser.role === 'organization' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      <span className="text-sm font-medium">
                        {chatUser.name.charAt(0)}
                      </span>
                    </div>
                    {chatUser.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {chatUser.name}
                      </p>
                      {chatUser.lastMessage && (
                        <p className="text-xs text-gray-500">
                          {formatTime(chatUser.lastMessage.timestamp)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${
                        chatUser.lastMessage?.unread ? 'text-gray-900 font-medium' : 'text-gray-600'
                      }`}>
                        {chatUser.lastMessage?.content || 'No messages yet'}
                      </p>
                      {chatUser.lastMessage?.unread && (
                        <div className="w-2 h-2 bg-indigo-600 rounded-full ml-2"></div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 capitalize">
                      {chatUser.role === 'organization' ? 'Organization' : 'Student'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatList;