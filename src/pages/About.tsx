import { Header } from '../components/Header'
import { SiteFooter } from '../components/SiteFooter'
import { useNavigate } from 'react-router-dom'

export function About() {
  const navigate = useNavigate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />

      <main style={{ flex: 1, padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <article style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '24px' }}>About Cometest Portal</h1>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>🎯 Our Mission</h2>
            <p>
              Cometest is dedicated to making interactive 3D simulations and web-based educational games accessible to learners
              worldwide. We believe that immersive, hands-on experiences accelerate learning and engagement in STEM (Science,
              Technology, Engineering, Mathematics) and creative fields.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>📚 What We Offer</h2>

            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px', marginTop: '16px' }}>
              Main Portal (cometest.com)
            </h3>
            <p>
              A free, browser-based platform featuring premium 3D simulations and interactive web games across multiple domains:
            </p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li><strong>Physics & Chemistry Labs:</strong> Interactive simulations for fluid dynamics, cloth physics, state of matter, and combustion principles</li>
              <li><strong>Astronomy & Space:</strong> Explore the solar system, lunar phases, and cosmic phenomena in 3D environments</li>
              <li><strong>Web Games & Puzzles:</strong> Engaging casual games with unique themes, ranging from gravity-defying platformers to dimensional puzzles</li>
              <li><strong>Occult Mystery Worldbuilding:</strong> All content is themed around creative occult/sci-fi narratives to enhance storytelling and immersion</li>
            </ul>

            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px', marginTop: '16px' }}>
              Digital Asset Store (store.cometest.com)
            </h3>
            <p>
              A curated marketplace for 3D models, textures, animations, and digital assets designed for game developers,
              educators, and creative professionals:
            </p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li>High-quality 3D models optimized for game engines (Unity, Unreal, Godot)</li>
              <li>PBR textures and material libraries</li>
              <li>Pre-built animations and particle effects</li>
              <li>Flexible licensing options for indie developers, commercial studios, and educators</li>
              <li>Secure purchase and download system with instant digital delivery</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>🔧 Technology Stack</h2>
            <p>
              Cometest leverages cutting-edge web technologies to deliver seamless 3D experiences directly in the browser:
            </p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li><strong>React & TypeScript:</strong> Modern, type-safe frontend framework</li>
              <li><strong>Three.js:</strong> Powerful 3D graphics library for WebGL rendering</li>
              <li><strong>Vite:</strong> Lightning-fast build tooling and development server</li>
              <li><strong>Vercel:</strong> Global CDN and serverless deployment infrastructure</li>
              <li><strong>i18n:</strong> Multi-language support for global accessibility</li>
              <li><strong>Groq & AI Integration:</strong> Intelligent content classification and recommendations</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>👥 Our Audience</h2>
            <ul style={{ paddingLeft: '24px' }}>
              <li><strong>Students:</strong> STEM learners seeking interactive educational experiences</li>
              <li><strong>Educators:</strong> Teachers and instructors looking for engaging classroom tools</li>
              <li><strong>Game Developers:</strong> Indie and studio creators seeking high-quality 3D assets</li>
              <li><strong>Researchers:</strong> Scientists and academics using simulations for experimentation</li>
              <li><strong>Creative Professionals:</strong> Designers and artists sourcing inspiration and digital resources</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>🌍 Global Reach</h2>
            <p>
              Cometest is available in multiple languages and regions. Our platform is accessible worldwide, with optimized
              performance through a global CDN and localized content delivery. We support:
            </p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li>10+ language translations</li>
              <li>Region-specific payment processing</li>
              <li>GDPR and CCPA compliance</li>
              <li>Accessibility standards (WCAG 2.1)</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>📈 Content Quality & Curation</h2>
            <p>
              Every simulation, game, and asset on Cometest is carefully curated and tested for:
            </p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li>Educational accuracy and scientific rigor</li>
              <li>Technical performance and optimization</li>
              <li>User experience and interface clarity</li>
              <li>Browser compatibility and responsiveness</li>
              <li>Accessibility compliance</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>🔐 Trust & Security</h2>
            <p>
              We prioritize user privacy, data security, and transparent operations:
            </p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li>GDPR-compliant data handling</li>
              <li>Encrypted payment processing</li>
              <li>Regular security audits</li>
              <li>Transparent privacy and terms policies</li>
              <li>No third-party data selling or unauthorized tracking</li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>📞 Contact & Support</h2>
            <p>
              Have questions or feedback? We'd love to hear from you:
            </p>
            <p style={{ marginTop: '16px' }}>
              <strong>Email:</strong> support@cometest.com<br />
              <strong>Website:</strong> cometest.com<br />
              <strong>Store:</strong> store.cometest.com<br />
              <strong>Response Time:</strong> We aim to respond to all inquiries within 24-48 hours
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>🏛️ Archive & Attribution</h2>

            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px', marginTop: '16px' }}>
              PhET Interactive Simulations
            </h3>
            <p>
              Cometest features physics and chemistry simulations developed by <strong>PhET Interactive Simulations</strong>,
              a project of the <strong>University of Colorado Boulder</strong>. These simulations are provided under the
              <strong> Creative Commons Attribution 4.0 (CC BY 4.0) license</strong> and are used for educational purposes only.
            </p>
            <ul style={{ marginTop: '8px', paddingLeft: '24px' }}>
              <li>Source: <a href="https://phet.colorado.edu/" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>PhET Colorado</a></li>
              <li>License: Creative Commons BY 4.0</li>
              <li>Usage: Educational simulations for interactive learning</li>
            </ul>

            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px', marginTop: '16px' }}>
              Web Games & js13kGames Community
            </h3>
            <p>
              Our web games collection is curated from the <strong>js13kGames</strong> community archive and independent game developers.
              js13kGames is an annual JavaScript programming competition where developers create games in 13KB or less.
            </p>
            <ul style={{ marginTop: '8px', paddingLeft: '24px' }}>
              <li>Source: <a href="https://js13kgames.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'none' }}>js13kGames</a></li>
              <li>Archive Type: Community-curated game collection</li>
              <li>Original Creators: Credited per individual game entries</li>
              <li>Usage: Personal and educational use</li>
            </ul>

            <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '12px', marginTop: '16px' }}>
              Archive & Non-Commercial Notice
            </h3>
            <p>
              <strong>Cometest Portal is an educational game and simulation archive</strong> operated for the public benefit.
              All content is curated and provided for:
            </p>
            <ul style={{ marginTop: '8px', paddingLeft: '24px' }}>
              <li>✅ Educational use by students and teachers</li>
              <li>✅ Personal entertainment and casual play</li>
              <li>✅ Learning through interactive simulation</li>
              <li>✅ Game development inspiration and study</li>
            </ul>
            <p style={{ marginTop: '16px', fontWeight: '500', color: '#d9534f' }}>
              ❌ Commercial reproduction or redistribution of content without permission is strictly prohibited.
            </p>
          </section>

          <section style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>📋 Legal & Compliance</h2>
            <p>
              For more information about how we handle your data and our terms of use, please review:
            </p>
            <ul style={{ marginTop: '12px', paddingLeft: '24px' }}>
              <li><a href="/privacy" style={{ color: '#007bff', textDecoration: 'none' }}>Privacy Policy</a></li>
              <li><a href="/terms" style={{ color: '#007bff', textDecoration: 'none' }}>Terms of Service</a></li>
            </ul>
          </section>

          <section style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>Ready to Explore?</h2>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
              >
                Explore Portal
              </button>
              <button
                onClick={() => window.open('https://store.cometest.com', '_blank')}
                style={{
                  padding: '12px 32px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#218838')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#28a745')}
              >
                Visit Asset Store
              </button>
            </div>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
