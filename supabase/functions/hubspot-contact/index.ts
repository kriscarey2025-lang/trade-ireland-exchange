import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HubSpotContactData {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  city?: string;
  website?: string;
  // Custom properties
  form_source?: string;
  message?: string;
  subject?: string;
  // Milestone tracking properties
  last_service_title?: string;
  last_service_category?: string;
  last_service_type?: string;
  last_interest_service?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('HUBSPOT_ACCESS_TOKEN');
    if (!accessToken) {
      console.error('HUBSPOT_ACCESS_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'HubSpot not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { 
      email, 
      firstname, 
      lastname, 
      phone, 
      company, 
      city, 
      website, 
      form_source,
      message,
      subject,
      last_service_title,
      last_service_category,
      last_service_type,
      last_interest_service,
    }: HubSpotContactData = body;

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Creating/updating HubSpot contact for: ${email}, source: ${form_source}`);

    // Build properties object with only defined values
    const properties: Record<string, string> = {
      email,
    };

    if (firstname) properties.firstname = firstname;
    if (lastname) properties.lastname = lastname;
    if (phone) properties.phone = phone;
    if (company) properties.company = company;
    if (city) properties.city = city;
    if (website) properties.website = website;
    
    // Add milestone tracking properties (these are custom properties you create in HubSpot)
    // Go to Settings > Properties > Create property for each:
    // - last_service_title (Single-line text)
    // - last_service_category (Single-line text)
    // - last_service_type (Single-line text)
    // - last_interest_service (Single-line text)
    // - swapskills_activity (Single-line text) - for tracking activity type
    if (last_service_title) properties.last_service_title = last_service_title;
    if (last_service_category) properties.last_service_category = last_service_category;
    if (last_service_type) properties.last_service_type = last_service_type;
    if (last_interest_service) properties.last_interest_service = last_interest_service;
    if (form_source) properties.swapskills_activity = form_source;
    
    // Try to create or update the contact
    const createResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ properties }),
    });

    let contactId: string;
    
    if (createResponse.status === 409) {
      // Contact already exists, get the existing contact ID and update
      const conflictData = await createResponse.json();
      contactId = conflictData.message?.match(/Existing ID: (\d+)/)?.[1];
      
      if (contactId) {
        console.log(`Contact exists, updating: ${contactId}`);
        
        // Update the existing contact
        const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ properties }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.text();
          console.error('HubSpot update error:', errorData);
        }
      }
    } else if (!createResponse.ok) {
      const errorData = await createResponse.text();
      console.error('HubSpot create error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create contact in HubSpot' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const createData = await createResponse.json();
      contactId = createData.id;
      console.log(`Contact created: ${contactId}`);
    }

    // Log a timeline event / engagement if there's a message
    if (message && contactId) {
      try {
        const noteBody = `**${form_source || 'Form Submission'}**${subject ? `\n\nSubject: ${subject}` : ''}\n\n${message}`;
        
        await fetch('https://api.hubapi.com/crm/v3/objects/notes', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              hs_note_body: noteBody,
              hs_timestamp: new Date().toISOString(),
            },
            associations: [
              {
                to: { id: contactId },
                types: [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: 202 }]
              }
            ]
          }),
        });
        console.log('Note created for contact');
      } catch (noteError) {
        console.error('Failed to create note:', noteError);
        // Don't fail the whole request if note creation fails
      }
    }

    console.log(`HubSpot contact processed successfully for: ${email}`);

    return new Response(
      JSON.stringify({ success: true, contactId }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('HubSpot contact error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
