import Link from 'next/link'
import Navbar from '@/components/shared/navbar'

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <div style={{ minHeight: '100vh', padding: '60px 20px', background: 'var(--black)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <h1 className="font-display" style={{ fontSize: '56px', marginBottom: '16px' }}>
              Simple, transparent <span style={{ color: 'var(--lime)' }}>pricing</span>
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--gray-5)', marginBottom: '32px' }}>
              Pick a plan and start winning. Support your favourite charity every month.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', marginBottom: '60px' }}>
            {/* Monthly Plan */}
            <div className="card" style={{ padding: '40px', border: '1px solid var(--gray-3)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 className="font-display" style={{ fontSize: '24px', marginBottom: '8px' }}>Monthly</h3>
                <p style={{ color: 'var(--gray-5)', fontSize: '14px', marginBottom: '24px' }}>Perfect for casual players</p>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--lime)' }}>£10</span>
                  </div>
                  <p style={{ color: 'var(--gray-5)', fontSize: '14px' }}>per month, cancel anytime</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--lime)' }}>✓</span>
                    <span>Enter 5 latest golf scores</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--lime)' }}>✓</span>
                    <span>Automatic entry in monthly draws</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--lime)' }}>✓</span>
                    <span>Support your chosen charity</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--lime)' }}>✓</span>
                    <span>Win cash prizes & rollover jackpots</span>
                  </div>
                </div>
              </div>
              <Link href="/signup?plan=monthly" className="btn-lime" style={{ textAlign: 'center', padding: '12px 24px', display: 'block', textDecoration: 'none' }}>
                Get Started
              </Link>
            </div>

            {/* Yearly Plan */}
            <div className="card" style={{ padding: '40px', border: '2px solid var(--lime)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '20px', background: 'var(--lime)', color: 'var(--black)', padding: '4px 12px', borderRadius: '2px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em' }}>
                BEST VALUE
              </div>
              <div>
                <h3 className="font-display" style={{ fontSize: '24px', marginBottom: '8px' }}>Yearly</h3>
                <p style={{ color: 'var(--gray-5)', fontSize: '14px', marginBottom: '24px' }}>For serious players</p>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--lime)' }}>£100</span>
                  </div>
                  <p style={{ color: 'var(--gray-5)', fontSize: '14px' }}>per year (save £20)</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--lime)' }}>✓</span>
                    <span>Enter 5 latest golf scores</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--lime)' }}>✓</span>
                    <span>Automatic entry in all 12 draws</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--lime)' }}>✓</span>
                    <span>Support your chosen charity</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ color: 'var(--lime)' }}>✓</span>
                    <span>Win cash prizes & rollover jackpots</span>
                  </div>
                </div>
              </div>
              <Link href="/signup?plan=yearly" className="btn-lime" style={{ textAlign: 'center', padding: '12px 24px', display: 'block', textDecoration: 'none' }}>
                Get Started
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: '600px', margin: '0 auto', marginTop: '80px', borderTop: '1px solid var(--gray-3)', paddingTop: '60px' }}>
            <h2 className="font-display" style={{ fontSize: '32px', marginBottom: '40px', textAlign: 'center' }}>FAQs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h4 className="font-display" style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--lime)' }}>Can I change my plan?</h4>
                <p style={{ color: 'var(--gray-5)', fontSize: '14px' }}>Yes, you can upgrade from monthly to yearly at any time. Downgrading will be available after your current period ends.</p>
              </div>
              <div>
                <h4 className="font-display" style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--lime)' }}>What if I cancel?</h4>
                <p style={{ color: 'var(--gray-5)', fontSize: '14px' }}>You'll have access until the end of your billing period. No refunds, but no further charges either.</p>
              </div>
              <div>
                <h4 className="font-display" style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--lime)' }}>How is my charity allocated?</h4>
                <p style={{ color: 'var(--gray-5)', fontSize: '14px' }}>10-25% of your subscription goes to your chosen charity each month. You select the percentage during signup.</p>
              </div>
              <div>
                <h4 className="font-display" style={{ fontSize: '16px', marginBottom: '8px', color: 'var(--lime)' }}>Are there taxes?</h4>
                <p style={{ color: 'var(--gray-5)', fontSize: '14px' }}>Prices shown are before VAT. VAT will be added at checkout based on your location.</p>
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '60px', paddingTop: '60px', borderTop: '1px solid var(--gray-3)' }}>
            <p style={{ color: 'var(--gray-5)', marginBottom: '16px' }}>Questions? Contact support</p>
            <Link href="/" className="btn-ghost" style={{ display: 'inline-block' }}>
              ← Back home
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
