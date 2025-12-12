import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function Terms() {
  return (
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
                Last updated: December 2024
              </p>

              <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">1. Welcome to Swap-Skills</h2>
                  <p className="text-muted-foreground">
                    These Terms of Service ("Terms") govern your use of the Swap-Skills platform 
                    operated by Kristina Carey ("we", "us", "our") located at Sruth na Ghleanna, 
                    Killeshin, Ireland. By accessing or using our service, you agree to be bound 
                    by these Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">2. What We Offer</h2>
                  <p className="text-muted-foreground">
                    Swap-Skills is a platform that connects people who want to exchange skills 
                    and services with their neighbours. We provide the technology and space for 
                    you to find and connect with others, but we are not a party to any agreements 
                    you make with other users.
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
                    We're building a community based on trust and mutual respect. You agree to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Treat all members with respect and courtesy</li>
                    <li>Be honest about your skills, experience, and availability</li>
                    <li>Communicate clearly and honour your commitments</li>
                    <li>Not use the platform for illegal activities</li>
                    <li>Not harass, abuse, or harm other users</li>
                    <li>Not post false, misleading, or offensive content</li>
                    <li>Not attempt to circumvent any platform features or security measures</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">5. Your Swaps</h2>
                  <p className="text-muted-foreground">
                    Any arrangements you make with other users are between you and them. 
                    We encourage you to discuss all details clearly before meeting, start 
                    with smaller swaps to build trust, and use our Safety Guidelines. 
                    We are not responsible for the quality, safety, or legality of services 
                    exchanged between users.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">6. Your Content</h2>
                  <p className="text-muted-foreground">
                    When you post content on Swap-Skills (listings, messages, profile information), 
                    you retain ownership but grant us a licence to display it on our platform. 
                    You're responsible for ensuring you have the right to share any content you post.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
                  <p className="text-muted-foreground">
                    Swap-Skills is provided "as is" without warranties of any kind. We're a small 
                    operation doing our best to create something positive for Irish communities. 
                    To the extent permitted by law, we're not liable for any damages arising from 
                    your use of the platform or interactions with other users.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">8. Changes to These Terms</h2>
                  <p className="text-muted-foreground">
                    We may update these Terms from time to time. We'll notify you of significant 
                    changes through the platform or by email. Your continued use after changes 
                    take effect means you accept the new Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
                  <p className="text-muted-foreground">
                    If you have questions about these Terms, please reach out through our 
                    <a href="/contact" className="text-primary hover:underline ml-1">Contact page</a>.
                  </p>
                </section>

                <section className="pt-8 border-t border-border">
                  <p className="text-muted-foreground text-sm">
                    Thank you for being part of Swap-Skills. Together, we're building something 
                    special for Ireland. 🍀
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
