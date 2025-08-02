import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Message, Conversation, User } from '../../types';
import { NotificationService } from '../../services/notificationService';
import { Send, Paperclip, Smile } from 'lucide-react';
import toast from 'react-hot-toast';

// Dummy data for demonstration
const dummyConversations: Conversation[] = [
  {
    id: 'conv1',
    participants: ['user1', 'user2'],
    lastMessage: {
      id: 'msg1',
      conversationId: 'conv1',
      senderId: 'user2',
      sender: {
        id: 'user2',
        email: 'lars@example.com',
        displayName: 'Lars Hansen',
        role: 'worker',
        rating: 4.2,
        completedJobs: 8,
        createdAt: new Date(),
        isEmailVerified: true
      },
      content: 'Hei! Jeg er interessert i jobben din.',
      timestamp: new Date(),
      isRead: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const dummyMessages: Message[] = [
  {
    id: 'msg1',
    conversationId: 'conv1',
    senderId: 'user2',
    sender: {
      id: 'user2',
      email: 'lars@example.com',
      displayName: 'Lars Hansen',
      role: 'worker',
      rating: 4.2,
      completedJobs: 8,
      createdAt: new Date(),
      isEmailVerified: true
    },
    content: 'Hei! Jeg er interessert i jobben din.',
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    isRead: true
  },
  {
    id: 'msg2',
    conversationId: 'conv1',
    senderId: 'user1',
    sender: {
      id: 'user1',
      email: 'user@example.com',
      displayName: 'Du',
      role: 'employer',
      rating: 4.5,
      completedJobs: 5,
      createdAt: new Date(),
      isEmailVerified: true
    },
    content: 'Hei Lars! Takk for interessen. Kan du fortelle litt om din erfaring?',
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    isRead: true
  },
  {
    id: 'msg3',
    conversationId: 'conv1',
    senderId: 'user2',
    sender: {
      id: 'user2',
      email: 'lars@example.com',
      displayName: 'Lars Hansen',
      role: 'worker',
      rating: 4.2,
      completedJobs: 8,
      createdAt: new Date(),
      isEmailVerified: true
    },
    content: 'Ja, jeg har gjort mye gressklipping og hagearbeid. Har eget utstyr også.',
    timestamp: new Date(Date.now() - 900000), // 15 minutes ago
    isRead: false
  }
];

const ChatSystem: React.FC = () => {
  const { currentUser } = useAuth();
  const [conversations] = useState<Conversation[]>(dummyConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>(dummyMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !currentUser) return;

    setIsLoading(true);
    try {
      const messageData: Message = {
        id: `msg-${Date.now()}`,
        conversationId: selectedConversation.id,
        senderId: currentUser.id,
        sender: currentUser,
        content: newMessage.trim(),
        timestamp: new Date(),
        isRead: false
      };

      // TODO: Save to Firestore
      console.log('Sending message:', messageData);
      
      // Add to local state for immediate UI update
      setMessages(prev => [...prev, messageData]);
      
      // Send notification to other participant
      const otherParticipant = getOtherParticipant(selectedConversation);
      if (otherParticipant) {
        await NotificationService.notifyNewMessage(
          otherParticipant.id,
          currentUser.displayName,
          newMessage.trim().substring(0, 50) + (newMessage.trim().length > 50 ? '...' : ''),
          selectedConversation.id
        );
      }
      
      setNewMessage('');
      toast.success('Melding sendt!');
    } catch (error: any) {
      toast.error('Kunne ikke sende melding: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('nb-NO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOtherParticipant = (conversation: Conversation): User | null => {
    if (!currentUser) return null;
    const otherId = conversation.participants.find(id => id !== currentUser.id);
    // In a real app, you'd fetch the user data from Firestore
    return otherId ? {
      id: otherId,
      email: 'other@example.com',
      displayName: 'Andre bruker',
      role: 'worker',
      rating: 4.0,
      completedJobs: 5,
      createdAt: new Date(),
      isEmailVerified: true
    } : null;
  };

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>Du må være innlogget for å se meldinger.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg h-[600px] flex">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Meldinger</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.map((conversation) => {
              const otherUser = getOtherParticipant(conversation);
              return (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation?.id === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {otherUser?.displayName || 'Ukjent bruker'}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage?.content || 'Ingen meldinger ennå'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {conversation.lastMessage?.timestamp && 
                        formatTime(conversation.lastMessage.timestamp)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">
                      {getOtherParticipant(selectedConversation)?.displayName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {getOtherParticipant(selectedConversation)?.displayName || 'Ukjent bruker'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {getOtherParticipant(selectedConversation)?.role === 'worker' ? 'Arbeidstaker' : 'Arbeidsgiver'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages
                  .filter(msg => msg.conversationId === selectedConversation.id)
                  .map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === currentUser.id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === currentUser.id ? 'text-primary-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Skriv en melding..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      rows={1}
                    />
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Smile className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !newMessage.trim()}
                    className="p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Velg en samtale</h3>
                <p className="text-gray-500">Velg en samtale fra listen for å starte å chatte</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSystem; 