import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { chatServices } from "./chat.services";


const getMessageHistory = catchAsync(async (req: Request, res: Response) => {
const chatId = req.params.chatId

  const message = await chatServices.getMessageHistory(
     chatId
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Message fetched successfully',
    data: message,
  })
})

export const chatController = {
  getMessageHistory,
}
