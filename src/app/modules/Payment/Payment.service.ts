import prisma from '../../../shared/prisma'
import Stripe from 'stripe'
import QueryBuilder from '../../../helpars/queryBuilder'
import ApiError from '../../../errors/ApiErrors'
import httpStatus from 'http-status'
import { PaymentMetadata, TPayment } from './Payment.interface'
import stripe from '../../../helpars/stripe'
import {
  handleChargeRefunded,
  handlePaymentIntentFailed,
  handlePaymentIntentSucceeded,
} from './webhook.helpers'
import { PaymentStatus, UserStatus } from '@prisma/client'


const initiatePayment = async (payload:TPayment) => {
  const {  userId, } = payload;

  // Verify user exists and is active
  const user = await prisma.user.findUnique({
    where: { id: userId, userStatus: UserStatus.ACTIVE },
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found or inactive');
  }


  // Common metadata for payment intent
  const metadata: PaymentMetadata = {
    userId,
  };


  

  // Create Stripe payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(50 * 100),
    currency: 'usd',
    metadata,
  });

  // Update or create payment record
  const paymentData = {
    userId,
    amount: 50, //default set
    stripePaymentId: paymentIntent.id,
  };

  const payment = await prisma.payment.create({ data: paymentData });

  return {
    payment,
    clientSecret: paymentIntent.client_secret as string,
  };
};




//without webhooks
// const confirmPayment = async (paymentId: string) => {
//   const payment = await prisma.payment.findUnique({
//     where: { id: paymentId },
//   })

//   if (!payment) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found')
//   }

//   if (payment.payment !== 'PENDING') {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       'Payment is not in pending state',
//     )
//   }

//   // Capture payment in Stripe
//   const capturedPayment = await stripe.paymentIntents.capture(
//     payment.stripePaymentId!,
//   )
//   // const chargeId = paymentIntent.latest_charge;
//   const charges = await stripe.charges.list({
//     payment_intent: payment.stripePaymentId!,
//   })
//   const chargeId: string = charges.data[0].id

//   // Update payment status
//   const updatedPayment = await prisma.payment.update({
//     where: { id: paymentId },
//     data: {
//       payment: 'COMPLETED',
//       stripeChargeId: chargeId,
//       updatedAt: new Date(),
//     },
//   })

//   return updatedPayment
// }

//get all payments


const getAllPayments = async (queryParams: Record<string, any>) => {
  const queryBuilder = new QueryBuilder(prisma.payment, queryParams)

  const payments = await queryBuilder
    .search(['amount', 'payment', 'stripePaymentId', 'stripeChargeId'])
    .filter()
    .sort()
    .paginate()
    .fields()
    .include({
      user: {
        select: {
          id: true,
          fullName: true,
          userName: true,
          email: true,
          role: true,
          profilePicture: true,
        },
      },
      clan: true,
      tournament: true
    })
    .execute()
  const metaData = await queryBuilder.countTotal()
  return { metaData, payments }
}

//get single payment
const getPaymentById = async (id: string) => {
  const data = await prisma.payment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          userName: true,
          email: true,
          role: true,
          profilePicture: true,
        },
      },
    },
  })
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found')
  }
  return data
}

const HandleStripeWebhook = async (event: Stripe.Event) => {
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return { received: true }
  } catch (error) {
    console.error('Error handling Stripe webhook:', error)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Webhook handling failed',
    )
  }
}

export const paymentService = {
  initiatePayment,
  getAllPayments,
  getPaymentById,
  HandleStripeWebhook,
}
