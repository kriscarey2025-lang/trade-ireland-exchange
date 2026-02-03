import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

export default function Privacy() {
  return (
    <>
      <SEO 
        title="Privacy Policy"
        description="Learn how Swap Skills protects your privacy and handles your personal data under GDPR and Irish data protection law."
        keywords="swap skills privacy, data protection Ireland, GDPR compliance, skill exchange privacy policy"
        url="https://swap-skills.com/privacy"
      />
      <div className="flex min-h-screen flex-col">
        <Header />
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold font-display mb-4">
                Privacy Policy
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: February 2026
              </p>

              <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Our Commitment to Your Privacy</h2>
                  <p className="text-muted-foreground">
                    At Swap-Skills, we believe in transparency and respect for your personal data. This Privacy Policy explains what information we collect, how we use it, and your rights under the General Data Protection Regulation (GDPR) and Irish data protection law. We are committed to protecting your privacy while helping you connect with your community.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
                  <p className="text-muted-foreground mb-3">
                    Swap-Skills is operated by Swap Skills Limited, an Irish private limited company with a registered office in Ireland. Swap Skills Limited is the data controller for personal data collected through our website and applications.
                  </p>
                  <p className="text-muted-foreground">
                    If you have any questions about this policy or how we handle your data, you can contact us at{' '}
                    <a href="mailto:privacy@swap-skills.com" className="text-primary hover:underline">privacy@swap-skills.com</a>{' '}
                    or via our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                  <h3 className="text-xl font-medium mb-3">Information you provide directly</h3>
                  <p className="text-muted-foreground mb-3">
                    We collect information you choose to provide, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li><strong>Account information:</strong> Name, email address, and password when you register</li>
                    <li><strong>Profile information:</strong> Location, bio, phone number (optional), and profile photo</li>
                    <li><strong>Listings:</strong> Details about skills and services you offer</li>
                    <li><strong>Messages:</strong> Communications you send to other users through the platform</li>
                  </ul>
                  <h3 className="text-xl font-medium mb-3">Information collected automatically</h3>
                  <p className="text-muted-foreground mb-3">
                    When you use Swap-Skills, we may also collect:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Device and browser information</li>
                    <li>IP address and general location</li>
                    <li>Usage data such as pages visited and features used</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                  <p className="text-muted-foreground mb-3">
                    We use your personal data to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Provide, operate, and improve the Swap-Skills platform</li>
                    <li>Enable you to connect and communicate with other users</li>
                    <li>Manage your account and send important service-related updates</li>
                    <li>Respond to your questions and support requests</li>
                    <li>Maintain platform safety, security, and prevent misuse</li>
                    <li>Display listings and advertisements within the platform</li>
                    <li>Comply with legal and regulatory obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Legal Basis for Processing</h2>
                  <p className="text-muted-foreground mb-3">
                    Under GDPR, we process personal data based on one or more of the following lawful bases:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Contractual necessity:</strong> To provide the Swap-Skills service</li>
                    <li><strong>Consent:</strong> For optional profile information and certain communications</li>
                    <li><strong>Legitimate interests:</strong> To operate, improve, and secure our platform</li>
                    <li><strong>Legal obligations:</strong> Where required by law</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Advertising and Analytics</h2>
                  <p className="text-muted-foreground mb-3">
                    Swap-Skills may display advertisements, listings, or promotions from local businesses or community members, including free or trial advertising periods.
                  </p>
                  <p className="text-muted-foreground mb-3">
                    We may also use analytics tools to understand how users interact with the platform so we can improve functionality and user experience. These tools may collect aggregated usage data such as page views, device type, and interaction patterns.
                  </p>
                  <p className="text-muted-foreground">
                    We do not sell your personal data to third parties.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Sharing Your Information</h2>
                  <p className="text-muted-foreground mb-3">
                    We share your information only in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>With other users:</strong> Information you choose to include in your profile or listings may be visible to other members. Contact details are shared only when you choose to share them.</li>
                    <li><strong>With service providers:</strong> Trusted third-party providers who help us operate and maintain the platform (such as hosting and infrastructure services).</li>
                    <li><strong>Legal requirements:</strong> Where disclosure is required to comply with legal obligations or enforce our terms.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Cookies</h2>
                  <p className="text-muted-foreground mb-3">
                    Swap-Skills uses cookies and similar technologies to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-3">
                    <li>Operate the platform</li>
                    <li>Keep users logged in</li>
                    <li>Understand how the service is used</li>
                  </ul>
                  <p className="text-muted-foreground">
                    You can control or disable cookies through your browser settings. Please note that some features may not function correctly without cookies.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
                  <p className="text-muted-foreground">
                    Some of our service providers may process personal data outside the European Economic Area (EEA). Where this occurs, we ensure appropriate safeguards are in place in accordance with GDPR requirements.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Identity Verification & Personal Data Processing</h2>
                  <p className="text-muted-foreground mb-3">
                    To promote trust, safety, and authenticity within the Swap-Skills community, we may 
                    request identity documents (such as a passport or driver's licence) for the sole 
                    purpose of verifying a user's identity.
                  </p>
                  <p className="text-muted-foreground mb-3 font-medium">
                    Swap-Skills Ltd. is not a financial or legal identity provider. Verification is 
                    used solely to increase community trust and safety.
                  </p>
                  
                  <h3 className="text-xl font-medium mb-3 mt-6">Purpose of Collection</h3>
                  <p className="text-muted-foreground mb-3">
                    Identity documents are collected exclusively to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Confirm the authenticity of user accounts</li>
                    <li>Reduce fraud, impersonation, and misuse of the platform</li>
                    <li>Maintain a trusted community environment</li>
                  </ul>
                  <p className="text-muted-foreground">
                    We do not use identity documents for marketing, profiling, or any other purpose.
                  </p>
                  
                  <h3 className="text-xl font-medium mb-3 mt-6">Data Retention for Identity Documents</h3>
                  <p className="text-muted-foreground mb-3">
                    Identity documents are:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Securely reviewed for verification purposes only</li>
                    <li>Permanently deleted once the user's verification status has been completed and recorded</li>
                  </ul>
                  <p className="text-muted-foreground mb-3">
                    Swap-Skills retains only:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>A verification status (e.g., "Verified User")</li>
                    <li>The date of verification</li>
                  </ul>
                  <p className="text-muted-foreground">
                    No copies of identity documents are stored beyond the verification process unless legally required.
                  </p>
                  
                  <h3 className="text-xl font-medium mb-3 mt-6">Legal Basis for Verification Processing</h3>
                  <p className="text-muted-foreground mb-3">
                    Identity verification is processed under:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Legitimate interests in maintaining platform safety and trust (Article 6(1)(f) GDPR)</li>
                    <li>User consent where applicable</li>
                  </ul>
                  
                  <h3 className="text-xl font-medium mb-3 mt-6">Verification Data Security</h3>
                  <p className="text-muted-foreground">
                    All identity data submitted during verification is handled securely and access is 
                    strictly limited to authorised personnel involved in the verification process.
                  </p>
                  
                  <h3 className="text-xl font-medium mb-3 mt-6">Your Verification Rights</h3>
                  <p className="text-muted-foreground mb-3">
                    Users have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li>Request confirmation of verification status</li>
                    <li>Request deletion of personal data (where applicable)</li>
                    <li>Access further information about how their data is processed</li>
                  </ul>
                  <p className="text-muted-foreground">
                    Requests can be made by contacting us at{' '}
                    <a href="mailto:privacy@swap-skills.com" className="text-primary hover:underline">privacy@swap-skills.com</a>.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
                  <p className="text-muted-foreground">
                    We retain personal data for as long as your account remains active. If you delete your account, we will remove or anonymise your personal data within 30 days, unless we are required to retain certain information for legal or regulatory purposes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                  <p className="text-muted-foreground">
                    We take reasonable technical and organisational measures to protect your personal data, including encryption, secure servers, and access controls. However, no system is completely secure, and we encourage you to use strong passwords and protect your login details.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                  <p className="text-muted-foreground mb-3">
                    Under GDPR, you have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Access your personal data</li>
                    <li>Rectify inaccurate or incomplete data</li>
                    <li>Erase your personal data in certain circumstances</li>
                    <li>Restrict or object to certain processing</li>
                    <li>Data portability</li>
                    <li>Withdraw consent where processing is based on consent</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    To exercise these rights, please contact us at{' '}
                    <a href="mailto:privacy@swap-skills.com" className="text-primary hover:underline">privacy@swap-skills.com</a>.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    You also have the right to lodge a complaint with the Irish Data Protection Commission (
                    <a href="https://www.dataprotection.ie" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.dataprotection.ie</a>
                    ).
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy from time to time. We will notify users of significant changes through the platform or by email. Continued use of the service after changes take effect constitutes acceptance of the updated policy.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                  <p className="text-muted-foreground">
                    For privacy-related questions or to exercise your data protection rights, please contact us at{' '}
                    <a href="mailto:hello@swap-skills.com" className="text-primary hover:underline">hello@swap-skills.com</a>{' '}
                    or via the <a href="/contact" className="text-primary hover:underline">Contact page</a> on our website.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
    </>
  );
}
