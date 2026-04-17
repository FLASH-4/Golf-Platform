'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Charity = { id: string; name: string }

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [charityId, setCharityId] = useState('')
  const [charityPct, setCharityPct] = useState(10)
  const [charities, setCharities] = useState<Charity[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.from('charities').select('id, name').eq('is_active', true).order('name').then(({ data }) => setCharities(data || []))
  }, [])

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { data, error: signupError } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: name } }
    })
    if (signupError) { setError(signupError.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: name,
        charity_id: charityId || null,
        charity_percentage: charityPct,
        role: 'user',
      })
    }
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const d = await res.json()
    if (d.url) window.location.href = d.url
    else { setError('Checkout failed. Please try again.'); setLoading(false) }
  }

  const steps = ['Plan', 'Charity', 'Account']

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <Link href="/" className="btn-ghost" style={{ marginBottom: '24px', display: 'block', width: 'fit-content' }}>
          ← Home
        </Link>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: '32px' }}>
          <span className="font-display" style={{ fontSize: '28px' }}>
            <span style={{ color: 'var(--lime)' }}>GOLF</span><span style={{ color: 'var(--white)' }}>DRAW</span>
          </span>
        </Link>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i + 1 <= step ? 'var(--lime)' : 'var(--gray-3)', transition: 'background 0.3s' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '40px' }}>
          {steps.map((s, i) => (
            <div key={s} style={{ flex: 1, fontSize: '11px', color: i + 1 <= step ? 'var(--lime)' : 'var(--gray-5)', letterSpacing: '0.08em' }}>{s.toUpperCase()}</div>
          ))}
        </div>

        {/* Step 1: Plan */}
        {step === 1 && (
          <>
            <h1 className="font-display" style={{ fontSize: '48px', marginBottom: '8px' }}>CHOOSE PLAN</h1>
            <p style={{ color: 'var(--gray-5)', marginBottom: '32px' }}>Pick how you want to subscribe.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
              {[
                { id: 'monthly', label: 'Monthly', price: '£10/month', desc: 'Flexible. Cancel anytime.' },
                { id: 'yearly', label: 'Yearly', price: '£100/year', desc: 'Save £20 — two months free.' },
              ].map(p => (
                <div key={p.id} onClick={() => setPlan(p.id as 'monthly' | 'yearly')} style={{ border: `1px solid ${plan === p.id ? 'var(--lime)' : 'var(--gray-3)'}`, padding: '20px 24px', borderRadius: '2px', cursor: 'pointer', background: plan === p.id ? 'rgba(200,241,53,0.04)' : 'var(--gray-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
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

        {/* Step 2: Charity */}
        {step === 2 && (
          <>
            <h1 className="font-display" style={{ fontSize: '48px', marginBottom: '8px' }}>YOUR CHARITY</h1>
            <p style={{ color: 'var(--gray-5)', marginBottom: '32px' }}>Who do you want to support? You can change this anytime.</p>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '11px', color: 'var(--gray-5)', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>SELECT CHARITY</label>
              <select className="input" value={charityId} onChange={e => setCharityId(e.target.value)}>
                <option value="">— Choose later —</option>
                {charities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '32px' }}>
              <label style={{ fontSize: '11px', color: 'var(--gray-5)', letterSpacing: '0.1em', display: 'block', marginBottom: '10px' }}>
                CONTRIBUTION: <span style={{ color: 'var(--lime)' }}>{charityPct}%</span> of subscription
              </label>
              <input type="range" min={10} max={50} value={charityPct} onChange={e => setCharityPct(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--lime)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--gray-5)', marginTop: '6px' }}>
                <span>10% min</span><span>50% max</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--gray-5)', marginTop: '10px' }}>
                ≈ <span style={{ color: 'var(--lime)' }}>£{((plan === 'yearly' ? 100 / 12 : 10) * charityPct / 100).toFixed(2)}</span>/month to charity
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
              <button type="button" className="btn-lime" style={{ flex: 2 }} onClick={() => setStep(3)}>Continue →</button>
            </div>
          </>
        )}

        {/* Step 3: Account */}
        {step === 3 && (
          <>
            <h1 className="font-display" style={{ fontSize: '48px', marginBottom: '8px' }}>CREATE ACCOUNT</h1>
            <p style={{ color: 'var(--gray-5)', marginBottom: '32px' }}>{plan === 'monthly' ? '£10/month' : '£100/year'} · {charityPct}% to charity</p>
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--gray-5)', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>FULL NAME</label>
                <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="John Smith" required />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--gray-5)', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>EMAIL</label>
                <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: 'var(--gray-5)', letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>PASSWORD</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" minLength={8} required />
              </div>
              {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '2px', padding: '12px 16px', fontSize: '14px', color: '#f87171' }}>{error}</div>}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(2)}>← Back</button>
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
