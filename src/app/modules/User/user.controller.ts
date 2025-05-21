import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../../shared/sendResponse";
import { User } from "@prisma/client";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User Created Successfully",
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await UserService.getUserById(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User retrieved successfully!",
    data: result,
  });
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const updateData:User = req.body;
  console.log(req.files, "req.files");
  console.log(req.file, "req.t");

  if (req.files) {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (files.profilePicture && files.profilePicture[0]) {
      updateData.profilePicture = `${req.protocol}://${req.get(
        "host"
      )}/uploads/${files.profilePicture[0].filename}`;
    }

    if (files.coverPicture && files.coverPicture[0]) {
      updateData.coverPicture = `${req.protocol}://${req.get(
        "host"
      )}/uploads/${files.coverPicture[0].filename}`;
    }
  }

  console.log(updateData, "updateData");

  const result = await UserService.updateUser(userId, updateData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User updated successfully!",
    data: result,
  });
});

const blockUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await UserService.blockUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const result = await UserService.deleteUser(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User deleted successfully!",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All users retrieved successfully!",
    meta: result.metaData,
    data: result.user,
  });
});

export const UserController = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  blockUser,
};
