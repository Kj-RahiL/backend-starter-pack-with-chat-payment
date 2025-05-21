import bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import prisma from "../../../shared/prisma";
import { User, UserRole, UserStatus } from "@prisma/client";
import { TUser } from "./user.interface";
import httpStatus from "http-status";
import emailSender from "../../../helpars/emailSender";
import QueryBuilder from "../../../helpars/queryBuilder";

const createUser = async (payload: User) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(400, "This user information already exists");
  }
  const existingUserName = await prisma.user.findUnique({
    where: { userName: payload.userName },
  });
  if (existingUserName) {
    throw new ApiError(400, "This user name already exists");
  }

  const hashedPassword: string = await bcrypt.hash(payload.password, 12);

  const userData = {
    ...payload,
    password: hashedPassword,
    role: UserRole.USER,
    userStatus: UserStatus.ACTIVE,
  };

  //create user
  const user = await prisma.user.create({
    data: userData,
  });
  if (!user) {
    throw new ApiError(httpStatus.CONFLICT, "User not created!");
  }


  //otp generate and send also email
  const randomOtp = Math.floor(1000 + Math.random() * 9000).toString();
  const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Email Verification</title>
  </head>
  <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
          <div style="background-color: #FF7600; background-image: linear-gradient(135deg, #00A9EA, #005D81); padding: 30px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">OTP Verification</h1>
          </div>
          <div style="padding: 20px 12px; text-align: center;">
              <p style="font-size: 18px; color: #333333; margin-bottom: 10px;">Hello,</p>
              <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">Your OTP for verifying your account is:</p>
              <p style="font-size: 36px; font-weight: bold; color: #005D81; margin: 20px 0; padding: 10px 20px; background-color: #f0f8f0; border-radius: 8px; display: inline-block; letter-spacing: 5px;">${randomOtp}</p>
              <p style="font-size: 16px; color: #555555; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">Please enter this OTP to complete the verification process. This OTP is valid for 5 minutes.</p>
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                  <p style="font-size: 14px; color: #888888; margin-bottom: 4px;">Thank you for choosing our service!</p>
                  <p style="font-size: 14px; color: #888888; margin-bottom: 0;">If you didn't request this OTP, please ignore this email.</p>
              </div>
          </div>
          <div style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 12px; color: #999999;">
              <p style="margin: 0;">© ${new Date().getFullYear()} Business. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;

  await emailSender("Verify Your Email", user.email, html);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      otp: Number(randomOtp),
      otpExpiry: otpExpiry,
    },
  });

  return { message: "OTP sent your email successfully" };
};

const getUserById = async (id: string) => {
  const result = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      userName: true,
      email: true,
      role: true,
      profilePicture: true,
      coverPicture: true,
      isOnline: true,
      userStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

const updateUser = async (id: string, payload: Partial<User>) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user not found");
  }
  if (payload.userName) {
    const userName = await prisma.user.findUnique({
      where: {
        userName: payload.userName,
      },
    });
    if (userName) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "This userName already exists"
      );
    }
  }
  const result = await prisma.user.update({
    where: { id },
    data: payload,
    select: {
      id: true,
      fullName: true,
      userName: true,
      email: true,
      role: true,
      profilePicture: true,
      coverPicture: true,
      isOnline: true,
      userStatus: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

const blockUser = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user not found");
  }

  // Determine the new status
  const newStatus =
    user.userStatus === UserStatus.BLOCKED
      ? UserStatus.ACTIVE
      : UserStatus.BLOCKED;

  const result = await prisma.user.update({
    where: { id },
    data: { userStatus: newStatus },
  });

  return {
    data: result,
    message:
      newStatus === UserStatus.BLOCKED
        ? "User blocked successfully"
        : "User unblocked successfully",
  };
};

const deleteUser = async (id: string) => {
  const result = await prisma.user.update({
    where: { id },
    data: { isDeleted: true },
  });

  return result;
};

const getAllUsers = async (queryParams: Record<string, any>) => {
  const filteredQueryParams = {
    ...queryParams,
    isDeleted: false,
    ...(queryParams.role ? {} : { role: { not: UserRole.SUPER_ADMIN } }),
  };
  const queryBuilder = new QueryBuilder(prisma.user, filteredQueryParams);

  const users = await queryBuilder
    .search(["fullName", "userName", "email"])
    .filter()
    .sort()
    .paginate()
    .fields()
    .include({})
    .execute();

  // Remove the password field from each user
  const usersWithoutPassword = users.map((user: User) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  // Get the metadata
  const metaData = await queryBuilder.countTotal();

  return { metaData, user: usersWithoutPassword };
};

export const UserService = {
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  blockUser,
};
