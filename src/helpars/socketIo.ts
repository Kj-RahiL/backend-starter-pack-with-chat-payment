import { Server } from "http";
import { Socket, Server as SocketIOServer } from "socket.io";
import { corsOptions } from "../app"; 
import { jwtHelpers } from "./jwtHelpers";
import config from "../config";
import { Secret } from "jsonwebtoken";
import prisma from "../shared/prisma";
import ChatHandler from "../utils/chatted";

let io: SocketIOServer;

export function socketIo(server: Server) {
    // Initialize Socket.io with the server and CORS options
    io = new SocketIOServer(server, {
        cors: corsOptions,
        connectionStateRecovery: {
            maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
            skipMiddlewares: true,
        }
    });

    io.use(async (socket, next) => {
        const token = socket.handshake.query.token ||
            socket.handshake.auth.token

        try {
            // const token = socket.handshake.auth.token;
            console.log(token, 'token')
            if (!token) {
                return next(new Error('Authentication error'));
            }

            // Verify token and get user (replace with your auth logic)
            const user = await jwtHelpers.verifyToken(token, config.jwt.jwt_secret as Secret);
            if (!user) {
                return next(new Error('Invalid token'));
            }
            // Attach user to socket for later use
            socket.data.user = user;
            next();
        } catch (error) {
            console.log(error)
            next(new Error('Authentication failed'));
        }
    });


    io.on('connection', async (socket: Socket) => {
        console.log('User connected:', socket.data.user.userName);
        const userId = socket.data.user.id;

        // Update user online status
        await updateUserStatus(userId, true);

        // Initialize handlers
        ChatHandler(io, socket);


        // Handle disconnect
        socket.on('disconnect', async () => {
            await updateUserStatus(userId, false);
            console.log('User disconnected:', socket.data.user.email);
        });
    });

    return io
}


export function getIO(): SocketIOServer {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
}

// Helper functions
async function updateUserStatus(userId: string, isOnline: boolean) {
    await prisma.user.update({
        where: { id: userId },
        data: {
            isOnline,
            lastSeen: new Date(),
            ...(isOnline ? {} : { socketId: null }) // Clear socket ID on disconnect
        },
    });
}
