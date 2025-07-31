import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader } from '../ui/card';
import { messagesAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../lib/socket';
import toast from 'react-hot-toast';
import '../../App.css';

const ChatWindow = ({ selectedFriend, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (selectedFriend) {
      loadMessages();
      setupSocketListeners();
      
      // Focus input when chat opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    return () => {
      cleanupSocketListeners();
    };
  }, [selectedFriend]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    if (!selectedFriend) return;

    try {
      setIsLoading(true);
      const response = await messagesAPI.getConversation(selectedFriend._id);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Listen for incoming messages
    socketService.onReceiveMessage((data) => {
      if (data.senderId === selectedFriend._id) {
        const newMessage = {
          _id: Date.now().toString(),
          sender: { _id: data.senderId, username: selectedFriend.username },
          content: data.message,
          createdAt: data.timestamp,
        };
        setMessages(prev => [...prev, newMessage]);
      }
    });

    // Listen for typing indicators
    socketService.onUserTyping((data) => {
      if (data.userId === selectedFriend._id) {
        setIsTyping(data.isTyping);
      }
    });
  };

  const cleanupSocketListeners = () => {
    socketService.offReceiveMessage();
    socketService.offUserTyping();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedFriend || isSending) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      // Send via API
      const response = await messagesAPI.sendMessage(selectedFriend._id, messageContent);
      
      // Send via Socket.io for real-time delivery
      socketService.sendMessage(selectedFriend._id, messageContent, user.id);
      
      // Add message to local state
      const sentMessage = {
        _id: response.data.data._id,
        sender: { _id: user.id, username: user.username },
        content: messageContent,
        createdAt: new Date(),
      };
      
      setMessages(prev => [...prev, sentMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      // Restore message in input on error
      setNewMessage(messageContent);
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    if (!isTyping) {
      socketService.sendTyping(selectedFriend._id, true);
    }
    
    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    
    // Set new timeout to stop typing indicator
    const timeout = setTimeout(() => {
      socketService.sendTyping(selectedFriend._id, false);
    }, 1000);
    
    setTypingTimeout(timeout);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'status-online';
      case 'away':
        return 'status-away';
      default:
        return 'status-offline';
    }
  };

  if (!selectedFriend) {
    return (
      <Card className="h-full bg-cyber-dark border-cyber-gray flex items-center justify-center">
        <CardContent className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-cyber-neon-cyan to-cyber-neon-pink rounded-full flex items-center justify-center mx-auto">
              <Send className="w-12 h-12 text-cyber-black" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-cyber-neon-cyan mb-2">
                Welcome to RiiZaa
              </h3>
              <p className="text-cyber-light-gray">
                Select a friend to start chatting in the cyberpunk realm
              </p>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-cyber-dark border-cyber-gray flex flex-col">
      {/* Chat Header */}
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4 border-b border-cyber-gray">
        <div className="flex items-center gap-3">
          {/* Friend Avatar */}
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-cyber-neon-cyan to-cyber-neon-pink rounded-full flex items-center justify-center">
              <span className="text-cyber-black font-semibold">
                {selectedFriend.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-cyber-dark ${getStatusColor(selectedFriend.status)}`} />
          </div>

          {/* Friend Info */}
          <div>
            <h3 className="font-semibold text-white">
              {selectedFriend.username}
            </h3>
            <p className="text-sm text-cyber-light-gray">
              {selectedFriend.status === 'online' ? (
                <span className="text-cyber-neon-green">Online</span>
              ) : (
                `Last seen ${formatMessageTime(selectedFriend.lastSeen)}`
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-cyber-neon-cyan hover:text-cyber-neon-blue hover:bg-cyber-neon-cyan/10"
          >
            <Phone className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-cyber-neon-cyan hover:text-cyber-neon-blue hover:bg-cyber-neon-cyan/10"
          >
            <Video className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-cyber-light-gray hover:text-cyber-neon-cyan hover:bg-cyber-neon-cyan/10"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto cyber-scrollbar p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-cyber-neon-cyan border-t-transparent rounded-full"
                />
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => {
                  const isOwnMessage = message.sender._id === user.id;
                  const showDate = index === 0 || 
                    formatMessageDate(messages[index - 1].createdAt) !== formatMessageDate(message.createdAt);

                  return (
                    <div key={message._id}>
                      {/* Date Separator */}
                      {showDate && (
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-cyber-gray px-3 py-1 rounded-full text-xs text-cyber-light-gray">
                            {formatMessageDate(message.createdAt)}
                          </div>
                        </div>
                      )}

                      {/* Message */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          isOwnMessage 
                            ? 'message-sent rounded-br-sm' 
                            : 'message-received rounded-bl-sm'
                        }`}>
                          <p className="text-sm break-words">
                            {message.content}
                          </p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-cyber-black/70' : 'text-cyber-light-gray'
                          }`}>
                            {formatMessageTime(message.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    </div>
                  );
                })}
              </AnimatePresence>
            )}

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex justify-start"
                >
                  <div className="bg-cyber-darker border border-cyber-gray px-4 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex items-center gap-1">
                      <div className="typing-dot w-2 h-2 bg-cyber-neon-cyan rounded-full"></div>
                      <div className="typing-dot w-2 h-2 bg-cyber-neon-cyan rounded-full"></div>
                      <div className="typing-dot w-2 h-2 bg-cyber-neon-cyan rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-cyber-gray p-4">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-cyber-light-gray hover:text-cyber-neon-cyan hover:bg-cyber-neon-cyan/10"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={handleTyping}
                  className="bg-cyber-darker border-cyber-gray focus:border-cyber-neon-cyan text-white placeholder-cyber-light-gray pr-12"
                  disabled={isSending}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-cyber-light-gray hover:text-cyber-neon-cyan hover:bg-cyber-neon-cyan/10"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </div>

              <Button
                type="submit"
                size="sm"
                disabled={!newMessage.trim() || isSending}
                className="bg-cyber-neon-cyan hover:bg-cyber-neon-blue text-cyber-black cyber-hover"
              >
                {isSending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-cyber-black border-t-transparent rounded-full"
                  />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;

