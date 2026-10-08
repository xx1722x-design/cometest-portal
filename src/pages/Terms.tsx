import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'
import { useTranslation } from 'react-i18next'

export function Terms() {
  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <article style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>Terms of Service</h1>

          <p style={{ marginBottom: '16px' }}>
            <strong>Last Updated: 2026-10-08</strong>
          </p>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>1. Acceptance of Terms</h2>
            <p>
              By accessing and using cometest.com and store.cometest.com (collectively, the "Services"), you accept and
              agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please
              do not use this service.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>2. Services Description</h2>
            <p>
              Cometest provides an interactive 3D simulation and web game portal offering educational and entertainment
              experiences, as well as a digital 3D asset store for game developers and creators. Services include:
            </p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li>Interactive physics, chemistry, and astronomy simulations</li>
              <li>Web-based games and puzzle experiences</li>
              <li>3D models, textures, and digital assets for purchase</li>
              <li>User accounts and purchase history (on store.cometest.com)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>3. User Responsibilities</h2>
            <p>You agree to use the Services only for lawful purposes and in a way that does not infringe upon the rights
              of others or restrict their use and enjoyment of the Services. Specifically, you agree to abstain from:</p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li>Harassing or causing distress or inconvenience to any person</li>
              <li>Obscene or offensive language</li>
              <li>Disrupting normal flow of dialogue or interaction</li>
              <li>Attempting to gain unauthorized access to systems</li>
              <li>Reverse engineering, modifying, or copying proprietary software without permission</li>
              <li>Redistribution of downloaded digital assets beyond permitted license terms</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>4. Intellectual Property Rights</h2>
            <p>
              All content, including but not limited to text, graphics, logos, images, games, simulations, and 3D models
              provided on the Services, are the exclusive property of Cometest or its content suppliers and are protected by
              international copyright laws.
            </p>
            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px', marginTop: '16px' }}>Portal Content License:</h3>
            <p>
              Games and simulations on cometest.com are licensed for personal, non-commercial use only. Reproduction,
              distribution, or commercial use without explicit written permission is prohibited.
            </p>
            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px', marginTop: '16px' }}>Store Asset License:</h3>
            <p>
              Digital 3D assets purchased on store.cometest.com are provided under specific license terms outlined at purchase.
              Licensees may use assets in game development, educational projects, and commercial products (unless otherwise
              specified). Resale or redistribution of assets is prohibited unless explicitly permitted by the license.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>5. Digital Asset Purchases & Delivery</h2>
            <p>
              Digital 3D assets purchased through store.cometest.com are delivered immediately upon payment confirmation.
              Refunds are subject to the store's refund policy. Assets are non-refundable after download.
            </p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li>Payment processing via secure third-party providers</li>
              <li>License verification and activation upon purchase</li>
              <li>Automatic download links provided via email and account portal</li>
              <li>Customer support available for license and download issues</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>6. Warranty Disclaimer</h2>
            <p>
              The Services are provided "AS IS" without warranty of any kind, express or implied, including but not limited to
              the warranties of merchantability, fitness for a particular purpose, and non-infringement. Cometest does not
              warrant that the Services will be uninterrupted, error-free, or free from viruses or other harmful components.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Cometest shall not be liable for any direct, indirect, incidental,
              special, consequential, or punitive damages resulting from your access to, use of, or inability to use the
              Services, even if advised of the possibility of such damages.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>8. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Cometest, its officers, directors, employees, and agents from any
              claims, damages, losses, liabilities, and expenses arising from your violation of this Terms of Service or
              your use of the Services.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>9. Modification of Terms</h2>
            <p>
              Cometest reserves the right to modify this Terms of Service at any time. Changes become effective immediately
              upon posting. Continued use of the Services constitutes acceptance of the modified Terms of Service.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>10. Termination</h2>
            <p>
              Cometest may terminate or suspend access to the Services at any time, without notice, for any reason, including
              but not limited to a breach of the Terms of Service. Upon termination, your right to use the Services will
              immediately cease.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>11. Governing Law</h2>
            <p>
              These Terms of Service are governed by and construed in accordance with the laws of the jurisdiction in which
              Cometest is incorporated, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>12. Contact Information</h2>
            <p>
              For questions or concerns regarding these Terms of Service, please contact us at:
            </p>
            <p style={{ marginTop: '12px' }}>
              <strong>Email:</strong> legal@cometest.com<br />
              <strong>Postal Address:</strong> Cometest Inc., Contact information available upon request.
            </p>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
