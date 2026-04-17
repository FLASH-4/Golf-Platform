'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { generateWinningNumbers, calculatePools } from '@/lib/draw-engine'

type User = { id: string; full_name: string; email: string; role: string; created_at: string }
type Draw = { id: string; draw_date: string; status: string; winning_numbers: number[] | null; jackpot_amount: number }

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [draws, setDraws] = useState<Draw[]>([])
  const [activeTab, setActiveTab] = useState<'users' | 'draws' | 'analytics'>('users')
  const [drawMode, setDrawMode] = useState<'random' | 'weighted'>('random')
  const [simResult, setSimResult] = useState<number[] | null>(null)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: prof } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (prof?.role !== 'admin') { router.push('/dashboard'); return }
      const [{ data: u }, { data: d }] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('draws').select('*').order('draw_date', { ascending: false }),
      ])
      setUsers(u || [])
      setDraws(d || [])
      setTotalRevenue((u?.length || 0) * 10)
    }
    load()
  }, [router])

  function simulateDraw() {
    setSimResult(generateWinningNumbers(drawMode))
  }

  async function publishDraw() {
    if (!simResult) return
    const supabase = createClient()
    const pools = calculatePools(totalRevenue)
    await supabase.from('draws').insert({
      draw_date: new Date().toISOString().split('T')[0],
      status: 'published', draw_type: drawMode,
      winning_numbers: simResult,
      jackpot_amount: pools.jackpot,
      pool_4match: pools.fourMatch,
      pool_3match: pools.threeMatch,
    })
    setSimResult(null)
    const { data: d } = await supabase.from('draws').select('*').order('draw_date', { ascending: false })
    setDraws(d || [])
  }

  const pools = calculatePools(totalRevenue)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--black)' }}>
      <div style={{
        position: 'fixed', left: 0, top: 0, bottom: 0, width: '240px',
        background: 'var(--gray-1)', borderRight: '1px solid var(--gray-3)',
        display: 'flex', flexDirection: 'column', padding: '32px 0', zIndex: 50,
      }}>
        <div style={{ padding: '0 24px', marginBottom: '16px' }}>
          <span className="font-display" style={{ fontSize: '22px' }}>
            <span style={{ color: 'var(--lime)' }}>GOLF</span><span style={{ color: 'var(--white)' }}>DRAW</span>
          </span>
          <div style={{ fontSize: '11px', color: 'var(--gray-5)', marginTop: '4px', letterSpacing: '0.1em' }}>ADMIN PANEL</div>
        </div>
        <div style={{ height: '1px', background: 'var(--gray-3)', margin: '16px 0' }} />
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 12px' }}>
          {([['users', '▪ Users'], ['draws', '▪ Draws'], ['analytics', '▪ Analytics']] as const).map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id)} style={{
              background: activeTab === id ? 'rgba(200,241,53,0.08)' : 'transparent',
              border: 'none', borderRadius: '2px',
              color: activeTab === id ? 'var(--lime)' : 'var(--gray-5)',
              padding: '10px 12px', textAlign: 'left', cursor: 'pointer',
              fontSize: '14px', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
              borderLeft: activeTab === id ? '2px solid var(--lime)' : '2px solid transparent',
            }}>{label}</button>
          ))}
        </nav>
      </div>

      <div style={{ marginLeft: '240px', padding: '48px' }}>

        {activeTab === 'users' && (
          <>
            <h1 className="font-display" style={{ fontSize: '48px', marginBottom: '8px' }}>USERS</h1>
            <p style={{ color: 'var(--gray-5)', marginBottom: '40px' }}>{users.length} total members</p>
            <div style={{ background: 'var(--gray-1)', border: '1px solid var(--gray-3)', borderRadius: '4px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--gray-3)' }}>
                    {['Name', 'Email', 'Role', 'Joined'].map(h => (
                      <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', color: 'var(--gray-5)', letterSpacing: '0.1em', fontWeight: 400, fontFamily: 'DM Mono, monospace' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid var(--gray-2)' : 'none' }}>
                      <td style={{ padding: '14px 20px', fontSize: '14px' }}>{u.full_name || '—'}</td>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--gray-5)', fontFamily: 'DM Mono, monospace' }}>{u.email}</td>
                      <td style={{ padding: '14px 20px' }}><span className={`pill ${u.role === 'admin' ? 'pill-pending' : 'pill-active'}`}>{u.role}</span></td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--gray-5)', fontFamily: 'DM Mono, monospace' }}>{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-5)' }}>No users yet.</div>}
            </div>
          </>
        )}

        {activeTab === 'draws' && (
          <>
            <h1 className="font-display" style={{ fontSize: '48px', marginBottom: '40px' }}>DRAW ENGINE</h1>
            <div className="card" style={{ marginBottom: '32px' }}>
              <h3 className="font-display" style={{ fontSize: '22px', marginBottom: '20px' }}>RUN A DRAW</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {(['random', 'weighted'] as const).map(m => (
                  <button key={m} onClick={() => setDrawMode(m)} style={{
                    background: drawMode === m ? 'rgba(200,241,53,0.1)' : 'transparent',
                    border: `1px solid ${drawMode === m ? 'var(--lime)' : 'var(--gray-3)'}`,
                    color: drawMode === m ? 'var(--lime)' : 'var(--gray-5)',
                    padding: '10px 24px', borderRadius: '2px', cursor: 'pointer',
                    fontSize: '14px', fontFamily: 'DM Sans, sans-serif', textTransform: 'capitalize', transition: 'all 0.2s',
                  }}>{m}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn-ghost" onClick={simulateDraw}>Simulate draw</button>
                {simResult && <button className="btn-lime" onClick={publishDraw}>Publish result</button>}
              </div>
              {simResult && (
                <div style={{ marginTop: '24px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--gray-5)', marginBottom: '12px', letterSpacing: '0.1em' }}>SIMULATED WINNING NUMBERS</div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {simResult.map(n => <div key={n} className="score-badge" style={{ fontSize: '28px', padding: '14px 20px' }}>{n}</div>)}
                  </div>
                </div>
              )}
            </div>
            <h3 className="font-display" style={{ fontSize: '22px', marginBottom: '16px' }}>DRAW HISTORY</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {draws.length === 0 && <p style={{ color: 'var(--gray-5)' }}>No draws published yet.</p>}
              {draws.map(d => (
                <div key={d.id} style={{
                  background: 'var(--gray-1)', border: '1px solid var(--gray-3)', borderRadius: '2px',
                  padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <span style={{ color: 'var(--gray-5)', fontFamily: 'DM Mono, monospace', fontSize: '13px' }}>{d.draw_date}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {d.winning_numbers?.map(n => <span key={n} className="score-badge" style={{ fontSize: '16px', padding: '6px 10px' }}>{n}</span>)}
                    </div>
                  </div>
                  <span className="pill pill-active">{d.status}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            <h1 className="font-display" style={{ fontSize: '48px', marginBottom: '40px' }}>ANALYTICS</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Total users', value: users.length },
                { label: 'Total draws', value: draws.length },
                { label: 'Est. monthly revenue', value: `£${totalRevenue}` },
                { label: 'Jackpot pool', value: `£${pools.jackpot.toFixed(0)}` },
                { label: '4-match pool', value: `£${pools.fourMatch.toFixed(0)}` },
                { label: '3-match pool', value: `£${pools.threeMatch.toFixed(0)}` },
              ].map(stat => (
                <div key={stat.label} className="card">
                  <div style={{ fontSize: '12px', color: 'var(--gray-5)', letterSpacing: '0.1em', marginBottom: '12px' }}>{stat.label.toUpperCase()}</div>
                  <div className="font-display" style={{ fontSize: '40px', color: 'var(--lime)', lineHeight: 1 }}>{stat.value}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}