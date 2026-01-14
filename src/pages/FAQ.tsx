import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { FAQJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
const faqs = [
  {
    question: "What is Swap-Skills?",
    answer: "Swap-Skills is Ireland's community platform for trading skills and services without money. We believe everyone has something valuable to offer, and by connecting neighbours, we're building a more connected, supportive Ireland.",
  },
  {
    question: "How does skill swapping work?",
    answer: "It's simple! Browse available services or post your own skills. When you find something you need, message the provider and arrange a swap. You might trade an hour of gardening for an hour of guitar lessons, or home repairs for homemade meals. The possibilities are endless!",
  },
  {
    question: "Is Swap-Skills really free?",
    answer: "Yes! Swap-Skills is completely free to use. We want to build a strong community before considering any premium features. Our goal is to help Irish neighbours connect, not to profit from kindness. Swap-Skills will offer Ad Spaces to local businesses and will live from Communities Sponsorships.",
  },
  {
    question: "How do I know if someone is trustworthy?",
    answer: "We encourage users to complete their profiles, share a bit about themselves, and communicate openly through our messaging system. Start with smaller swaps to build trust. Remember, most people are good – we're here to help you find them!",
  },
  {
    question: "What if a swap doesn't go as planned?",
    answer: "Communication is key. If something doesn't feel right, trust your instincts and don't proceed. You can report any concerns through our Contact page. We're building a community based on mutual respect and understanding.",
  },
  {
    question: "Can I offer services for money instead of swapping?",
    answer: "While our platform is designed for skill swapping, we understand that sometimes a hybrid approach works best. You can indicate if you're open to other arrangements in your listing description.",
  },
  {
    question: "What qualifications do I need to offer something on Swap-Skills?",
    answer: "None. Honesty is one of our only requirements here – if you're a hobby DIY'er looking to deepen your skills and help neighbours, you are just as valued and welcome here, as long as you are honest about your skillset. This way expectations can be set and you will be sure to have a better experience yourself.",
  },
  {
    question: "What types of skills can I swap?",
    answer: "Almost anything! From gardening, DIY, and home repairs to tutoring, music lessons, cooking, pet care, and creative services. If you have a skill that could help someone, we'd love for you to share it.",
  },
  {
    question: "What does 'Open to all Offers' mean?",
    answer: "This is a feature that people can select when they do not want to narrow down on a specific skill-exchange but are open to general offers. It gives users a broader reach but in return they might more often be subjected to offers that are not interesting to them.",
  },
  {
    question: "How do I get started?",
    answer: "Simply create a free account, set up your profile telling us a bit about yourself, and either browse available services or post your own skills. It's that easy to join our community!",
  },
];

export default function FAQ() {
  return (
    <>
      <SEO 
        title="FAQ"
        description="Find answers to frequently asked questions about Swap Skills - how skill swapping works, safety tips, getting started, and more."
        keywords="swap skills FAQ, skill exchange questions, barter Ireland help, how to swap services"
        url="https://swap-skills.com/faq"
      />
      <FAQJsonLd faqs={faqs} />
      <BreadcrumbJsonLd 
        items={[
          { name: "Home", url: "https://swap-skills.com" },
          { name: "FAQ", url: "https://swap-skills.com/faq" },
        ]} 
      />
      <div className="flex min-h-screen flex-col">
        <Header />
      <main className="flex-1">
        <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h1 className="text-4xl font-bold font-display mb-4">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-muted-foreground">
                Everything you need to know about swapping skills with your neighbours
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="max-w-3xl mx-auto mt-12 text-center">
              <p className="text-muted-foreground">
                Still have questions? We'd love to hear from you.
              </p>
              <a
                href="/contact"
                className="text-primary hover:underline font-medium"
              >
                Get in touch →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
    </>
  );
}
