import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Settings, User, Users, UserPlus, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import FriendsList from './friends/FriendsList';
import FriendRequests from './friends/FriendRequests';
import AddFriend from './friends/AddFriend';
import ChatWindow from './chat/ChatWindow';
import socketService from '../lib/socket';
import '../App.css';

const Dashboard = () => {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [activeTab, setActiveTab] = useState('friends');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const { user, logout } = useAuth();

  useEffect(() => {
    // Connect to socket when dashboard loads
    if (user) {
      socketService.connect(user.id);
    }

    return () => {
      // Cleanup socket connection
      socketService.disconnect();
    };
  }, [user]);

  const handleSelectFriend = (friend) => {
    setSelectedFriend(friend);
  };

  const handleFriendUpdate = () => {
    // Trigger refresh of friends list and requests
    setRefreshTrigger(prev => prev + 1);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-black via-cyber-dark to-cyber-darker">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-neon-cyan opacity-3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-neon-pink opacity-3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-cyber-gray bg-cyber-dark/90 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-cyber-neon-cyan to-cyber-neon-pink rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-cyber-black" />
              </div>
              <h1 className="text-2xl font-bold neon-glow-cyan" data-text="RiiBah">
                RiiBah
              </h1>
            </div>

            {/* User Info & Actions */}
            <div className="flex items-center gap-4">
              {/* User Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyber-neon-purple to-cyber-neon-pink rounded-full flex items-center justify-center">
                  <span className="text-cyber-black font-semibold text-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-white font-medium">
                  {user?.username}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-cyber-light-gray hover:text-cyber-neon-cyan hover:bg-cyber-neon-cyan/10"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-cyber-light-gray hover:text-cyber-neon-orange hover:bg-cyber-neon-orange/10"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-cyber-gray bg-cyber-dark/50 backdrop-blur-sm">
            <div className="h-full p-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 bg-cyber-darker mb-4">
                  <TabsTrigger 
                    value="friends" 
                    className="data-[state=active]:bg-cyber-neon-cyan data-[state=active]:text-cyber-black"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Friends
                  </TabsTrigger>
                  <TabsTrigger 
                    value="requests"
                    className="data-[state=active]:bg-cyber-neon-pink data-[state=active]:text-cyber-black"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Requests
                  </TabsTrigger>
                  <TabsTrigger 
                    value="add"
                    className="data-[state=active]:bg-cyber-neon-green data-[state=active]:text-cyber-black"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="friends" className="h-full mt-0">
                    <FriendsList
                      key={refreshTrigger}
                      onSelectFriend={handleSelectFriend}
                      selectedFriendId={selectedFriend?._id}
                    />
                  </TabsContent>

                  <TabsContent value="requests" className="h-full mt-0">
                    <FriendRequests
                      key={refreshTrigger}
                      onRequestUpdate={handleFriendUpdate}
                    />
                  </TabsContent>

                  <TabsContent value="add" className="h-full mt-0">
                    <AddFriend onFriendAdded={handleFriendUpdate} />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 p-4">
            <motion.div
              key={selectedFriend?._id || 'no-selection'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ChatWindow
                selectedFriend={selectedFriend}
                onClose={() => setSelectedFriend(null)}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

