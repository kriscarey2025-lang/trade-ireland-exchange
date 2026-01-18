import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Hardcoded list of the 7 users with short descriptions (from our query)
const TARGET_USERS = [
  { userId: "ac631fa5-12aa-4d90-898b-6ce55102ff57", name: "Rodney Doyle", email: "rodneydoyle@eircom.net", service: "Cookery Skills", descLength: 25 },
  { userId: "f9a5484c-af0e-44c0-8cd3-6dfe3a239aae", name: "Mary Twomey", email: "mtwosh3@gmail.com", service: "Life Coaching", descLength: 44 },
  { userId: "a7df408a-0e6d-4295-b89d-2ce5c5d588e9", name: "Gerald Preteau", email: "gerald.preteau@gmail.com", service: "General computer expertise", descLength: 67 },
  { userId: "1bb5c706-953b-493b-b5fc-b495af3f3454", name: "Lorna Farrell", email: "lozholistic@gmail.com", service: "Holistic Treatments", descLength: 68 },
  { userId: "659a1f86-332a-4e1f-8338-4449d7771e0b", name: "Mal Shee", email: "malsshed@email.com", service: "Build with recycle materials", descLength: 76 },
  { userId: "c78a4f07-c49b-4ad2-bf9e-d11a1a9ef7d8", name: "Linda", email: "russelllinda2@hotmail.com", service: "Reiki, Reflexology", descLength: 87 },
  { userId: "78cbf1c7-6718-439a-b97e-644e40213e89", name: "Anne Lanigan", email: "annelanigan2k17@gmail.com", service: "Barbering", descLength: 99 },
];

interface EmailRequest {
  testMode?: boolean;
  adminEmail?: string;
}

async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SwapSkills <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return await response.json();
}

function generateEmailContent(userName: string, serviceName: string): string {
  const firstName = userName.split(' ')[0];
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #16a34a; margin: 0;">SwapSkills</h1>
        <p style="color: #6b7280; margin-top: 5px;">Ireland's Skill Exchange Community</p>
      </div>
      
      <p style="font-size: 18px; color: #374151;">Hi ${firstName}! 👋</p>
      
      <p style="color: #4b5563; line-height: 1.6;">
        We noticed your <strong>"${serviceName}"</strong> listing is looking a bit brief. 
        A more detailed description can really help you connect with people who need your skills!
      </p>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #16a34a;">
        <h3 style="color: #166534; margin-top: 0;">💡 Tips for a great listing:</h3>
        <ul style="color: #4b5563; line-height: 1.8; margin-bottom: 0;">
          <li><strong>Share your experience</strong> - How long have you been doing this?</li>
          <li><strong>Be specific</strong> - What exactly can you help with?</li>
          <li><strong>Mention what you're looking for</strong> - What skills would you like in return?</li>
          <li><strong>Add a personal touch</strong> - Why do you love what you do?</li>
        </ul>
      </div>
      
      <p style="color: #4b5563; line-height: 1.6;">
        Listings with detailed descriptions get <strong>3x more interest</strong> from other members!
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://trade-ireland-exchange.lovable.app/profile" 
           style="background: #16a34a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Update My Listing →
        </a>
      </div>
      
      <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
        Need help? Just reply to this email and we'll be happy to assist.
      </p>
      
      <hr style="border: 1px solid #e5e7eb; margin: 30px 0;" />
      
      <p style="color: #9ca3af; font-size: 12px; text-align: center;">
        SwapSkills - Swapping Skills, Building Community<br>
        <a href="https://trade-ireland-exchange.lovable.app/unsubscribe" style="color: #9ca3af;">Unsubscribe</a>
      </p>
    </div>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { testMode = true, adminEmail = "info@swapskills.ie" }: EmailRequest = await req.json();

    console.log(`Starting listing enhancement email campaign. Test mode: ${testMode}`);
    console.log(`Targeting exactly ${TARGET_USERS.length} users`);

    const results = [];

    if (testMode) {
      console.log(`Sending test email to admin: ${adminEmail}`);

      const userList = TARGET_USERS.map(u => 
        `<li><strong>${u.name}</strong> (${u.email}) - "${u.service}" - ${u.descLength} characters</li>`
      ).join("\n");

      const testHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #16a34a;">🧪 Test: Listing Enhancement Campaign</h1>
          
          <p>This is a preview of the listing enhancement email campaign.</p>
          
          <h2 style="color: #374151;">Target Users (${TARGET_USERS.length})</h2>
          <ul style="line-height: 1.8;">
            ${userList}
          </ul>
          
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          
          <h2 style="color: #374151;">Email Preview</h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
            ${generateEmailContent("Example User", "Your Amazing Skill")}
          </div>
          
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;" />
          
          <p style="color: #6b7280; font-size: 14px;">
            To send to all ${TARGET_USERS.length} users, call this function with <code>testMode: false</code>
          </p>
        </div>
      `;

      const result = await sendEmail(
        adminEmail,
        "[TEST] Listing Enhancement Campaign Preview",
        testHtml
      );

      console.log("Test email sent successfully:", result);
      results.push({ type: "test", email: adminEmail, success: true, id: result.id });

    } else {
      for (const user of TARGET_USERS) {
        console.log(`Sending email to ${user.name} (${user.email})`);

        try {
          const result = await sendEmail(
            user.email,
            `${user.name.split(' ')[0]}, make your "${user.service}" listing shine! ✨`,
            generateEmailContent(user.name, user.service)
          );

          console.log(`Email sent to ${user.email}:`, result);
          results.push({ email: user.email, success: true, id: result.id });
        } catch (emailError: any) {
          console.error(`Failed to send to ${user.email}:`, emailError);
          results.push({ email: user.email, success: false, error: emailError.message });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        testMode,
        totalTargeted: TARGET_USERS.length,
        results 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-listing-enhancement-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
