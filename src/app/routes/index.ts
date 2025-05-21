import express from "express";

import { AuthRoutes } from "../modules/Auth/auth.routes";
import { UserRoutes } from "../modules/User/user.route";
import { PaymentRoutes } from "../modules/Payment/Payment.routes";;
import { chatRoutes } from "../modules/Chat/chat.route";


// import { paymentRoutes } from "../modules/Payment/payment.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },

  {
    path: "/user",
    route: UserRoutes,
  },
  
  {
    path: "/payment",
    route: PaymentRoutes,
  },
 
  {
    path: "/message",
    route: chatRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
