// socket.js
import socketIOClient from 'socket.io-client';
export let user = {color: 'white', timer: 0};

const socket = socketIOClient('https://chesscape-backend.onrender.com/');

export default socket;
