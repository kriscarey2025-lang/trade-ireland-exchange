import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

export default function Terms() {
  return (
    <>
      <SEO 
        title="Terms of Service"
        description="Read the Terms of Service for Swap Skills - Ireland's community platform for trading skills and services."
        keywords="swap skills terms, service agreement, skill exchange terms Ireland"
        url="https://swap-skills.com/terms"
      />
      <div className="flex min-h-screen flex-col">
        <Header />
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold font-display mb-4">
                Terms of Service
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: December 2025
              </p>

              <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Welcome to Swap-Skills</h2>
                  <p className="text-muted-foreground">
                    These Terms of Service ("Terms") govern your use of the Swap-Skills platform 
                    operated by Swap Skills Limited ("we", "us", "our"), an Irish private limited 
                    company with a registered office in Ireland. By accessing or using our website 
                    or application, you agree to be bound by these Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. What We Offer</h2>
                  <p className="text-muted-foreground">
                    Swap-Skills is a platform that connects people who want to exchange skills 
                    and services with their neighbours and local community. We provide the technology 
                    and space for users to find and connect with others, but we are not a party to 
                    any agreements, arrangements, or interactions made between users, or between 
                    users and advertisers.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">3. Your Account</h2>
                  <p className="text-muted-foreground mb-3">
                    To use Swap-Skills, you must:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Be at least 18 years old</li>
                    <li>Provide accurate information when creating your account</li>
                    <li>Keep your login credentials secure</li>
                    <li>Be responsible for all activity under your account</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">4. Community Guidelines</h2>
                  <p className="text-muted-foreground mb-3">
                    We are building a community based on trust and mutual respect. By using 
                    Swap-Skills, you agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Treat all members with respect and courtesy</li>
                    <li>Be honest about your skills, experience, and availability</li>
                    <li>Communicate clearly and honour your commitments</li>
                    <li>Not use the platform for illegal activities</li>
                    <li>Not harass, abuse, or harm other users</li>
                    <li>Not post false, misleading, or offensive content</li>
                    <li>Not attempt to circumvent platform features or security measures</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    We reserve the right to remove content or suspend accounts that breach these guidelines.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Your Swaps and Interactions</h2>
                  <p className="text-muted-foreground mb-3">
                    Any arrangements you make with other users are solely between you and them. 
                    Swap-Skills does not verify users, supervise exchanges, or guarantee outcomes.
                  </p>
                  <p className="text-muted-foreground">
                    You understand and agree that you are solely responsible for your interactions, 
                    exchanges, and any outcomes resulting from your use of the platform. We are not 
                    responsible for the quality, safety, legality, or suitability of any services 
                    exchanged between users.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Advertising and Listings</h2>
                  <p className="text-muted-foreground mb-3">
                    Swap-Skills may display listings, promotions, or advertisements from local 
                    businesses or community members, including free or trial advertising periods.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>We do not endorse or guarantee any advertised products or services</li>
                    <li>Advertisers are solely responsible for the accuracy and legality of their content</li>
                    <li>We reserve the right to reject, modify, or remove advertisements or listings at our discretion</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. AI-Assisted Matching</h2>
                  <p className="text-muted-foreground mb-3">
                    Swap-Skills uses automated tools, including AI-assisted matching, to help suggest 
                    potential connections, skills, or listings that may be relevant to users based on 
                    information they provide and their activity on the platform.
                  </p>
                  <p className="text-muted-foreground mb-3">
                    These suggestions are provided for convenience only. They do not constitute 
                    endorsements, guarantees, or verification of users, skills, or outcomes. Users 
                    remain solely responsible for deciding whether to connect, communicate, or proceed 
                    with any exchange.
                  </p>
                  <p className="text-muted-foreground">
                    Swap-Skills does not independently verify matches and does not make decisions on 
                    behalf of users.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Your Content</h2>
                  <p className="text-muted-foreground mb-3">
                    When you post content on Swap-Skills (including listings, messages, and profile 
                    information), you retain ownership of your content. However, you grant us a 
                    non-exclusive, royalty-free licence to display and use that content for the 
                    operation and promotion of the platform.
                  </p>
                  <p className="text-muted-foreground">
                    You are responsible for ensuring you have the right to share any content you post.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                  <p className="text-muted-foreground mb-3">
                    Swap-Skills is provided on an "as is" and "as available" basis, without 
                    warranties of any kind.
                  </p>
                  <p className="text-muted-foreground mb-3">
                    To the maximum extent permitted by Irish law, we shall not be liable for any 
                    direct or indirect loss, damage, or harm arising from your use of the platform, 
                    your interactions with other users, or reliance on any listings or advertisements.
                  </p>
                  <p className="text-muted-foreground">
                    Nothing in these Terms limits liability where such limitation is not permitted by law.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">10. Changes to These Terms</h2>
                  <p className="text-muted-foreground">
                    We may update these Terms from time to time. We will notify users of significant 
                    changes through the platform or by email. Continued use of the platform after 
                    changes take effect constitutes acceptance of the updated Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have questions about these Terms, please contact us through the
                    <a href="/contact" className="text-primary hover:underline ml-1">Contact page</a> on our website.
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
