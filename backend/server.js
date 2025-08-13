import 'dotenv/config.js';// helps to work with .env files
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/project.model.js'
import {generateResult} from './services/ai.service.js'

const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server,{
  cors:{
    origin:'*'
  }
});

io.use( async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token ||socket.handshake.headers.authorization?.split(' ')[1]; 
    
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

  socket.on('project-message', async (data)=>{
    const message= data.message;
    const isAiPresent = message.includes('@ai') || message.includes('@AI') || message.includes('@Ai') || message.includes('@aI');

    if (isAiPresent) {
      const prompt = message.replace('@ai','') || message.replace('@AI','') || message.replace('@Ai','') || message.replace('@aI','');
      
      const result = await generateResult(prompt);

      io.to(socket.roomId).emit('project-message',{
        message: result,
        sender:{
          _id:'ai',
          email:'AI'
        }
      })
      return;
    }

    

    socket.broadcast.to(socket.roomId).emit('project-message',data)
  })

  socket.on('event', data => { /* …  */ });
  socket.on('disconnect', () => { console.log("User Disconnected")
    socket.leave(socket.roomId);
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});