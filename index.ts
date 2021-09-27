import http from 'http';
import dotenv from 'dotenv';
import express from 'express';
import { Server, Socket } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 7500;

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

interface Connection {
  user: string;
  socket: Socket;
}

interface ForceMutePayload {
  userId: string;
  sender: string;
}

const allSockets: Connection[] = [];

function handleForceMute({ userId, sender }: ForceMutePayload) {
  const connection = allSockets.find(({ user }) => user === userId);

  if (connection) {
    io.to(connection.socket.id).emit('force_mute', { sender });
  }
}

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    const disconnectedSocketIndex = allSockets.findIndex(
      (entry) => socket.id === entry.socket.id
    );

    if (disconnectedSocketIndex !== -1) {
      const disconnectedSocket = allSockets[disconnectedSocketIndex];
      allSockets.splice(disconnectedSocketIndex, 1);
      io.local.emit('disconnected', disconnectedSocket.user);
    }
  });

  socket.onAny((eventName, ...args) => {
    switch (eventName) {
      case 'join':
      case 'user-reconnected':
        const user = args[0];
        allSockets.push({ user, socket });
        const clients = io.engine.clientsCount;
        if (clients > 1) {
          io.local.emit('joined');
        }
        break;

      case 'force_mute':
        handleForceMute(args[0] as ForceMutePayload);
        break;

      default:
        socket.broadcast.emit(eventName, ...args);
        break;
    }
  });
});

server.listen(PORT, () => {
  console.log(`listening on *:${PORT}`);
});
