import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, UserMinus, Search, Users, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { usersAPI, friendsAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import '../../App.css';

const FriendsList = ({ onSelectFriend, selectedFriendId }) => {
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    loadFriends();
  }, []);

  useEffect(() => {
    // Filter friends based on search query
    const filtered = friends.filter(friend =>
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredFriends(filtered);
  }, [friends, searchQuery]);

  const loadFriends = async () => {
    try {
      setIsLoading(true);
      const response = await usersAPI.getFriendsList();
      setFriends(response.data.friends);
    } catch (error) {
      console.error('Error loading friends:', error);
      toast.error('Failed to load friends list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    if (!window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      return;
    }

    try {
      await friendsAPI.removeFriend(friendId);
      setFriends(prev => prev.filter(friend => friend._id !== friendId));
      toast.success(`${friendName} removed from friends`);
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
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

  const formatLastSeen = (lastSeen) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Card className="h-full bg-cyber-dark border-cyber-gray">
        <CardContent className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-cyber-neon-cyan border-t-transparent rounded-full"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-cyber-dark border-cyber-gray">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-cyber-neon-cyan">
          <Users className="w-5 h-5" />
          Friends ({friends.length})
        </CardTitle>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-light-gray" />
          <Input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-cyber-darker border-cyber-gray focus:border-cyber-neon-cyan text-white placeholder-cyber-light-gray"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="cyber-scrollbar max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredFriends.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 text-center text-cyber-light-gray"
              >
                {searchQuery ? (
                  <>
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No friends found matching "{searchQuery}"</p>
                  </>
                ) : (
                  <>
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No friends yet</p>
                    <p className="text-sm mt-1">Start by adding some friends!</p>
                  </>
                )}
              </motion.div>
            ) : (
              filteredFriends.map((friend, index) => (
                <motion.div
                  key={friend._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border-b border-cyber-gray hover:bg-cyber-darker/50 transition-colors cursor-pointer ${
                    selectedFriendId === friend._id ? 'bg-cyber-darker border-l-4 border-l-cyber-neon-cyan' : ''
                  }`}
                  onClick={() => onSelectFriend(friend)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-cyber-neon-cyan to-cyber-neon-pink rounded-full flex items-center justify-center">
                          <span className="text-cyber-black font-semibold">
                            {friend.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        {/* Status indicator */}
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-cyber-dark ${getStatusColor(friend.status)}`} />
                      </div>

                      {/* Friend info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">
                          {friend.username}
                        </h3>
                        <p className="text-sm text-cyber-light-gray truncate">
                          {friend.status === 'online' ? (
                            <span className="text-cyber-neon-green">Online</span>
                          ) : (
                            `Last seen ${formatLastSeen(friend.lastSeen)}`
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFriend(friend);
                        }}
                        className="text-cyber-neon-cyan hover:text-cyber-neon-blue hover:bg-cyber-neon-cyan/10"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFriend(friend._id, friend.username);
                        }}
                        className="text-cyber-light-gray hover:text-cyber-neon-orange hover:bg-cyber-neon-orange/10"
                      >
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Bio */}
                  {friend.bio && (
                    <p className="text-xs text-cyber-light-gray mt-2 truncate">
                      {friend.bio}
                    </p>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default FriendsList;

