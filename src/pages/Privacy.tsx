import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'
import { useTranslation } from 'react-i18next'

export function Privacy() {
  const { t } = useTranslation()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <article style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>Privacy Policy</h1>

          <p style={{ marginBottom: '16px' }}>
            <strong>Last Updated: 2026-10-08</strong>
          </p>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>1. Introduction</h2>
            <p>
              Cometest ("we," "us," "our," or "Company") operates the cometest.com portal and store.cometest.com platform
              (collectively, the "Services"). This Privacy Policy explains how we collect, use, disclose, and safeguard your
              information when you visit and use our Services.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>2. Information We Collect</h2>
            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px' }}>Automatically Collected Information:</h3>
            <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
              <li>IP Address and device identifiers</li>
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referral sources</li>
              <li>Click behavior and interactions</li>
            </ul>

            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px' }}>Cookies and Tracking Technologies:</h3>
            <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
              <li>Google Analytics cookies (analytics tracking)</li>
              <li>Google AdSense cookies (personalized advertising)</li>
              <li>Session cookies (user experience)</li>
              <li>Local storage (preferences and settings)</li>
            </ul>

            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px' }}>Information You Provide:</h3>
            <ul style={{ paddingLeft: '24px' }}>
              <li>Account credentials (email, password) on store.cometest.com</li>
              <li>Purchase and transaction information</li>
              <li>User preferences and game/simulation interaction data</li>
              <li>Contact form submissions</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>3. How We Use Your Information</h2>
            <ul style={{ paddingLeft: '24px' }}>
              <li>To provide, operate, and improve our Services</li>
              <li>To personalize your experience and deliver relevant content</li>
              <li>To process transactions and send related communications</li>
              <li>To display targeted advertising through Google AdSense</li>
              <li>To comply with legal obligations</li>
              <li>To monitor and analyze usage patterns and service performance</li>
              <li>To communicate updates, security alerts, and support messages</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>4. Third-Party Services</h2>
            <p>
              Our Services use Google Analytics and Google AdSense. These services collect information about your browsing
              behavior to provide insights and display personalized advertisements. Please review Google's privacy policies
              for more details on their data collection practices.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>5. GDPR and CCPA Compliance</h2>
            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px' }}>GDPR Rights (EU Users):</h3>
            <ul style={{ marginBottom: '16px', paddingLeft: '24px' }}>
              <li>Right to access your personal data</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to erasure ("right to be forgotten")</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>

            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px' }}>CCPA Rights (California Users):</h3>
            <ul style={{ paddingLeft: '24px' }}>
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of the sale or sharing of personal information</li>
              <li>Right to non-discrimination for exercising CCPA rights</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>6. Data Retention</h2>
            <p>
              We retain personal data only as long as necessary to fulfill the purposes outlined in this Privacy Policy
              or as required by law. Analytical data may be retained for up to 26 months. User account data is retained
              until account deletion is requested.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>7. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information from unauthorized access,
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p style={{ marginTop: '12px' }}>
              <strong>Email:</strong> privacy@cometest.com<br />
              <strong>Postal Address:</strong> Cometest Inc., Contact information available upon request.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>9. Changes to This Policy</h2>
            <p>
              We reserve the right to update this Privacy Policy at any time. Changes will be effective immediately upon
              posting to the Services. Your continued use of the Services constitutes acceptance of the updated Privacy Policy.
            </p>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
