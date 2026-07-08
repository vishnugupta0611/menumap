import { io } from 'socket.io-client';

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000', {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Helper to join restaurant room
export function joinRestaurantRoom(restaurantId) {
  socket.emit('restaurant:join', restaurantId);
}

// Helper to leave room
export function leaveRestaurantRoom(restaurantId) {
  if (socket.connected) {
    socket.emit('restaurant:leave', restaurantId);
  }
}
