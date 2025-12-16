export type PostCategory = 'events' | 'lost_found' | 'free_giveaways' | 'news_notices';
export type PostStatus = 'active' | 'resolved' | 'archived';

export interface CommunityPost {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: PostCategory;
  location: string | null;
  county: string | null;
  status: PostStatus;
  created_at: string;
  poster_name: string | null;
  poster_avatar: string | null;
  image_url: string | null;
}

export const CATEGORY_CONFIG: Record<PostCategory, { label: string; color: string; bgColor: string }> = {
  events: { label: 'Events', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  lost_found: { label: 'Lost & Found', color: 'text-orange-700', bgColor: 'bg-orange-100' },
  free_giveaways: { label: 'Free & Giveaways', color: 'text-green-700', bgColor: 'bg-green-100' },
  news_notices: { label: 'News & Notices', color: 'text-purple-700', bgColor: 'bg-purple-100' },
};

export const STICKY_NOTE_COLORS: Record<PostCategory, string> = {
  events: 'bg-blue-200',
  lost_found: 'bg-orange-200',
  free_giveaways: 'bg-green-200',
  news_notices: 'bg-purple-200',
};

export const IRISH_COUNTIES = [
  'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal',
  'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny',
  'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath',
  'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone',
  'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
];
