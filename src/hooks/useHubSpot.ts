import { supabase } from "@/integrations/supabase/client";

interface HubSpotContactData {
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  company?: string;
  city?: string;
  website?: string;
  form_source: string;
  message?: string;
  subject?: string;
}

/**
 * Submit a contact to HubSpot CRM
 * This will create or update a contact and optionally add a note with the message
 */
export async function submitToHubSpot(data: HubSpotContactData): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke('hubspot-contact', {
      body: data,
    });

    if (error) {
      console.error('HubSpot submission error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to submit to HubSpot:', error);
    return false;
  }
}

/**
 * Parse a full name into first and last name
 */
export function parseFullName(fullName: string): { firstname: string; lastname: string } {
  const trimmed = fullName.trim();
  const parts = trimmed.split(' ');
  
  if (parts.length === 1) {
    return { firstname: parts[0], lastname: '' };
  }
  
  return {
    firstname: parts[0],
    lastname: parts.slice(1).join(' '),
  };
}
