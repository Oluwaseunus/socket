const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    method: ['GET', 'POST'],
  }
});

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

server.listen(8000, () => {
  console.log('listening on *:8000');
});