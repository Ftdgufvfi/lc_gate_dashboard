import { io } from "socket.io-client";

const socket = io("ws://localhost:5000");  // Adjust this URL as needed

export default socket;
