import express from 'express'
import auth from '../../middlewares/auth'
import validateRequest from '../../middlewares/validateRequest'
import { PaymentValidation } from './Payment.validation'
import { PaymentController } from './Payment.controller'

const router = express.Router()

// Route to create a payment intent
router.post(
  '/initiate',
  auth(),
  validateRequest(PaymentValidation.initiatePayment),
  PaymentController.initiatePayment,
)

//confirm payment
router.post('/confirm/:paymentId', auth(), PaymentController.confirmPayment)

//get all payments by payer
router.get('/payer', auth(), PaymentController.getAllPaymentsByPayer)


//get single payment
router.get('/:id', auth(), PaymentController.getPaymentById)

router.get('/', auth(), PaymentController.getAllPayments)

router.post(
  '/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  PaymentController.handleStripeWebhook,
)

export const PaymentRoutes = router
