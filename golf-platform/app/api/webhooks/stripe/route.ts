import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  // New subscription created via checkout
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any
    const userId = session?.metadata?.userId
    if (userId && session?.customer && session?.subscription) {
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan: session.metadata?.plan || 'monthly',
        status: 'active',
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      }, { onConflict: 'stripe_subscription_id' })
    }
  }

  // Subscription renewed — update period end + log charity contribution
  if (event.type === 'invoice.paid') {
    const invoice = event.data.object as any
    const periodEnd = invoice?.lines?.data?.[0]?.period?.end
    if (invoice?.subscription && periodEnd) {
      await supabase.from('subscriptions')
        .update({
          status: 'active',
          current_period_end: new Date(periodEnd * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', invoice?.subscription)

      // Log charity contribution
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', invoice?.subscription || '')
        .single()

      if (sub) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('charity_id, charity_percentage')
          .eq('id', sub.user_id)
          .single()

        if (profile?.charity_id) {
          const totalAmount = invoice.amount_paid / 100
          const charityAmount = totalAmount * (profile.charity_percentage / 100)
          await supabase.from('charity_contributions').insert({
            user_id: sub.user_id,
            charity_id: profile.charity_id,
            amount: charityAmount,
            subscription_amount: totalAmount,
            percentage: profile.charity_percentage,
            period_start: new Date((invoice?.period_start || 0) * 1000).toISOString(),
          })
        }
      }
    }
  }

  // Subscription cancelled
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as { id: string }
    await supabase.from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('stripe_subscription_id', sub.id)
  }

  // Payment failed — mark lapsed
  if (event.type === 'invoice.payment_failed') {
    const invoice = event.data.object as any
    if (invoice?.subscription) {
      await supabase.from('subscriptions')
        .update({ status: 'lapsed' })
        .eq('stripe_subscription_id', invoice?.subscription)
    }
  }

  return NextResponse.json({ received: true })
}
