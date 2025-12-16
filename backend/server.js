import 'dotenv/config';// helps to work with .env files
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js'
import { generateResult } from './services/ai.service.js'

const port = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*'
  }
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];

    const projectId = socket.handshake.query.projectId;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error('Invalid projectId'));
    }

    socket.project = await projectModel.findById(projectId);

    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return next(new Error('Invalid token(Decoded)'));
    }
    socket.user = decoded; // Attach user info to the socket
    next();
  } catch (error) {
    next(error);
  }
})

io.on('connection', socket => {
  socket.roomId = socket.project._id.toString();

  console.log('A user connected:', socket.id);

  socket.join(socket.roomId);

  socket.on('project-message', async (data) => {
    try {
      const message = data.message;
      const isAiPresent = message.includes('@ai') || message.includes('@AI') || message.includes('@Ai') || message.includes('@aI');

      if (isAiPresent) {
        // Remove all variations of @ai from the message
        const prompt = message.replace(/@ai/gi, '').trim();

        const result = await generateResult(prompt);

        // Ensure result is always a string for safe frontend rendering
        const responseMessage = typeof result === 'string' ? result : JSON.stringify(result);

        io.to(socket.roomId).emit('project-message', {
          message: responseMessage,
          sender: {
            _id: 'ai',
            email: 'AI'
          }
        });
        return;
      }

      socket.broadcast.to(socket.roomId).emit('project-message', data);
    } catch (error) {
      console.error('Error handling project-message:', error);
      io.to(socket.roomId).emit('project-message', {
        message: 'Sorry, an error occurred while processing your request.',
        sender: {
          _id: 'ai',
          email: 'AI'
        }
      });
    }
  })

  socket.on('event', data => { /* …  */ });
  socket.on('disconnect', () => {
    console.log("User Disconnected")
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});