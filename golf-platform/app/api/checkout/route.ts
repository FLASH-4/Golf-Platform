import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await req.json()
  const priceId = plan === 'yearly'
    ? process.env.STRIPE_YEARLY_PRICE_ID!
    : process.env.STRIPE_MONTHLY_PRICE_ID!

  const { data: existingSub } = await supabase
    .from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle()

  const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId: user.id, plan },
  }

  if (existingSub?.stripe_customer_id) sessionParams.customer = existingSub.stripe_customer_id
  else sessionParams.customer_email = user.email

  const session = await stripe.checkout.sessions.create(sessionParams)
  return NextResponse.json({ url: session.url })
}
