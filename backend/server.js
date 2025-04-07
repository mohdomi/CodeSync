import 'dotenv/config'
import http from 'http'
import app from './app.js'
import {Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import Project from './models/project.model.js';
import { generateResult } from './services/gemini.service.js';

const port = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Socket.IO middleware for authentication
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split(' ')[1];
        const projectId = socket.handshake.query.projectId;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return next(new Error('Invalid ProjectId'));
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return next(new Error('Project not found'));
        }

        socket.project = project;

        if (!token) {
            return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return next(new Error('Token not authorized'));
        }

        socket.user = decoded;
        next();
    } catch (err) {
        next(err);
    }
});

// Socket.IO event handlers
io.on('connection', (socket) => {
    socket.roomId = socket.project._id.toString();
    console.log('User connected to room:', socket.roomId);

    socket.join(socket.roomId);

    socket.on('project-message', async (data) => {
        try {
            const { message, sender } = data;
            console.log('Received message:', { message, sender });

            // Broadcast message to all clients in the room
            socket.broadcast.to(socket.roomId).emit('project-message', data);

            // Check for AI command
            const isAIpresentInMessage = message.trim().match(/^.{1,3}/)?.[0];
            if (isAIpresentInMessage === '@ai') {
                const prompt = message.trim().replace('@ai', '');
                const result = await generateResult(prompt);

                io.to(socket.roomId).emit('project-message', {
                    message: result,
                    sender: {
                        _id: "ai",
                        email: 'AI'
                    }
                });
            }
        } catch (err) {
            console.error('Error handling project message:', err);
            socket.emit('error', { message: 'Error processing message' });
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from room:', socket.roomId);
        socket.leave(socket.roomId);
    });
});

// Start server
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Handle process termination
process.on('SIGINT', async () => {
    console.log('Shutting down server...');
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('Received SIGTERM signal');
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});