import { Request, Response } from "express";
import httpStatus from "http-status";
import { string } from "zod";
import config from "../../../config";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";
import { authValidation } from "./auth.validation";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);

  if (result.refreshToken) {
    // Set refresh token in cookies for verified users
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: config.env === "production",
      sameSite: "strict",
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.accessToken ? { accessToken: result.accessToken } : {},
  });
});

const sendOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.sendOtp(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
})
const enterOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.enterOtp(req.body);

  // res.cookie("token", result.accessToken, { httpOnly: true });
  res.cookie("refreshToken", result.accessToken, {
    secure: config.env === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User logged in successfully",
    data: result,
  });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
  // Clear the token cookie
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User Successfully logged out",
    data: null,
  });
});

// get user profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id

  const result = await AuthServices.getMyProfile(userId as string);
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "User profile retrieved successfully",
    data: result,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id
  const { oldPassword, newPassword } =
    authValidation.changePasswordValidationSchema.parse(req.body);

  const result = await AuthServices.changePassword(
    userId ,
    newPassword,
    oldPassword
  );
  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Password changed successfully",
    data: result,
  });
});

// forgot password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const data = await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Check your email!",
    data: data,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || "";
  console.log(token, 'rest token')

  await AuthServices.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password Reset!",
    data: null,
  });
});

// const socialLogin = catchAsync(async (req: Request, res: Response) => {
//   const result = await AuthServices.socialLogin(req.body);
//   res.cookie("token", result.accessToken, { httpOnly: true });

//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "User logged in successfully",
//     data: result,
//   });
// });

export const AuthController = {
  loginUser,
  sendOtp,
  enterOtp,
  logoutUser,
  getMyProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  // socialLogin,
};
