
import { z } from 'zod'


const initiatePayment = z.object({
  body: z.object({
    //amount:z.number()
  }),
})

export const PaymentValidation = {
  initiatePayment,
}
