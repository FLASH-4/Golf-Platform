import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { sessionId } = await req.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    const metadataUserId = session?.metadata?.userId
    const customerEmail = session?.customer_details?.email || session?.customer_email || null
    if (metadataUserId && metadataUserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!metadataUserId && customerEmail && user.email && customerEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!session.subscription) {
      return NextResponse.json({ error: 'No subscription in checkout session' }, { status: 400 })
    }

    let subObj: any
    if (typeof session.subscription === 'string') {
      subObj = await stripe.subscriptions.retrieve(session.subscription)
    } else {
      subObj = session.subscription
    }

    const stripeSubscriptionId = subObj.id as string
    const stripeCustomerId = typeof session.customer === 'string'
      ? session.customer
      : (session.customer as any)?.id || null

    const plan = (session?.metadata?.plan || 'monthly') as string
    const periodEnd = subObj.current_period_end
      ? new Date(subObj.current_period_end * 1000).toISOString()
      : new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 86400000).toISOString()

    const { error } = await supabase.from('subscriptions').upsert({
      user_id: user.id,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      plan,
      status: 'active',
      current_period_end: periodEnd,
    }, { onConflict: 'stripe_subscription_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected sync error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
