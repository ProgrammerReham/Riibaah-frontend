import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock, UserPlus, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { friendsAPI } from '../../lib/api';
import toast from 'react-hot-toast';
import '../../App.css';

const FriendRequests = ({ onRequestUpdate }) => {
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState(new Set());

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const [receivedResponse, sentResponse] = await Promise.all([
        friendsAPI.getReceivedRequests(),
        friendsAPI.getSentRequests(),
      ]);
      
      setReceivedRequests(receivedResponse.data.requests);
      setSentRequests(sentResponse.data.requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
      toast.error('Failed to load friend requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId, senderName) => {
    if (processingRequests.has(requestId)) return;

    try {
      setProcessingRequests(prev => new Set(prev).add(requestId));
      
      await friendsAPI.acceptFriendRequest(requestId);
      
      setReceivedRequests(prev => prev.filter(req => req._id !== requestId));
      toast.success(`You are now friends with ${senderName}! 🎉`);
      
      // Notify parent component to refresh friends list
      if (onRequestUpdate) onRequestUpdate();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (requestId, senderName) => {
    if (processingRequests.has(requestId)) return;

    try {
      setProcessingRequests(prev => new Set(prev).add(requestId));
      
      await friendsAPI.rejectFriendRequest(requestId);
      
      setReceivedRequests(prev => prev.filter(req => req._id !== requestId));
      toast.success(`Friend request from ${senderName} rejected`);
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      toast.error('Failed to reject friend request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const RequestCard = ({ request, type, onAccept, onReject }) => {
    const user = type === 'received' ? request.sender : request.recipient;
    const isProcessing = processingRequests.has(request._id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="p-4 bg-cyber-darker rounded-lg border border-cyber-gray hover:border-cyber-neon-cyan/50 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-r from-cyber-neon-pink to-cyber-neon-purple rounded-full flex items-center justify-center">
              <span className="text-cyber-black font-semibold text-lg">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white">
                {user.username}
              </h3>
              <p className="text-sm text-cyber-light-gray">
                {formatDate(request.createdAt)}
              </p>
              {request.message && (
                <p className="text-sm text-cyber-neon-cyan mt-1 italic">
                  "{request.message}"
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {type === 'received' ? (
              <>
                <Button
                  size="sm"
                  onClick={() => onAccept(request._id, user.username)}
                  disabled={isProcessing}
                  className="bg-cyber-neon-green hover:bg-cyber-neon-green/80 text-cyber-black"
                >
                  {isProcessing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-cyber-black border-t-transparent rounded-full"
                    />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject(request._id, user.username)}
                  disabled={isProcessing}
                  className="bg-cyber-neon-orange hover:bg-cyber-neon-orange/80 text-cyber-black"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-cyber-light-gray">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Pending</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-cyber-dark border-cyber-gray">
        <CardContent className="flex items-center justify-center h-32">
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
    <Card className="bg-cyber-dark border-cyber-gray">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyber-neon-pink">
          <UserPlus className="w-5 h-5" />
          Friend Requests
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-cyber-darker">
            <TabsTrigger 
              value="received" 
              className="data-[state=active]:bg-cyber-neon-cyan data-[state=active]:text-cyber-black"
            >
              Received ({receivedRequests.length})
            </TabsTrigger>
            <TabsTrigger 
              value="sent"
              className="data-[state=active]:bg-cyber-neon-pink data-[state=active]:text-cyber-black"
            >
              Sent ({sentRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="mt-4">
            <div className="space-y-3 max-h-64 overflow-y-auto cyber-scrollbar">
              <AnimatePresence>
                {receivedRequests.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-cyber-light-gray"
                  >
                    <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No pending friend requests</p>
                  </motion.div>
                ) : (
                  receivedRequests.map((request) => (
                    <RequestCard
                      key={request._id}
                      request={request}
                      type="received"
                      onAccept={handleAcceptRequest}
                      onReject={handleRejectRequest}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="sent" className="mt-4">
            <div className="space-y-3 max-h-64 overflow-y-auto cyber-scrollbar">
              <AnimatePresence>
                {sentRequests.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-cyber-light-gray"
                  >
                    <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No sent friend requests</p>
                  </motion.div>
                ) : (
                  sentRequests.map((request) => (
                    <RequestCard
                      key={request._id}
                      request={request}
                      type="sent"
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FriendRequests;

