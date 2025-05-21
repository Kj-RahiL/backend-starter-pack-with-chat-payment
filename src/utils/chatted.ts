import { Server, Socket } from "socket.io";
import { z } from "zod";
import prisma from "../shared/prisma";

// Enhanced schemas for validation
const chatSchemas = {
  joinChat: z.object({
    chatId: z.string().optional(),
    participant2Id: z.string().optional(),
  }),
  sendMessage: z.object({
    chatId: z.string(),
    content: z.string().min(1),
  }),
  typing: z.object({
    chatroomId: z.string(),
    isTyping: z.boolean(),
  }),
  readReceipt: z.object({
    messageId: z.string(),
    chatroomId: z.string(),
  }),
};

const ChatHandler = (io: Server, socket: Socket) => {
  const userId = socket.data.user.id;

  // Get all chat members/groups with unread counts and last messages
  socket.on("getAllChatMembers", async () => {
  //  const {userId}= data
    try {
      // First get all chats the user is in
      const chatUsers = await prisma.chatUser.findMany({
        where: { userId },
        include: {
          chat: {
            include: {
              messages: {
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      });

      // Format the data with unread count and last message
      const chatsWithLastMessage = chatUsers.map((chatUser) => {
        const lastMessage = chatUser.chat.messages[0] || null;
        const unreadCount =
          lastMessage && !lastMessage.isRead && lastMessage.senderId !== userId
            ? 1
            : 0;
        
        const {messages, ...rest} = chatUser.chat
        return {
          ...rest,
          lastMessage,
          unreadCount,
        };
      });

      // console.log(chatsWithLastMessage, "cccc lass");
      // Sort by last message time (newest first)

      const sortedChats = chatsWithLastMessage.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || a.createdAt;
        const bTime = b.lastMessage?.createdAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

      console.log(sortedChats, "cccc lass");

      socket.emit("allChatMembers", sortedChats);
    } catch (error) {
      handleError(socket, "Failed to get chats", error);
    }
  });

  // Join chat room and get message history
  socket.on("joinChat", async (data) => {
    try {
      const { chatId, participant2Id } = chatSchemas.joinChat.parse(data);

      if (chatId) {
        socket.join(chatId);
        console.log(`User  joined room ${chatId}`);

        const messages = await prisma.message.findMany({
          where: { chatId },
          include: {
            sender: {
              select: {
                id: true,
                fullName: true,
                userName: true,
                email: true,
                profilePicture: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        });

        // Mark messages as read when joining
        await markMessagesAsRead(chatId, userId);
        socket.emit("messageHistory", messages);
      } else if (participant2Id !== userId) {
        const chat = await prisma.chat.create({
          data: {
            users: {
              create: [{ userId: userId }, { userId: participant2Id }],
            },
          },
          include: {
            users: true,
          },
        });

        socket.join(chat.id);
        console.log(`User ${userId} created and joined new room ${chat.id}`);
        socket.emit("messageHistory", null);
      }
    } catch (error) {
      handleError(socket, "Failed to join chat", error);
    }
  });

  // Send message with read receipt support
  socket.on("sendMessage", async (data) => {
    try {
      const { chatId, content } = chatSchemas.sendMessage.parse(data);

      const message = await prisma.message.create({
        data: {
          chatId,
          senderId:userId,
          content,
          isRead: false,
        },
        include: {
          sender: {
            select: {
              id: true,
              fullName: true,
              userName: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      });

      // Send to room
      // io.to(chatId).emit("receiveMessage", message);
      socket.emit("receiveMessage", message);

    } catch (error) {
      handleError(socket, "Failed to send message", error);
    }
  });

  // Typing indicator
  socket.on("typing", async (data) => {
    try {
      const { chatroomId, isTyping } = chatSchemas.typing.parse(data);
      socket.to(chatroomId).emit("typing", {
        userId: socket.data.user.id,
        isTyping,
      });
    } catch (error) {
      console.error("Typing indicator error:", error);
    }
  });

  // Message read receipt
  socket.on("markAsRead", async (data) => {
    try {
      const { messageId, chatroomId } = chatSchemas.readReceipt.parse(data);

      await prisma.message.update({
        where: { id: messageId },
        data: { isRead: true },
      });

      // Notify sender that message was read
      io.to(chatroomId).emit("messageRead", { messageId });
    } catch (error) {
      console.error("Read receipt error:", error);
    }
  });
};

async function markMessagesAsRead(chatId: string, userId: string) {
  await prisma.message.updateMany({
    where: {
      chatId,
      isRead: false,
    },
    data: { isRead: true },
  });
}

function handleError(socket: Socket, message: string, error: any) {
  console.error(message, error);
  socket.emit("chatError", { message, error: error.message });
}

export default ChatHandler;
