import {getSocket} from './Socket';

class SocketManager {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  initialize() {
    this.socket = getSocket();
    if (!this.socket) {
      console.warn('Socket not available during initialization');
    }
  }

  isConnected() {
    this.socket = getSocket(); // Always get latest
    return this.socket?.connected;
  }

  emit(event, data, ackCallback) {
    this.socket = getSocket();
    if (!this.socket) {
      console.warn(`Socket not initialized - cannot emit ${event}`);
      return false;
    }
    this.socket.emit(event, data, ackCallback);
    return true;
  }

  on(event, callback) {
    this.socket = getSocket();
    if (!this.socket) {
      console.warn(`Socket not initialized - cannot listen to ${event}`);
      return false;
    }
    this.off(event);
    this.socket.on(event, callback);
    this.listeners.set(event, callback);
    return true;
  }

  off(event) {
    this.socket = getSocket();
    if (!this.socket) return;
    const callback = this.listeners.get(event);
    if (callback) {
      this.socket.off(event, callback);
      this.listeners.delete(event);
    }
  }

  offAll() {
    this.socket = getSocket();
    if (!this.socket) return;
    this.listeners.forEach((callback, event) => {
      this.socket.off(event, callback);
    });
    this.listeners.clear();
  }
}

const socketManager = new SocketManager();
export default socketManager;
