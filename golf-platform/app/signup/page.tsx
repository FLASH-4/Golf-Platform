'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: signupError } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } }
    })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { setError('Checkout failed. Try again.'); setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <Link href="/" className="btn-ghost" style={{ marginBottom: '24px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          ← Home
        </Link>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div className="font-display" style={{ fontSize: '28px', marginBottom: '48px' }}>
            <span style={{ color: 'var(--lime)' }}>GOLF</span><span style={{ color: 'var(--white)' }}>DRAW</span>
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px' }}>
          {[1, 2].map(s => (
            <div key={s} style={{ height: '3px', flex: 1, borderRadius: '2px', background: s <= step ? 'var(--lime)' : 'var(--gray-3)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="font-display" style={{ fontSize: '48px', marginBottom: '8px' }}>CHOOSE PLAN</h1>
            <p style={{ color: 'var(--gray-5)', marginBottom: '40px' }}>Pick how you want to play.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {[
                { id: 'monthly', label: 'Monthly', price: '£10/month', desc: 'Flexible. Cancel anytime.' },
                { id: 'yearly', label: 'Yearly', price: '£100/year', desc: 'Save £20. Best value.' },
              ].map(p => (
                <div key={p.id} onClick={() => setPlan(p.id as 'monthly' | 'yearly')} style={{
                  border: `1px solid ${plan === p.id ? 'var(--lime)' : 'var(--gray-3)'}`,
                  padding: '20px 24px', borderRadius: '2px', cursor: 'pointer',
                  background: plan === p.id ? 'rgba(200,241,53,0.04)' : 'var(--gray-1)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s',
                }}>
                  <div>
                    <div style={{ fontWeight: 500, marginBottom: '4px' }}>{p.label}</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-5)' }}>{p.desc}</div>
                  </div>
                  <div className="font-display" style={{ fontSize: '24px', color: plan === p.id ? 'var(--lime)' : 'var(--white)' }}>{p.price}</div>
                </div>
              ))}
            </div>
            <button className="btn-lime" style={{ width: '100%', textAlign: 'center' }} onClick={() => setStep(2)}>Continue →</button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="font-display" style={{ fontSize: '48px', marginBottom: '8px' }}>CREATE ACCOUNT</h1>
            <p style={{ color: 'var(--gray-5)', marginBottom: '40px' }}>{plan === 'monthly' ? '£10/month' : '£100/year'} · Change anytime</p>
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--gray-5)', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>FULL NAME</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" required />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--gray-5)', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>EMAIL</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--gray-5)', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>PASSWORD</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" minLength={8} required />
              </div>
              {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '2px', padding: '12px 16px', fontSize: '14px', color: '#f87171' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                <button type="submit" className="btn-lime" disabled={loading} style={{ flex: 2, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Creating...' : 'Create & Pay'}
                </button>
              </div>
            </form>
          </>
        )}

        <div className="divider" />
        <p style={{ color: 'var(--gray-5)', fontSize: '14px', textAlign: 'center' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--lime)', textDecoration: 'none' }}>Sign in →</Link>
        </p>
      </div>
    </div>
  )
}