import Navbar from '@/components/shared/navbar'
import { createClient } from '@/lib/supabase/server'

export default async function CharitiesPage() {
  const supabase = await createClient()
  const { data: charities } = await supabase.from('charities').select('*').eq('is_active', true).order('is_featured', { ascending: false })

  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '100px', padding: '120px 40px 80px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '80px' }}>
          <div className="font-mono" style={{ fontSize: '11px', color: 'var(--lime)', letterSpacing: '0.2em', marginBottom: '16px' }}>CHARITY DIRECTORY</div>
          <h1 className="font-display" style={{ fontSize: 'clamp(48px, 7vw, 96px)', lineHeight: 1 }}>CAUSES<br />WE SUPPORT</h1>
        </div>
        {(!charities || charities.length === 0) && (
          <div style={{ textAlign: 'center', padding: '80px', color: 'var(--gray-5)' }}>
            <div className="font-display" style={{ fontSize: '48px', color: 'var(--gray-3)', marginBottom: '16px' }}>COMING SOON</div>
            <p>Charities will appear here once added by the admin.</p>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {charities?.map(c => (
            <div key={c.id} style={{
              background: 'var(--gray-1)', border: '1px solid var(--gray-3)',
              borderRadius: '4px', overflow: 'hidden', transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--lime)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--gray-3)')}>
              {c.image_url && (
                <div style={{ height: '180px', background: 'var(--gray-2)' }}>
                  <img src={c.image_url} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '24px' }}>
                {c.is_featured && <span className="pill pill-active" style={{ marginBottom: '12px', display: 'inline-block' }}>Featured</span>}
                <h3 className="font-display" style={{ fontSize: '24px', marginBottom: '10px' }}>{c.name.toUpperCase()}</h3>
                <p style={{ color: 'var(--gray-5)', fontSize: '14px', lineHeight: 1.6 }}>{c.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}