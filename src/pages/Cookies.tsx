import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cookieTypes = [
  {
    name: "Essential Cookies",
    description: "These cookies are necessary for the website to function properly. They enable basic features like page navigation, secure login, and remembering your preferences. You cannot opt out of these cookies.",
    examples: ["Session cookies", "Authentication cookies", "Security cookies"],
  },
  {
    name: "Functional Cookies",
    description: "These cookies help us remember your choices and provide enhanced features. For example, remembering your location preference or how you've customised the site.",
    examples: ["Preference cookies", "Language settings"],
  },
  {
    name: "Analytics Cookies",
    description: "These cookies help us understand how visitors use our website. They collect anonymous information about page visits and user behaviour, helping us improve our service.",
    examples: ["Page view tracking", "Feature usage statistics"],
  },
];

export default function Cookies() {
  return (
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
                Last updated: December 2024
              </p>

              <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold mb-4">What Are Cookies?</h2>
                  <p className="text-muted-foreground">
                    Cookies are small text files that are placed on your device when you visit 
                    a website. They're widely used to make websites work more efficiently and 
                    provide a better user experience. This policy explains how Swap-Skills uses 
                    cookies and similar technologies.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
                  <p className="text-muted-foreground">
                    Swap-Skills is operated by Kristina Carey, located at Sruth na Ghleanna, 
                    Killeshin, Ireland. We use cookies to provide and improve our service.
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
                  <p className="text-muted-foreground">
                    We use some third-party services that may set their own cookies. These include 
                    our hosting provider and authentication service. These third parties have their 
                    own privacy policies governing how they use this information.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
                  <p className="text-muted-foreground mb-3">
                    You can control cookies through your browser settings. Most browsers allow you to:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>View what cookies are stored on your device</li>
                    <li>Delete all or specific cookies</li>
                    <li>Block all cookies or cookies from specific sites</li>
                    <li>Set preferences for certain types of cookies</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    Please note that blocking essential cookies may affect how the website functions.
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
                  <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
                  <p className="text-muted-foreground">
                    We may update this Cookie Policy from time to time to reflect changes in 
                    technology or legislation. Any updates will be posted on this page.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
                  <p className="text-muted-foreground">
                    If you have any questions about our use of cookies, please contact us through 
                    our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
                  </p>
                </section>

                <section className="pt-8 border-t border-border">
                  <p className="text-muted-foreground text-sm">
                    By continuing to use Swap-Skills, you consent to our use of cookies as 
                    described in this policy. Thank you for being part of our community! 🍪
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
