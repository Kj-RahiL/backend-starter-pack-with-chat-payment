// import { UserRole } from "@prisma/client";
// import httpStatus from "http-status";
// import ApiError from "../../../errors/ApiErrors";
// import prisma from "../../../shared/prisma";

import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";


const getMessageHistory = async (
    chatId: string,
) => {


  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      users: {
        select: {
          role: true,
          user:{
            select: {
              id: true,
              fullName: true,
              userName: true,
              email: true,
              profilePicture: true,
            },
          }
        }
      },
      messages:true
    }
  })

  if (!chat) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Chat not found")
  }
  
  return chat
};

export const chatServices = {
  getMessageHistory,
}
