export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  location: string;
  bio?: string;
  verificationStatus: 'pending' | 'verified' | 'unverified';
  badges: Badge[];
  joinedAt: Date;
  completedTrades: number;
  rating: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: Date;
}

export type PostCategory = 'free_offer' | 'help_request' | 'skill_swap';

export interface Service {
  id: string;
  userId: string;
  user?: User;
  title: string;
  description: string;
  category: ServiceCategory;
  type: PostCategory;
  images?: string[];
  qualifications?: string[];
  estimatedHours?: number;
  createdAt: Date;
  location: string;
  status: 'active' | 'paused' | 'completed';
}

export type ServiceCategory = 
  | 'home_improvement'
  | 'childcare'
  | 'education'
  | 'gardening'
  | 'cleaning'
  | 'cooking'
  | 'pet_care'
  | 'transportation'
  | 'tech_support'
  | 'fitness'
  | 'beauty'
  | 'barbering'
  | 'crafts'
  | 'music'
  | 'photography'
  | 'holistic_wellness'
  | 'coaching_mentoring'
  | 'local_goods'
  | 'other';

export interface TradeRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser?: User;
  toUser?: User;
  offeredServiceId: string;
  requestedServiceId: string;
  offeredService?: Service;
  requestedService?: Service;
  type: 'direct_swap';
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'completed';
  createdAt: Date;
}

export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  fromUser?: User;
  tradeId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
