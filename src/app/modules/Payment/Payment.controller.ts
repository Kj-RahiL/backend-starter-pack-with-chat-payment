import { Request, Response } from 'express'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../shared/sendResponse'
import httpStatus from 'http-status'
import { paymentService } from './Payment.service'


// Create Payment Intent
const initiatePayment = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id
    const payload  = { ...req.body, userId }

    const paymentIntent = await paymentService.initiatePayment(payload)
    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: 'Payment intent created successfully',
      data: paymentIntent,
    })
  },
)

//confirm payment
const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  // const paymentId = req.params.paymentId
  // const data = await paymentService.confirmPayment(paymentId)
  // sendResponse(res, {
  //   statusCode: httpStatus.OK,
  //   success: true,
  //   message: 'Payment confirmed successfully',
  //   data,
  // })
})

//get all payments
const getAllPayments = catchAsync(async (req: Request, res: Response) => {
  const data = await paymentService.getAllPayments(req.query)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All payments fetched successfully',
    data,
  })
})

//get all payments
const getAllPaymentsByPayer = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;

    const data = await paymentService.getAllPayments({ userId, ...req.query });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Client All payments fetched successfully',
      data,
    })
  },
)

//get all payments
const getAllPaymentsByReceiver = catchAsync(
  async (req: Request, res: Response) => {
    const receiverId = req.user?.id

    const data = await paymentService.getAllPayments({
      receiverId,
      ...req.query,
    })
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Receiver All payments fetched successfully',
      data,
    })
  },
)

// //get all payments
// const getAllPaymentsByCompany = catchAsync(async (req: Request, res: Response) => {
//   const data = await paymentService.getAllPaymentsByUser();
//   sendResponse(res, {
//     statusCode: httpStatus.OK,
//     success: true,
//     message: "All payments fetched successfully",
//     data,
//   });
// });

//get single payment
const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id
  const data = await paymentService.getPaymentById(id)
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment fetched successfully',
    data,
  })
})

const handleStripeWebhook = catchAsync(async (req, res) => {
  // const sig = req.headers['stripe-signature'];

  // const event = stripe.webhooks.constructEvent(
  //   req.body,
  //   sig as string,
  //   process.env.STRIPE_WEBHOOK_SECRET as string,
  // );
  const result = await paymentService.HandleStripeWebhook(req.body)

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Webhook event trigger successfully',
    data: result,
  })
})

export const PaymentController = {
  initiatePayment,
  confirmPayment,
  handleStripeWebhook,
  getAllPayments,
  getAllPaymentsByPayer,
  getAllPaymentsByReceiver,
  getPaymentById,
}
