'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Score = { id: string; score: number; score_date: string }
type Profile = { full_name: string; email: string; charity_percentage: number }
type Subscription = { plan: string; status: string; current_period_end: string }

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [scores, setScores] = useState<Score[]>([])
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0])
  const [scoreError, setScoreError] = useState('')
  const [activeTab, setActiveTab] = useState<'overview' | 'scores' | 'draws'>('overview')
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const [{ data: prof }, { data: sub }, { data: sc }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
        supabase.from('golf_scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }),
      ])
      setProfile(prof)
      setSubscription(sub)
      setScores(sc || [])
    }
    load()
  }, [router])

  async function addScore(e: React.FormEvent) {
    e.preventDefault()
    setScoreError('')
    const val = parseInt(newScore)
    if (isNaN(val) || val < 1 || val > 45) { setScoreError('Score must be between 1 and 45'); return }
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('golf_scores').upsert(
      { user_id: user!.id, score: val, score_date: newDate },
      { onConflict: 'user_id,score_date' }
    )
    if (error) { setScoreError(error.message); return }
    const { data: sc } = await supabase.from('golf_scores').select('*').eq('user_id', user!.id).order('score_date', { ascending: false })
    setScores(sc || [])
    setNewScore('')
  }

  async function deleteScore(id: string) {
    const supabase = createClient()
    await supabase.from('golf_scores').delete().eq('id', id)
    setScores(prev => prev.filter(s => s.id !== id))
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      {/* Sidebar */}
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px',
        background: 'var(--gray-1)', borderRight: '1px solid var(--gray-3)',
        display: 'flex', flexDirection: 'column', padding: '32px 0', zIndex: 50,
      }}>
        <div style={{ padding: '0 24px', marginBottom: '48px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="font-display" style={{ fontSize: '22px' }}>
              <span style={{ color: 'var(--lime)' }}>GOLF</span><span style={{ color: 'var(--white)' }}>DRAW</span>
            </span>
          </Link>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px' }}>
          {(['overview', 'scores', 'draws'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? 'rgba(200,241,53,0.08)' : 'transparent',
              border: 'none', borderRadius: '2px',
              color: activeTab === tab ? 'var(--lime)' : 'var(--gray-5)',
              padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
              fontSize: '14px', fontFamily: 'DM Sans, sans-serif',
              textTransform: 'capitalize', transition: 'all 0.2s',
              borderLeft: activeTab === tab ? '2px solid var(--lime)' : '2px solid transparent',
            }}>
              {tab === 'overview' ? '▪ Overview' : tab === 'scores' ? '▪ Scores' : '▪ Draws'}
            </button>
          ))}
        </nav>
        <div style={{ padding: '0 12px' }}>
          <div style={{ padding: '16px 12px', borderTop: '1px solid var(--gray-3)', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--white)', fontWeight: 500, marginBottom: '2px' }}>{profile?.full_name || '—'}</div>
            <div style={{ fontSize: '12px', color: 'var(--gray-5)' }}>{profile?.email}</div>
          </div>
          <button onClick={signOut} style={{
            background: 'transparent', border: 'none', color: 'var(--gray-5)',
            fontSize: '13px', cursor: 'pointer', padding: '8px 12px', width: '100%',
            textAlign: 'left', fontFamily: 'DM Sans, sans-serif',
          }}>Sign out →</button>
        </div>
      </div>

      {/* Main */}
      <div style={{ marginLeft: '240px', padding: '48px' }}>

        {activeTab === 'overview' && (
          <>
            <h1 className="font-display" style={{ fontSize: '48px', marginBottom: '8px' }}>
              WELCOME BACK{profile?.full_name ? `, ${profile.full_name.split(' ')[0].toUpperCase()}` : ''}
            </h1>
            <p style={{ color: 'var(--gray-5)', marginBottom: '40px' }}>Here's your platform overview.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              {[
                { label: 'Subscription', value: subscription?.plan === 'yearly' ? 'Yearly' : 'Monthly', sub: subscription?.status || '—' },
                { label: 'Scores logged', value: `${scores.length}/5`, sub: 'Rolling window' },
                { label: 'Charity share', value: `${profile?.charity_percentage || 10}%`, sub: 'Of subscription' },
                { label: 'Renewal', value: subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—', sub: 'Auto-renews' },
              ].map(card => (
                <div key={card.label} className="card">
                  <div style={{ fontSize: '12px', color: 'var(--gray-5)', letterSpacing: '0.1em', marginBottom: '12px' }}>{card.label.toUpperCase()}</div>
                  <div className="font-display" style={{ fontSize: '36px', color: 'var(--lime)', lineHeight: 1, marginBottom: '8px' }}>{card.value}</div>
                  <div style={{ fontSize: '13px', color: 'var(--gray-5)' }}>{card.sub}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <h3 className="font-display" style={{ fontSize: '24px', marginBottom: '20px' }}>QUICK SCORE ENTRY</h3>
              <form onSubmit={addScore} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input className="input" type="number" min={1} max={45} value={newScore} onChange={e => setNewScore(e.target.value)} placeholder="Score (1–45)" style={{ flex: '0 0 160px' }} required />
                <input className="input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ flex: '0 0 180px' }} required />
                <button type="submit" className="btn-lime" style={{ padding: '12px 28px' }}>Add score</button>
              </form>
              {scoreError && <p style={{ color: '#f87171', fontSize: '13px', marginTop: '8px' }}>{scoreError}</p>}
            </div>
          </>
        )}

        {activeTab === 'scores' && (
          <>
            <h1 className="font-display" style={{ fontSize: '48px', marginBottom: '8px' }}>YOUR SCORES</h1>
            <p style={{ color: 'var(--gray-5)', marginBottom: '32px' }}>Last 5 Stableford scores. Oldest auto-replaced on 6th entry.</p>
            <div className="card" style={{ marginBottom: '24px' }}>
              <form onSubmit={addScore} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input className="input" type="number" min={1} max={45} value={newScore} onChange={e => setNewScore(e.target.value)} placeholder="Score (1–45)" style={{ flex: '0 0 160px' }} required />
                <input className="input" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} style={{ flex: '0 0 180px' }} required />
                <button type="submit" className="btn-lime" style={{ padding: '12px 28px' }}>Add score</button>
              </form>
              {scoreError && <p style={{ color: '#f87171', fontSize: '13px', marginTop: '8px' }}>{scoreError}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {scores.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-5)' }}>
                  <div className="font-display" style={{ fontSize: '48px', color: 'var(--gray-3)', marginBottom: '16px' }}>NO SCORES YET</div>
                  <p>Add your first Stableford score above.</p>
                </div>
              )}
              {scores.map((s, i) => (
                <div key={s.id} style={{
                  background: 'var(--gray-1)', border: '1px solid var(--gray-3)', borderRadius: '2px',
                  padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--gray-5)', fontFamily: 'DM Mono, monospace' }}>#{i + 1}</span>
                    <span className="score-badge">{s.score}</span>
                    <span style={{ color: 'var(--gray-5)', fontSize: '14px' }}>
                      {new Date(s.score_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <button onClick={() => deleteScore(s.id)} style={{
                    background: 'transparent', border: '1px solid var(--gray-3)', color: 'var(--gray-5)',
                    padding: '6px 14px', borderRadius: '2px', cursor: 'pointer', fontSize: '12px',
                    fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#f87171'; e.currentTarget.style.color = '#f87171' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gray-3)'; e.currentTarget.style.color = 'var(--gray-5)' }}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'draws' && (
          <>
            <h1 className="font-display" style={{ fontSize: '48px', marginBottom: '8px' }}>DRAWS</h1>
            <p style={{ color: 'var(--gray-5)', marginBottom: '40px' }}>Monthly draws based on your Stableford scores.</p>
            <div style={{ textAlign: 'center', padding: '80px 40px', border: '1px solid var(--gray-3)', borderRadius: '2px' }}>
              <div className="font-display" style={{ fontSize: '64px', color: 'var(--gray-3)', marginBottom: '16px' }}>NEXT DRAW</div>
              <p style={{ color: 'var(--gray-5)', marginBottom: '32px' }}>No draws published yet. Check back soon.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                {scores.map(s => <div key={s.id} className="score-badge" style={{ fontSize: '24px' }}>{s.score}</div>)}
              </div>
              {scores.length > 0 && <p style={{ color: 'var(--gray-5)', fontSize: '13px', marginTop: '12px' }}>Your current draw numbers</p>}
            </div>
          </>
        )}
      </div>
    </div>
  )
}