import io from 'socket.io-client';

const socket = io('http://localhost:5000'); // Connect to the backend server

const SocketService = {
  on(eventName, callback) {
    socket.on(eventName, callback);
  },
  emit(eventName, data) {
    socket.emit(eventName, data);
  },
  off(eventName) {
    socket.off(eventName);
  },
  disconnect() {
    socket.disconnect();
  },
};

export default SocketService;
