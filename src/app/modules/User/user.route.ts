import { UserRole } from "@prisma/client";
import express from "express";
import { fileUploader } from "../../../helpars/fileUploader";
import auth from "../../middlewares/auth";
import { UserController } from "./user.controller";
import { UserValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";
import { parseBodyData } from "../../middlewares/parseBodyData";

const router = express.Router();

// const uploadSingle = fileUploader.upload.single("profileImage");

// register user
router.post(
  "/register",
  validateRequest(UserValidation.CreateUserValidationSchema),
  UserController.createUser
);

// get single user
router.get(
  "/:id",
  auth(),
  UserController.getUserById
);

// update user
router.put(
  "/update-me",
  auth(),
  fileUploader.uploadMultiple,
  parseBodyData,
  validateRequest(UserValidation.userUpdateSchema),
  UserController.updateUser
);

// block user
router.put(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  UserController.blockUser
);
// delete user
router.delete("/:id", auth(UserRole.SUPER_ADMIN), UserController.deleteUser);

// get all user
router.get("/", auth(), UserController.getAllUsers);

export const UserRoutes = router;
