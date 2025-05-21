// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// class StripeService {
//   // Create a payment intent (client pays to platform)
//   async createPaymentIntent(amount, currency, metadata) {
//     try {
//       const paymentIntent = await stripe.paymentIntents.create({
//         amount: Math.round(amount * 100), // in cents
//         currency,
//         metadata,
//         capture_method: 'manual', // Hold funds until manually captured
//       });
//       return paymentIntent;
//     } catch (error) {
//       throw new Error(`Stripe payment intent creation failed: ${error.message}`);
//     }
//   }

//   // Capture the payment (move funds to platform account)
//   async capturePaymentIntent(paymentIntentId) {
//     try {
//       return await stripe.paymentIntents.capture(paymentIntentId);
//     } catch (error) {
//       throw new Error(`Stripe payment capture failed: ${error.message}`);
//     }
//   }

//   // Transfer funds to freelancer's Stripe account
//   async transferToFreelancer(amount, currency, destinationAccount, metadata) {
//     try {
//       const transfer = await stripe.transfers.create({
//         amount: Math.round(amount * 100),
//         currency,
//         destination: destinationAccount,
//         metadata,
//       });
//       return transfer;
//     } catch (error) {
//       throw new Error(`Stripe transfer failed: ${error.message}`);
//     }
//   }

//   // Create a connected account for freelancer
//   async createConnectedAccount(email, country) {
//     try {
//       const account = await stripe.accounts.create({
//         type: 'express',
//         email,
//         country,
//         capabilities: {
//           transfers: { requested: true },
//         },
//       });
//       return account;
//     } catch (error) {
//       throw new Error(`Stripe account creation failed: ${error.message}`);
//     }
//   }
// }

// module.exports = new StripeService();
