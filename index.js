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

io.on('connection', socket => {
  socket.onAny((eventName, ...args) => {
    console.log({ eventName, args });
    switch (eventName) {
      case 'join':
        const clients = io.engine.clientsCount;
        if (clients > 1) {
          io.local.emit('joined')
          // socket.broadcast.emit('joined', args[0]);
          // io.to(socket.id).emit('')
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