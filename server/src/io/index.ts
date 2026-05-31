import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';

export function attachSocketIO(server: HttpServer): SocketServer {
  const io = new SocketServer(server, {
    cors: { origin: 'http://localhost:5173', credentials: true },
  });

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on('joinRoom', (room: string) => {
      socket.join(room);
      socket.to(room).emit('peerJoined', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('socket disconnected', socket.id);
    });
  });

  return io;
}
