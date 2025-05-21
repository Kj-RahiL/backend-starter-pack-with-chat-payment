import { Router } from "express";
import { chatController } from "./chat.controller";
import validateRequest from "../../middlewares/validateRequest";

const router = Router();

// router.post("/create-chat", chatController.createChatHandler);
// router.get("/:orderId", chatController.getChatHandler);

router.get(
  '/:chatId',
  chatController.getMessageHistory,
)

export const chatRoutes = router;
