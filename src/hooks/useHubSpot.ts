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

/**
 * Track a custom event in HubSpot via the tracking script
 * This uses the client-side HubSpot tracking code
 */
export function trackHubSpotEvent(eventName: string, properties?: Record<string, string | number | boolean>) {
  try {
    const _hsq = (window as any)._hsq = (window as any)._hsq || [];
    
    // Track custom behavioral event
    _hsq.push(['trackCustomBehavioralEvent', {
      name: eventName,
      properties: properties || {},
    }]);
    
    console.log(`HubSpot event tracked: ${eventName}`, properties);
  } catch (error) {
    console.error('Failed to track HubSpot event:', error);
  }
}

/**
 * Identify a user in HubSpot
 */
export function identifyHubSpotUser(email: string, properties?: Record<string, string>) {
  try {
    const _hsq = (window as any)._hsq = (window as any)._hsq || [];
    
    _hsq.push(['identify', {
      email,
      ...properties,
    }]);
    
    console.log(`HubSpot user identified: ${email}`);
  } catch (error) {
    console.error('Failed to identify HubSpot user:', error);
  }
}

/**
 * Track service creation milestone
 */
export function trackServiceCreatedHubSpot(email: string, serviceTitle: string, serviceCategory: string, serviceType: string) {
  identifyHubSpotUser(email);
  trackHubSpotEvent('pe20561907_service_created', {
    service_title: serviceTitle,
    service_category: serviceCategory,
    service_type: serviceType,
  });
}

/**
 * Track interest expression milestone
 */
export function trackInterestExpressedHubSpot(email: string, serviceTitle: string) {
  identifyHubSpotUser(email);
  trackHubSpotEvent('pe20561907_interest_expressed', {
    service_title: serviceTitle,
  });
}
