import Stripe from 'stripe'
import { sql } from '../utils/db'
import { useExpresta } from '../utils/expresta'

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
  const printingOptions = body.printingOptions
  const billingAddress = body.billingAddress
  const shippingAddress = body.shippingAddress

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

  let priceAmount = 399000 // Base PDF Price (HUF * 100)
  let productName = 'Verseskötet (PDF)'
  let description = `Generated Book #${executionId}`

  if (printingOptions && printingOptions.mode === 'print') {
    const { calculatePrice } = useExpresta()
    const { details } = printingOptions
    
    if (details && details.paperId && details.copies) {
      try {
        const priceRes = await calculatePrice({
          paperId: details.paperId,
          copies: details.copies,
          pageCount: 50 
        })
        
        priceAmount = Math.round(priceRes.grossAmount * 100)
        productName = `Verseskötet (Nyomtatott + PDF)`
        description = `${details.copies} példány, ${details.paperName || 'Papír'}`
      } catch (e) {
        console.error('Price calculation failed', e)
        throw createError({ statusCode: 500, statusMessage: 'Price calculation failed' })
      }
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'huf',
          product_data: {
            name: productName,
            description: description,
          },
          unit_amount: priceAmount,
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
      userEmail: session.user.email,
      printingOptions: printingOptions ? JSON.stringify(printingOptions) : null
    }
  })

  // Update DB
  await sql`
    UPDATE executions
    SET 
      stripe_session_id = ${checkoutSession.id},
      billing_address = ${billingAddress ? JSON.stringify(billingAddress) : null},
      shipping_address = ${shippingAddress ? JSON.stringify(shippingAddress) : null},
      purchase_amount = ${priceAmount},
      purchase_options = ${printingOptions ? JSON.stringify(printingOptions) : null}
    WHERE n8n_execution_id = ${executionId}
  `

  return { url: checkoutSession.url }
})