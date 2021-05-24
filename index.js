const express = require('express');
const app = express();
const http = require('http');
require('dotenv').config();
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    method: ['GET', 'POST'],
  }
});

const PORT = process.env.PORT || 7500

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

const allSockets = [];

io.on('connection', socket => {
  socket.on('disconnect', () => {
    const disconnectedSocketIndex = allSockets.findIndex((entry) => socket.id === entry.socket.id);
    if (disconnectedSocketIndex !== -1) {
      const disconnectedSocket = allSockets[disconnectedSocketIndex];
      allSockets.splice(disconnectedSocketIndex, 1);
      io.local.emit('disconnected', disconnectedSocket.user);
    }
  })

  socket.onAny((eventName, ...args) => {
    console.log({ eventName, args });
    switch (eventName) {
      case 'join':
      case 'user-reconnected':
        const user = args[0];
        allSockets.push({ user, socket })
        const clients = io.engine.clientsCount;
        if (clients > 1) {
          io.local.emit('joined');
        }
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