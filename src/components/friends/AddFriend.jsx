import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, Send, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { usersAPI, friendsAPI } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import '../../App.css';

const AddFriend = ({ onFriendAdded }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [friendRequestMessage, setFriendRequestMessage] = useState('');
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { user } = useAuth();

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await usersAPI.searchUsers(searchQuery.trim());
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!selectedUser) return;

    try {
      setIsSendingRequest(true);
      
      await friendsAPI.sendFriendRequest(
        selectedUser._id,
        friendRequestMessage.trim()
      );

      toast.success(`Friend request sent to ${selectedUser.username}! 🚀`);
      
      // Reset form
      setSelectedUser(null);
      setFriendRequestMessage('');
      setIsDialogOpen(false);
      
      // Notify parent component
      if (onFriendAdded) onFriendAdded();
      
    } catch (error) {
      console.error('Error sending friend request:', error);
      const message = error.response?.data?.message || 'Failed to send friend request';
      toast.error(message);
    } finally {
      setIsSendingRequest(false);
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

  return (
    <Card className="bg-cyber-dark border-cyber-gray">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyber-neon-green">
          <UserPlus className="w-5 h-5" />
          Add Friends
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-light-gray" />
          <Input
            type="text"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-cyber-darker border-cyber-gray focus:border-cyber-neon-green text-white placeholder-cyber-light-gray"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyber-neon-green animate-spin" />
          )}
        </div>

        {/* Search Results */}
        <div className="space-y-2 max-h-64 overflow-y-auto cyber-scrollbar">
          <AnimatePresence>
            {searchQuery.trim().length > 0 && searchQuery.trim().length < 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4 text-cyber-light-gray text-sm"
              >
                Type at least 2 characters to search
              </motion.div>
            )}

            {searchQuery.trim().length >= 2 && searchResults.length === 0 && !isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-4 text-cyber-light-gray"
              >
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
              </motion.div>
            )}

            {searchResults.map((searchUser, index) => (
              <motion.div
                key={searchUser._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 bg-cyber-darker rounded-lg border border-cyber-gray hover:border-cyber-neon-green/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyber-neon-green to-cyber-neon-cyan rounded-full flex items-center justify-center">
                        <span className="text-cyber-black font-semibold">
                          {searchUser.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* Status indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-cyber-dark ${getStatusColor(searchUser.status)}`} />
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">
                        {searchUser.username}
                      </h3>
                      <p className="text-sm text-cyber-light-gray truncate">
                        {searchUser.status === 'online' ? (
                          <span className="text-cyber-neon-green">Online</span>
                        ) : (
                          `Last seen ${formatLastSeen(searchUser.lastSeen)}`
                        )}
                      </p>
                      {searchUser.bio && (
                        <p className="text-xs text-cyber-light-gray mt-1 truncate">
                          {searchUser.bio}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Add friend button */}
                  <Dialog open={isDialogOpen && selectedUser?._id === searchUser._id} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => setSelectedUser(searchUser)}
                        className="bg-cyber-neon-green hover:bg-cyber-neon-green/80 text-cyber-black cyber-hover"
                      >
                        <UserPlus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    
                    <DialogContent className="bg-cyber-dark border-cyber-gray">
                      <DialogHeader>
                        <DialogTitle className="text-cyber-neon-green">
                          Send Friend Request
                        </DialogTitle>
                      </DialogHeader>
                      
                      {selectedUser && (
                        <div className="space-y-4">
                          {/* User preview */}
                          <div className="flex items-center gap-3 p-3 bg-cyber-darker rounded-lg">
                            <div className="w-12 h-12 bg-gradient-to-r from-cyber-neon-green to-cyber-neon-cyan rounded-full flex items-center justify-center">
                              <span className="text-cyber-black font-semibold text-lg">
                                {selectedUser.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium text-white">
                                {selectedUser.username}
                              </h3>
                              <p className="text-sm text-cyber-light-gray">
                                {selectedUser.bio || 'No bio available'}
                              </p>
                            </div>
                          </div>

                          {/* Message input */}
                          <div>
                            <label className="block text-sm font-medium text-cyber-light-gray mb-2">
                              Message (optional)
                            </label>
                            <Textarea
                              placeholder="Hi! I'd like to add you as a friend."
                              value={friendRequestMessage}
                              onChange={(e) => setFriendRequestMessage(e.target.value)}
                              className="bg-cyber-darker border-cyber-gray focus:border-cyber-neon-green text-white placeholder-cyber-light-gray resize-none"
                              rows={3}
                              maxLength={200}
                            />
                            <p className="text-xs text-cyber-light-gray mt-1">
                              {friendRequestMessage.length}/200 characters
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsDialogOpen(false);
                                setSelectedUser(null);
                                setFriendRequestMessage('');
                              }}
                              className="border-cyber-gray text-cyber-light-gray hover:bg-cyber-gray/20"
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleSendFriendRequest}
                              disabled={isSendingRequest}
                              className="bg-cyber-neon-green hover:bg-cyber-neon-green/80 text-cyber-black"
                            >
                              {isSendingRequest ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <Send className="w-4 h-4 mr-2" />
                                  Send Request
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddFriend;

