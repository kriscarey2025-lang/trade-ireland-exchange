import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cookieTypes = [
  {
    name: "Essential Cookies",
    description: "These cookies are necessary for the website and platform to function properly. They enable core features such as secure login, session management, and security. These cookies cannot be disabled, as the service would not function correctly without them.",
    examples: ["Session cookies", "Authentication cookies", "Security cookies"],
  },
  {
    name: "Functional Cookies",
    description: "Functional cookies allow the website to remember choices you make and provide enhanced features and a more personalised experience.",
    examples: ["Preference settings", "Language or location selections"],
  },
  {
    name: "Analytics Cookies",
    description: "Analytics cookies help us understand how users interact with the platform by collecting aggregated information such as page visits, feature usage, and general interaction patterns. This information helps us improve the service. Where required by law, analytics cookies are used only with your consent.",
    examples: ["Page view tracking", "Feature usage statistics"],
  },
];

export default function Cookies() {
  return (
    <>
      <SEO 
        title="Cookie Policy"
        description="Learn about the cookies used on Swap Skills - essential, functional, and analytics cookies that help improve your experience."
        keywords="swap skills cookies, cookie policy Ireland, website cookies"
        url="https://swap-skills.com/cookies"
      />
      <div className="flex min-h-screen flex-col">
        <Header />
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold font-display mb-4">
                Cookie Policy
              </h1>
              <p className="text-muted-foreground mb-8">
                Last updated: December 2025
              </p>

              <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
                  <p className="text-muted-foreground mb-3">
                    Cookies are small text files that are placed on your device when you visit 
                    a website. They are widely used to make websites work efficiently, improve 
                    user experience, and provide information to website operators.
                  </p>
                  <p className="text-muted-foreground">
                    This Cookie Policy explains how Swap-Skills uses cookies and similar technologies.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
                  <p className="text-muted-foreground mb-3">
                    Swap-Skills is operated by Swap Skills Limited, an Irish private limited 
                    company with a registered office in Ireland.
                  </p>
                  <p className="text-muted-foreground">
                    If you have any questions about our use of cookies, you can contact us at{" "}
                    <a href="mailto:privacy@swap-skills.com" className="text-primary hover:underline">
                      privacy@swap-skills.com
                    </a>{" "}
                    or via our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
                  <div className="space-y-4">
                    {cookieTypes.map((type, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">{type.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-3">{type.description}</p>
                          <p className="text-sm text-muted-foreground">
                            <strong>Examples:</strong> {type.examples.join(", ")}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
                  <p className="text-muted-foreground mb-3">
                    Some third-party services we use to operate the platform may place their 
                    own cookies on your device. These may include hosting, analytics, or 
                    authentication providers.
                  </p>
                  <p className="text-muted-foreground">
                    These third parties process data in accordance with their own privacy and 
                    cookie policies. We do not control these cookies directly.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
                  <p className="text-muted-foreground mb-3">
                    You can control or delete cookies through your browser settings. Most browsers allow you to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>View which cookies are stored on your device</li>
                    <li>Delete all or specific cookies</li>
                    <li>Block all cookies or cookies from certain websites</li>
                    <li>Set preferences for different types of cookies</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    Please note that disabling essential cookies may affect how the website and platform function.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">How to Manage Cookies in Common Browsers</h2>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                    <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                    <li><strong>Edge:</strong> Settings → Privacy → Cookies</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
                  <p className="text-muted-foreground">
                    Some third-party service providers may process cookie-related data outside 
                    the European Economic Area (EEA). Where this occurs, we ensure appropriate 
                    safeguards are in place in accordance with applicable data protection laws.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this Cookie Policy from time to time to reflect changes in 
                    technology, legislation, or how we use cookies. Any updates will be posted 
                    on this page with a revised "Last updated" date.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about this Cookie Policy or our use of cookies, 
                    please contact us at{" "}
                    <a href="mailto:hello@swap-skills.com" className="text-primary hover:underline">
                      hello@swap-skills.com
                    </a>{" "}
                    or via our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
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
