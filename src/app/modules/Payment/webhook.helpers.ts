import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import prisma from '../../../shared/prisma';
import Stripe from 'stripe';

// Helper functions
const handlePaymentIntentSucceeded = async (
  paymentIntent: Stripe.PaymentIntent,
) => {
  // Find payment in database
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: paymentIntent.id },
   
  });

  if (!payment) {
    console.error(`Payment not found for PI: ${paymentIntent.id}`);
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  if (paymentIntent.status !== 'succeeded') {
    throw new Error('Payment intent is not in succeeded state');
  }

  // Update payment status in database
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { paymentStatus: 'COMPLETED' },
    }),
  ]);

  console.log(`Payment ${payment.id} completed successfully`);
};

const handlePaymentIntentFailed = async (
  paymentIntent: Stripe.PaymentIntent,
) => {
  // Find payment in the database
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: paymentIntent.id },
  });

  if (!payment) {
    console.error(`Payment not found for PI: ${paymentIntent.id}`);
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  // Update payment status to reflect failure
  await prisma.payment.update({
    where: { id: payment.id },
    data: { paymentStatus: 'CANCELED' },
  });

  console.log(`Payment ${payment.id} failed`);
};

const handleChargeRefunded = async (charge: Stripe.Charge) => {
  // Find payment in database
  const payment = await prisma.payment.findFirst({
    where: { stripePaymentId: charge.payment_intent as string },
  });

  if (!payment) {
    console.error(`Payment not found for charge: ${charge.id}`);
    throw new ApiError(httpStatus.NOT_FOUND, 'Payment not found');
  }

  // Update payment status
  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { paymentStatus: 'REFUNDED' },
    }),
  ]);

  console.log(`Payment ${payment.id} refunded`);
};

export {
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleChargeRefunded,
};