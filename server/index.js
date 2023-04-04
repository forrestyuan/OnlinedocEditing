const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, {
  cors: {
    origin: '*',
  },
});

const users = new Set();
let existingText = ''
let editingUser = '';

io.on('connection', (socket) => {
  console.log('a user connected');

  users.add(socket.id);
  socket.emit('connectUser', socket.id);
  socket.emit('text', existingText);
  io.emit('users', Array.from(users));

  socket.on('text', (newText) => {
    existingText = newText;
    io.emit('text', newText);
  });

  socket.on('editing', (userId) => {
    editingUser = userId
    io.emit('editing', userId)
  })

  socket.on('disconnect', () => {
    console.log('user disconnected');
    users.delete(socket.id);
    if (editingUser === socket.id) {
      editingUser = '';
      io.emit('editing', '');
    }
    io.emit('users', Array.from(users));
  });
});

httpServer.listen(3333, () => {
  console.log('listening on *:3333');
});
