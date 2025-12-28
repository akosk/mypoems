import Stripe from 'stripe'
import { sql } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const stripe = new Stripe(config.stripeSecretKey)
  const webhookSecret = config.stripeWebhookSecret
  
  if (!webhookSecret) {
    throw createError({ statusCode: 500, statusMessage: 'Webhook secret missing' })
  }

  const headers = getRequestHeaders(event)
  const sig = headers['stripe-signature']
  const rawBody = await readRawBody(event)

  if (!sig || !rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Missing signature or body' })
  }

  let stripeEvent: Stripe.Event

  try {
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed.', err.message)
    throw createError({ statusCode: 400, statusMessage: `Webhook Error: ${err.message}` })
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session
    const executionId = session.client_reference_id

    if (executionId) {
      console.log(`Payment successful for execution ${executionId}`)
      await sql`
        UPDATE executions 
        SET payment_status = 'paid'
        WHERE n8n_execution_id = ${executionId}
      `
    }
  }

  return { received: true }
})
