-- Create advertisers table
CREATE TABLE public.advertisers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_phone TEXT,
  business_website TEXT,
  logo_url TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ads table
CREATE TABLE public.ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advertiser_id UUID REFERENCES public.advertisers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  placement TEXT NOT NULL DEFAULT 'side', -- 'side' or 'inline'
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad impressions table
CREATE TABLE public.ad_impressions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID,
  ip_hash TEXT,
  user_agent TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ad clicks table
CREATE TABLE public.ad_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE NOT NULL,
  viewer_id UUID,
  ip_hash TEXT,
  user_agent TEXT,
  page_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

-- Advertisers policies
CREATE POLICY "Advertisers can view their own records" 
ON public.advertisers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Advertisers can insert their own records" 
ON public.advertisers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Advertisers can update their own records" 
ON public.advertisers FOR UPDATE 
USING (auth.uid() = user_id);

-- Ads policies (public read for active ads, owner management)
CREATE POLICY "Anyone can view active ads" 
ON public.ads FOR SELECT 
USING (is_active = true AND (ends_at IS NULL OR ends_at > now()));

CREATE POLICY "Advertisers can manage their own ads" 
ON public.ads FOR ALL 
USING (advertiser_id IN (SELECT id FROM public.advertisers WHERE user_id = auth.uid()));

-- Impressions policies (anyone can insert, advertisers can view their own)
CREATE POLICY "Anyone can record impressions" 
ON public.ad_impressions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Advertisers can view their ad impressions" 
ON public.ad_impressions FOR SELECT 
USING (ad_id IN (SELECT id FROM public.ads WHERE advertiser_id IN (SELECT id FROM public.advertisers WHERE user_id = auth.uid())));

-- Clicks policies (anyone can insert, advertisers can view their own)
CREATE POLICY "Anyone can record clicks" 
ON public.ad_clicks FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Advertisers can view their ad clicks" 
ON public.ad_clicks FOR SELECT 
USING (ad_id IN (SELECT id FROM public.ads WHERE advertiser_id IN (SELECT id FROM public.advertisers WHERE user_id = auth.uid())));

-- Create indexes for performance
CREATE INDEX idx_ads_advertiser_id ON public.ads(advertiser_id);
CREATE INDEX idx_ads_active ON public.ads(is_active, starts_at, ends_at);
CREATE INDEX idx_ad_impressions_ad_id ON public.ad_impressions(ad_id);
CREATE INDEX idx_ad_impressions_created_at ON public.ad_impressions(created_at);
CREATE INDEX idx_ad_clicks_ad_id ON public.ad_clicks(ad_id);
CREATE INDEX idx_ad_clicks_created_at ON public.ad_clicks(created_at);

-- Update timestamp trigger
CREATE TRIGGER update_advertisers_updated_at
BEFORE UPDATE ON public.advertisers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();