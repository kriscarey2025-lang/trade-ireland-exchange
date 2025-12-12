import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Privacy() {
  return (
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
                Last updated: December 2024
              </p>

              <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">Our Commitment to Your Privacy</h2>
                  <p className="text-muted-foreground">
                    At Swap-Skills, we believe in transparency and respect for your personal data. 
                    This policy explains what information we collect, how we use it, and your rights 
                    under GDPR and Irish data protection law. We're committed to protecting your 
                    privacy while helping you connect with your community.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
                  <p className="text-muted-foreground">
                    Swap-Skills is operated by Kristina Carey, located at Sruth na Ghleanna, 
                    Killeshin, Ireland. We are the data controller for information collected 
                    through our platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                  <p className="text-muted-foreground mb-3">
                    We collect information you provide directly:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                    <li><strong>Account information:</strong> Name, email address, and password when you register</li>
                    <li><strong>Profile information:</strong> Location, bio, phone number (optional), and profile photo</li>
                    <li><strong>Listings:</strong> Details about skills and services you offer</li>
                    <li><strong>Messages:</strong> Communications with other users through our platform</li>
                  </ul>
                  <p className="text-muted-foreground mb-3">
                    We also collect some information automatically:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Device and browser information</li>
                    <li>IP address and general location</li>
                    <li>How you use our platform (pages visited, features used)</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                  <p className="text-muted-foreground mb-3">
                    We use your information to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Provide and improve our service</li>
                    <li>Enable you to connect with other users</li>
                    <li>Send important updates about your account</li>
                    <li>Respond to your questions and requests</li>
                    <li>Ensure platform safety and prevent abuse</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Legal Basis for Processing</h2>
                  <p className="text-muted-foreground">
                    Under GDPR, we process your data based on: your consent (for optional profile 
                    information), contractual necessity (to provide our service), legitimate 
                    interests (to improve and secure our platform), and legal obligations 
                    (when required by law).
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Sharing Your Information</h2>
                  <p className="text-muted-foreground mb-3">
                    We share your information only:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>With other users:</strong> Your profile and listings are visible to other members. Contact details are only shared when you choose to share them.</li>
                    <li><strong>With service providers:</strong> We use trusted third-party services to host our platform and provide functionality.</li>
                    <li><strong>When required by law:</strong> We may disclose information to comply with legal obligations.</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    We never sell your personal data to third parties.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                  <p className="text-muted-foreground mb-3">
                    Under GDPR, you have the right to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Access:</strong> Request a copy of your personal data</li>
                    <li><strong>Rectification:</strong> Correct inaccurate data</li>
                    <li><strong>Erasure:</strong> Request deletion of your data</li>
                    <li><strong>Portability:</strong> Receive your data in a portable format</li>
                    <li><strong>Object:</strong> Object to certain processing</li>
                    <li><strong>Withdraw consent:</strong> Where processing is based on consent</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    To exercise these rights, please contact us through our 
                    <a href="/contact" className="text-primary hover:underline ml-1">Contact page</a>.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
                  <p className="text-muted-foreground">
                    We keep your data for as long as your account is active. If you delete your 
                    account, we'll remove your personal data within 30 days, except where we're 
                    required to keep it for legal purposes.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                  <p className="text-muted-foreground">
                    We take reasonable measures to protect your data, including encryption, 
                    secure servers, and access controls. However, no system is 100% secure, 
                    so we encourage you to use strong passwords and keep your login details safe.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this policy from time to time. We'll notify you of significant 
                    changes through the platform or by email.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                  <p className="text-muted-foreground">
                    For privacy-related questions or to exercise your rights, please contact us 
                    through our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
                  </p>
                  <p className="text-muted-foreground mt-2">
                    You also have the right to lodge a complaint with the Irish Data Protection 
                    Commission (www.dataprotection.ie) if you're unhappy with how we handle your data.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
