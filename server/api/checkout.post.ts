import Stripe from 'stripe'
import { sql } from '../utils/db'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const secretKey = config.stripeSecretKey || process.env.STRIPE_SECRET_KEY
  
  if (!secretKey) {
    throw createError({ statusCode: 500, statusMessage: 'Stripe key missing' })
  }
  
  const stripe = new Stripe(secretKey)
  const session = await getUserSession(event)

  if (!session?.user?.email) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const executionId = body.executionId

  if (!executionId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing executionId' })
  }

  // Check execution
  const [execution] = await sql`
    SELECT id, payment_status, n8n_execution_id
    FROM executions
    WHERE n8n_execution_id = ${executionId}
  `

  if (!execution) {
    throw createError({ statusCode: 404, statusMessage: 'Execution not found' })
  }

  if (execution.payment_status === 'paid') {
    throw createError({ statusCode: 400, statusMessage: 'Already paid' })
  }

  const origin = getRequestHeader(event, 'origin') || 'http://localhost:3000'

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'huf',
          product_data: {
            name: 'Verseskötet (PDF)',
            description: `Generated Book #${executionId}`,
            // images: [],
          },
          unit_amount: 399000, // 3990 HUF
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${origin}/executions/${executionId}?success=true`,
    cancel_url: `${origin}/executions/${executionId}?canceled=true`,
    client_reference_id: executionId,
    metadata: {
      executionId: executionId,
      userEmail: session.user.email
    }
  })

  // Update DB
  await sql`
    UPDATE executions
    SET stripe_session_id = ${checkoutSession.id}
    WHERE n8n_execution_id = ${executionId}
  `

  return { url: checkoutSession.url }
})
