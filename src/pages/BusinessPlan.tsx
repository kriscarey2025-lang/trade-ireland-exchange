import { useEffect } from "react";
import swapskillsLogo from "@/assets/swapskills-logo-full.png";
import homepageScreenshot from "@/assets/homepage-screenshot.png";

export default function BusinessPlan() {
  useEffect(() => {
    // Add print-specific styles
    document.body.classList.add("print-mode");
    return () => document.body.classList.remove("print-mode");
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 print:bg-white">
      {/* Print Button - Hidden when printing */}
      <div className="fixed top-4 right-4 print:hidden z-50">
        <button
          onClick={() => window.print()}
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-primary/90 transition-colors"
        >
          Save as PDF / Print
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-12 print:px-0 print:py-0">
        {/* Cover Page */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center print:break-after-page">
          <img src={swapskillsLogo} alt="SwapSkills" className="h-24 mb-8" />
          <h1 className="text-5xl font-bold text-primary mb-4">Business Plan</h1>
          <p className="text-2xl text-gray-600 mb-2">Ireland's Community Skills Exchange Platform</p>
          <p className="text-lg text-gray-500 mb-8">January 2026</p>
          
          {/* Homepage Screenshot */}
          <div className="w-full max-w-2xl mb-8">
            <img 
              src={homepageScreenshot} 
              alt="SwapSkills Homepage" 
              className="w-full rounded-lg shadow-lg border border-gray-200"
            />
            <p className="text-sm text-gray-500 mt-2 italic">SwapSkills Platform Homepage</p>
          </div>
          
          <div className="mt-8 text-gray-500 text-sm">
            <p className="font-medium">swap-skills.com</p>
            <p>hello@swap-skills.com</p>
            <p>085-8505597</p>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="py-12 print:break-after-page">
          <h2 className="text-3xl font-bold text-primary border-b-4 border-primary pb-2 mb-6">
            Executive Summary
          </h2>
          
          <p className="text-lg leading-relaxed mb-6">
            <strong>SwapSkills</strong> is a community-driven digital platform enabling Irish residents to exchange 
            skills and services without cash. Born from the Irish tradition of <em>meitheal</em> (community cooperation), 
            SwapSkills addresses the cost of living crisis by creating a modern barter economy where a gardener can 
            trade hours for language lessons, or a massage therapist can exchange services for home repairs.
          </p>

          {/* Two-Way Mission Statement */}
          <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg mb-6">
            <p className="text-xl font-semibold text-primary mb-4">Our Dual Mission</p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-2xl font-bold text-primary">A.</span>
                <div>
                  <p className="font-semibold text-lg text-gray-800 mb-1">Empowering Communities</p>
                  <p className="text-lg text-gray-700">
                    To provide Irish communities with a free, accessible platform that facilitates meaningful 
                    service and support exchanges—helping families and individuals save money while combating 
                    social isolation and strengthening neighbourhood connections.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl font-bold text-primary">B.</span>
                <div>
                  <p className="font-semibold text-lg text-gray-800 mb-1">Enabling Local Business Growth</p>
                  <p className="text-lg text-gray-700">
                    To offer small businesses across Ireland a high-traffic, hyper-local advertising platform 
                    with affordable rates—connecting them directly with engaged community members actively 
                    seeking local services.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Community Trust Commitment */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg mb-6">
            <p className="text-lg font-semibold text-amber-800 mb-2">🤝 Community Trust Commitment</p>
            <p className="text-gray-700 mb-3">
              We understand that monetisation must never compromise community trust. Our advertising model is designed with clear boundaries:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>Local only:</strong> Ads are exclusively from Irish businesses serving our communities</li>
              <li><strong>No data selling:</strong> User data is never sold or shared with third parties</li>
              <li><strong>No pay-to-win:</strong> Individual swap rankings are never influenced by payment</li>
              <li><strong>Always free:</strong> Core community features remain free forever</li>
            </ul>
          </div>

          <h3 className="text-xl font-bold mb-4">Traction to Date</h3>
          
          {/* Verified Snapshot Box - break-inside-avoid keeps it together when printing */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-6 print:break-inside-avoid">
            <p className="text-sm text-blue-600 font-medium mb-2">📊 As of January 2026</p>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-700">36</p>
                <p className="text-sm text-gray-600">Active Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">15</p>
                <p className="text-sm text-gray-600">Live Swap Offers</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">4</p>
                <p className="text-sm text-gray-600">Completed Swaps</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">3,041</p>
                <p className="text-sm text-gray-600">Page Views</p>
              </div>
            </div>
          </div>

          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Live platform with active users in Carlow and surrounding counties</li>
            <li>Press coverage in Carlow Nationalist (January 2026)</li>
            <li>Built-in AI matching, messaging, reviews, and verification systems</li>
          </ul>
        </section>


        {/* Market Analysis */}
        <section className="py-12 print:break-after-page">
          <h2 className="text-3xl font-bold text-primary border-b-4 border-primary pb-2 mb-6">
            Market Analysis
          </h2>

          <h3 className="text-2xl font-bold mb-4">The Problem</h3>
          <ol className="list-decimal list-inside space-y-3 text-lg mb-8">
            <li><strong>Cost of Living Crisis:</strong> Irish households face unprecedented financial pressure (inflation peaked at 9.2% in 2023)</li>
            <li><strong>Community Disconnection:</strong> Remote work and urbanisation have weakened neighbourhood ties</li>
            <li><strong>Underutilised Skills:</strong> Millions of valuable skills go unused due to cash barriers</li>
          </ol>

          <h3 className="text-2xl font-bold mb-4">Market Size (Ireland)</h3>
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border border-gray-300 p-3 text-left">Segment</th>
                <th className="border border-gray-300 p-3 text-left">Size</th>
                <th className="border border-gray-300 p-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Total Addressable Market (TAM)</td>
                <td className="border border-gray-300 p-3 font-semibold">€2.1B</td>
                <td className="border border-gray-300 p-3">Annual spend on personal services in Ireland</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Serviceable Market (SAM)</td>
                <td className="border border-gray-300 p-3 font-semibold">€420M</td>
                <td className="border border-gray-300 p-3">Services suitable for skill exchange</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Serviceable Obtainable (SOM)</td>
                <td className="border border-gray-300 p-3 font-semibold">€21M</td>
                <td className="border border-gray-300 p-3">5% penetration target by Year 3</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-2xl font-bold mb-4">Competitive Landscape</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border border-gray-300 p-3 text-left">Competitor</th>
                <th className="border border-gray-300 p-3 text-left">Weakness</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-semibold">TaskRabbit</td>
                <td className="border border-gray-300 p-3">Cash-only, US-focused</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 font-semibold">Nextdoor</td>
                <td className="border border-gray-300 p-3">No exchange mechanism</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-semibold">Facebook Groups</td>
                <td className="border border-gray-300 p-3">Unstructured, no trust system</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 font-semibold">Timebanks.ie</td>
                <td className="border border-gray-300 p-3">Dated UX, limited adoption</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-semibold">Barterchain</td>
                <td className="border border-gray-300 p-3">International focus, technical & complicated UX, not seeded enough in Ireland</td>
              </tr>
            </tbody>
          </table>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-lg mt-6">
            <p className="text-lg">
              <strong className="text-green-700">SwapSkills Advantage:</strong> Modern UX, AI-powered matching, 
              verification system, and mobile-first design purpose-built for the Irish market.
            </p>
          </div>
        </section>

        {/* Revenue Model */}
        <section className="py-12 print:break-after-page">
          <h2 className="text-3xl font-bold text-primary border-b-4 border-primary pb-2 mb-6">
            Revenue Model
          </h2>

          <p className="text-lg mb-6">SwapSkills operates a <strong>freemium + advertising</strong> model:</p>

          <h3 className="text-2xl font-bold mb-4">Revenue Streams</h3>
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border border-gray-300 p-3 text-left">Stream</th>
                <th className="border border-gray-300 p-3 text-right">Year 1</th>
                <th className="border border-gray-300 p-3 text-right">Year 2</th>
                <th className="border border-gray-300 p-3 text-right">Year 3</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Local Business Ads*</td>
                <td className="border border-gray-300 p-3 text-right">€15,000</td>
                <td className="border border-gray-300 p-3 text-right">€60,000</td>
                <td className="border border-gray-300 p-3 text-right">€150,000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Premium Features</td>
                <td className="border border-gray-300 p-3 text-right">€5,000</td>
                <td className="border border-gray-300 p-3 text-right">€25,000</td>
                <td className="border border-gray-300 p-3 text-right">€80,000</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Verified Business Listings</td>
                <td className="border border-gray-300 p-3 text-right">€2,000</td>
                <td className="border border-gray-300 p-3 text-right">€15,000</td>
                <td className="border border-gray-300 p-3 text-right">€45,000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Partnership Revenue</td>
                <td className="border border-gray-300 p-3 text-right">€0</td>
                <td className="border border-gray-300 p-3 text-right">€10,000</td>
                <td className="border border-gray-300 p-3 text-right">€30,000</td>
              </tr>
              <tr className="bg-primary/10 font-bold">
                <td className="border border-gray-300 p-3">Total</td>
                <td className="border border-gray-300 p-3 text-right">€22,000</td>
                <td className="border border-gray-300 p-3 text-right">€110,000</td>
                <td className="border border-gray-300 p-3 text-right">€305,000</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-2xl font-bold mb-4">Pricing Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-lg mb-2">Free</h4>
              <p className="text-gray-600">Unlimited swaps, messaging, reviews</p>
            </div>
            <div className="border-2 border-primary rounded-lg p-4 bg-primary/5">
              <h4 className="font-bold text-lg mb-2">Premium</h4>
              <p className="text-primary font-semibold">€4.99/month</p>
              <p className="text-gray-600">Priority matching, featured listings, advanced analytics</p>
            </div>
            <div className="border-2 border-gray-200 rounded-lg p-4">
              <h4 className="font-bold text-lg mb-2">Business Ads</h4>
              <p className="text-gray-600">€50-200/month for local business promotion</p>
            </div>
          </div>

          {/* Advertising Approach Note */}
          <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-r-lg mt-6">
            <p className="text-sm text-gray-600">
              <strong>*Year 1 Advertising Approach:</strong> Revenue targets are based on pilot partnerships with 
              founding local sponsors through discounted early-adopter packages. We recognise that community platforms 
              require trust-building before full commercial ad rates can be achieved.
            </p>
          </div>
        </section>

        {/* Growth Strategy */}
        <section className="py-12 print:break-after-page">
          <h2 className="text-3xl font-bold text-primary border-b-4 border-primary pb-2 mb-6">
            Growth Strategy
          </h2>

          <div className="space-y-8">
            <div className="border-l-4 border-primary pl-6">
              <h3 className="text-2xl font-bold text-primary mb-2">Phase 1: Local Dominance (2026)</h3>
              <p className="mb-2"><strong>Target:</strong> 2,000 active users in Leinster</p>
              <p className="mb-2"><strong>Tactics:</strong> Local press, community centre partnerships, word-of-mouth</p>
              <p><strong>Key Metric:</strong> 500 completed swaps</p>
            </div>

            <div className="border-l-4 border-primary/70 pl-6">
              <h3 className="text-2xl font-bold text-primary/90 mb-2">Phase 2: Regional Expansion (2027)</h3>
              <p className="mb-2"><strong>Target:</strong> 10,000 users nationwide</p>
              <p className="mb-2"><strong>Tactics:</strong> Social media campaigns, influencer partnerships, LEO collaborations</p>
              <p><strong>Key Metric:</strong> 50 active communities</p>
            </div>

            <div className="border-l-4 border-primary/50 pl-6">
              <h3 className="text-2xl font-bold text-primary/80 mb-2">Phase 3: Scale & Monetise (2028)</h3>
              <p className="mb-2"><strong>Target:</strong> 25,000+ users, €300K revenue</p>
              <p className="mb-2"><strong>Tactics:</strong> Premium launch, business partnerships, potential UK pilot</p>
              <p><strong>Key Metric:</strong> Break-even</p>
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-4 mt-8">User Acquisition Channels</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border border-gray-300 p-3 text-left">Channel</th>
                <th className="border border-gray-300 p-3 text-right">Cost per User</th>
                <th className="border border-gray-300 p-3 text-left">Priority</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Organic/SEO</td>
                <td className="border border-gray-300 p-3 text-right">€0.50</td>
                <td className="border border-gray-300 p-3"><span className="bg-green-100 text-green-800 px-2 py-1 rounded">High</span></td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Local Press</td>
                <td className="border border-gray-300 p-3 text-right">€1.00</td>
                <td className="border border-gray-300 p-3"><span className="bg-green-100 text-green-800 px-2 py-1 rounded">High</span></td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Social Media</td>
                <td className="border border-gray-300 p-3 text-right">€3.00</td>
                <td className="border border-gray-300 p-3"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Medium</span></td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Google Ads</td>
                <td className="border border-gray-300 p-3 text-right">€5.00</td>
                <td className="border border-gray-300 p-3"><span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">Low (initially)</span></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Operations & Team */}
        <section className="py-12 print:break-after-page">
          <h2 className="text-3xl font-bold text-primary border-b-4 border-primary pb-2 mb-6">
            Operations & Team
          </h2>

          <h3 className="text-2xl font-bold mb-4">Current Team</h3>
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border border-gray-300 p-3 text-left">Role</th>
                <th className="border border-gray-300 p-3 text-left">Name</th>
                <th className="border border-gray-300 p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Founder & CEO</td>
                <td className="border border-gray-300 p-3 font-semibold">Kristina Carey</td>
                <td className="border border-gray-300 p-3">Full-time</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Technical Development</td>
                <td className="border border-gray-300 p-3">Lovable AI Platform</td>
                <td className="border border-gray-300 p-3">Outsourced</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Marketing</td>
                <td className="border border-gray-300 p-3">Founder-led</td>
                <td className="border border-gray-300 p-3">Part-time</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-2xl font-bold mb-4">Planned Hires (with funding)</h3>
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border border-gray-300 p-3 text-left">Role</th>
                <th className="border border-gray-300 p-3 text-left">Timeline</th>
                <th className="border border-gray-300 p-3 text-right">Annual Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Part-time Local Representatives</td>
                <td className="border border-gray-300 p-3">Q2 2026</td>
                <td className="border border-gray-300 p-3 text-right">€20,000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Sales & Marketing Manager (Ads)</td>
                <td className="border border-gray-300 p-3">Q3 2026</td>
                <td className="border border-gray-300 p-3 text-right">€45,000</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-2xl font-bold mb-4">Technology Stack</h3>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Frontend</p>
              <p className="text-gray-600">React, TypeScript, Tailwind CSS</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Backend</p>
              <p className="text-gray-600">Lovable Cloud (PostgreSQL, Auth, Storage)</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">AI</p>
              <p className="text-gray-600">Lovable AI for matching and moderation</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold">Hosting</p>
              <p className="text-gray-600">Lovable Cloud (auto-scaling)</p>
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-4">Operational Costs (Annual)</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border border-gray-300 p-3 text-left">Category</th>
                <th className="border border-gray-300 p-3 text-right">Year 1</th>
                <th className="border border-gray-300 p-3 text-right">Year 2</th>
                <th className="border border-gray-300 p-3 text-right">Year 3</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Platform/Hosting</td>
                <td className="border border-gray-300 p-3 text-right">€2,400</td>
                <td className="border border-gray-300 p-3 text-right">€4,800</td>
                <td className="border border-gray-300 p-3 text-right">€12,000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Marketing</td>
                <td className="border border-gray-300 p-3 text-right">€5,000</td>
                <td className="border border-gray-300 p-3 text-right">€15,000</td>
                <td className="border border-gray-300 p-3 text-right">€40,000</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Staff</td>
                <td className="border border-gray-300 p-3 text-right">€0</td>
                <td className="border border-gray-300 p-3 text-right">€65,000</td>
                <td className="border border-gray-300 p-3 text-right">€130,000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Admin/Legal</td>
                <td className="border border-gray-300 p-3 text-right">€2,000</td>
                <td className="border border-gray-300 p-3 text-right">€5,000</td>
                <td className="border border-gray-300 p-3 text-right">€8,000</td>
              </tr>
              <tr className="bg-primary/10 font-bold">
                <td className="border border-gray-300 p-3">Total</td>
                <td className="border border-gray-300 p-3 text-right">€9,400</td>
                <td className="border border-gray-300 p-3 text-right">€89,800</td>
                <td className="border border-gray-300 p-3 text-right">€190,000</td>
              </tr>
            </tbody>
          </table>

          {/* Governance Section */}
          <h3 className="text-2xl font-bold mb-4 mt-8">Governance (Planned)</h3>
          <div className="bg-gray-50 border-l-4 border-primary p-6 rounded-r-lg">
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-primary font-bold">Year 1:</span>
                <p className="text-gray-700">Founder-led operations with direct oversight of all platform decisions</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold">Year 2:</span>
                <p className="text-gray-700">Establish advisory board including community representatives, legal advisor, and safeguarding specialist</p>
              </div>
              <div className="flex gap-3">
                <span className="text-primary font-bold">Long-term:</span>
                <p className="text-gray-700">Exploring CLG (Company Limited by Guarantee) or social enterprise structure to formalise community-first governance</p>
              </div>
            </div>
          </div>
        </section>

        {/* Financial Summary */}
        <section className="py-12 print:break-after-page">
          <h2 className="text-3xl font-bold text-primary border-b-4 border-primary pb-2 mb-6">
            Financial Summary
          </h2>

          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border border-gray-300 p-3 text-left">Metric</th>
                <th className="border border-gray-300 p-3 text-right">Year 1</th>
                <th className="border border-gray-300 p-3 text-right">Year 2</th>
                <th className="border border-gray-300 p-3 text-right">Year 3</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Revenue</td>
                <td className="border border-gray-300 p-3 text-right">€22,000</td>
                <td className="border border-gray-300 p-3 text-right">€110,000</td>
                <td className="border border-gray-300 p-3 text-right">€305,000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Costs</td>
                <td className="border border-gray-300 p-3 text-right">€9,400</td>
                <td className="border border-gray-300 p-3 text-right">€89,800</td>
                <td className="border border-gray-300 p-3 text-right">€190,000</td>
              </tr>
              <tr className="bg-green-50 font-bold">
                <td className="border border-gray-300 p-3">Net Profit/Loss</td>
                <td className="border border-gray-300 p-3 text-right text-green-700">€12,600</td>
                <td className="border border-gray-300 p-3 text-right text-green-700">€20,200</td>
                <td className="border border-gray-300 p-3 text-right text-green-700">€115,000</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Users</td>
                <td className="border border-gray-300 p-3 text-right">2,000</td>
                <td className="border border-gray-300 p-3 text-right">10,000</td>
                <td className="border border-gray-300 p-3 text-right">25,000</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Monthly Active</td>
                <td className="border border-gray-300 p-3 text-right">800</td>
                <td className="border border-gray-300 p-3 text-right">4,000</td>
                <td className="border border-gray-300 p-3 text-right">12,000</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Funding Ask */}
        <section className="py-12 print:break-after-page">
          <h2 className="text-3xl font-bold text-primary border-b-4 border-primary pb-2 mb-6">
            Funding Ask
          </h2>

          <div className="bg-primary/10 border-2 border-primary rounded-lg p-6 mb-8 text-center">
            <p className="text-lg mb-2">Seeking</p>
            <p className="text-4xl font-bold text-primary">€25,000</p>
            <p className="text-lg">Seed Investment</p>
          </div>

          <h3 className="text-2xl font-bold mb-4">Use of Funds</h3>
          <table className="w-full border-collapse mb-8">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border border-gray-300 p-3 text-left">Category</th>
                <th className="border border-gray-300 p-3 text-right">Amount</th>
                <th className="border border-gray-300 p-3 text-left">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Marketing</td>
                <td className="border border-gray-300 p-3 text-right font-semibold">€10,000</td>
                <td className="border border-gray-300 p-3">User acquisition campaigns</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Local Representatives</td>
                <td className="border border-gray-300 p-3 text-right font-semibold">€5,000</td>
                <td className="border border-gray-300 p-3">Part-time community outreach</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Sales & Marketing Manager</td>
                <td className="border border-gray-300 p-3 text-right font-semibold">€5,000</td>
                <td className="border border-gray-300 p-3">3-month initial salary (ads focus)</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Legal/Compliance</td>
                <td className="border border-gray-300 p-3 text-right font-semibold">€2,500</td>
                <td className="border border-gray-300 p-3">Terms, GDPR, contracts</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3">Platform Development</td>
                <td className="border border-gray-300 p-3 text-right font-semibold">€1,500</td>
                <td className="border border-gray-300 p-3">Premium features</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3">Contingency</td>
                <td className="border border-gray-300 p-3 text-right font-semibold">€1,000</td>
                <td className="border border-gray-300 p-3">Buffer</td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-2xl font-bold mb-4">Potential Funding Sources</h3>
          <ul className="list-disc list-inside space-y-2 text-lg">
            <li>Enterprise Ireland Competitive Start Fund</li>
            <li>Local Enterprise Office grants</li>
            <li>Credit Union community loans</li>
            <li>Angel investors (Irish diaspora)</li>
          </ul>
        </section>

        {/* Safeguarding & Trust */}
        <section className="py-12 print:break-after-page">
          <h2 className="text-3xl font-bold text-primary border-b-4 border-primary pb-2 mb-6">
            Safeguarding & Trust
          </h2>

          <p className="text-lg mb-6">
            Given the nature of skill swaps—which may involve home visits, childcare, or personal services—we take 
            safeguarding extremely seriously. SwapSkills has implemented multiple layers of protection:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h4 className="font-bold text-green-800 mb-2">🔐 Verification System</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Optional ID verification for enhanced trust</li>
                <li>• Verified badge displayed on profiles</li>
                <li>• Admin review of all verification documents</li>
              </ul>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h4 className="font-bold text-blue-800 mb-2">⭐ Review & Rating System</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Post-swap reviews from both parties</li>
                <li>• Visible rating history on profiles</li>
                <li>• Pattern detection for problematic users</li>
              </ul>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <h4 className="font-bold text-purple-800 mb-2">🤖 AI + Human Moderation</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• AI content moderation on all listings</li>
                <li>• Human review fallback for flagged content</li>
                <li>• Admin dashboard for oversight</li>
              </ul>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
              <h4 className="font-bold text-amber-800 mb-2">🚨 Reporting & Response</h4>
              <ul className="text-gray-700 space-y-1 text-sm">
                <li>• Easy one-click reporting on all profiles/listings</li>
                <li>• Clear escalation path to admin team</li>
                <li>• Zero-tolerance policy for abuse</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-100 border-2 border-gray-300 rounded-lg p-6">
            <h4 className="font-bold text-gray-800 mb-3">📋 User Safety Guidelines (Built into Platform)</h4>
            <ul className="text-gray-700 space-y-2">
              <li>✓ <strong>Meet in public first</strong> – recommended for all initial meetings</li>
              <li>✓ <strong>Share your plans</strong> – users encouraged to tell someone about swap arrangements</li>
              <li>✓ <strong>Trust your instincts</strong> – easy cancellation with no penalties</li>
              <li>✓ <strong>Report concerns</strong> – clear reporting buttons throughout the platform</li>
            </ul>
          </div>
        </section>

        {/* Risk Analysis */}
        <section className="py-12 print:break-after-page">
          <h2 className="text-3xl font-bold text-primary border-b-4 border-primary pb-2 mb-6">
            Risk Analysis
          </h2>

          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-primary text-white">
                <th className="border border-gray-300 p-3 text-left">Risk</th>
                <th className="border border-gray-300 p-3 text-left">Mitigation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-semibold">Low adoption</td>
                <td className="border border-gray-300 p-3">Hyper-local launch, strong community focus, local representatives</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 font-semibold">Copycat competition</td>
                <td className="border border-gray-300 p-3">First-mover advantage, brand loyalty, Irish-focused positioning</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="border border-gray-300 p-3 font-semibold">Platform abuse</td>
                <td className="border border-gray-300 p-3">ID verification, reviews, AI moderation</td>
              </tr>
              <tr>
                <td className="border border-gray-300 p-3 font-semibold">Revenue dependency on ads</td>
                <td className="border border-gray-300 p-3">Diversify with premium features & partnerships</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Appendix */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-primary border-b-4 border-primary pb-2 mb-6">
            Appendix
          </h2>

          <h3 className="text-2xl font-bold mb-4">Key Metrics to Track</h3>
          
          <h4 className="text-xl font-semibold mb-3 mt-6">User & Engagement Metrics</h4>
          <ul className="list-disc list-inside space-y-2 text-lg mb-6">
            <li>Monthly Active Users (MAU)</li>
            <li>Swap Completion Rate</li>
            <li>User Retention (30/60/90 day)</li>
            <li>Net Promoter Score (NPS)</li>
            <li>App Downloads & Active Mobile Users</li>
          </ul>

          <h4 className="text-xl font-semibold mb-3">Advertising & Revenue Metrics</h4>
          <ul className="list-disc list-inside space-y-2 text-lg mb-8">
            <li>Onboarded Businesses for Advertising</li>
            <li>Average Ad Contract Length</li>
            <li>Ad Revenue Generated (Monthly/Quarterly)</li>
            <li>Revenue per User (RPU)</li>
            <li>Advertiser Retention Rate</li>
          </ul>

          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <img src={swapskillsLogo} alt="SwapSkills" className="h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Contact</h3>
            <p className="text-lg"><strong>Kristina Carey</strong> – Founder</p>
            <p className="text-lg">085-8505597</p>
            <p className="text-lg text-primary">swap-skills.com</p>
            <p className="text-lg">hello@swap-skills.com</p>
          </div>
        </section>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:break-after-page {
            break-after: page;
          }
        }
      `}</style>
    </div>
  );
}
