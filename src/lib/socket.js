import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io('http://localhost:5001', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log("🔌 Connected to RiiBah server");
      this.isConnected = true;
      this.socket.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log("🔌 Disconnected from RiiBah server");
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Message events
  sendMessage(recipientId, message, senderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        recipientId,
        message,
        senderId,
      });
    }
  }

  onReceiveMessage(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  offReceiveMessage() {
    if (this.socket) {
      this.socket.off('receive_message');
    }
  }

  // Typing events
  sendTyping(recipientId, isTyping) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing', {
        recipientId,
        isTyping,
      });
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  offUserTyping() {
    if (this.socket) {
      this.socket.off('user_typing');
    }
  }

  // Online status events
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user_online', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user_offline', callback);
    }
  }

  offUserOnline() {
    if (this.socket) {
      this.socket.off('user_online');
    }
  }

  offUserOffline() {
    if (this.socket) {
      this.socket.off('user_offline');
    }
  }

  // Generic event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;

