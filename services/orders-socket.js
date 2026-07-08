import { io } from "socket.io-client";

let socket;

export function getOrdersSocket() {
  if (!socket && typeof window !== "undefined") {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000", {
      autoConnect: false,
      transports: ["websocket"],
    });
  }

  return socket;
}
