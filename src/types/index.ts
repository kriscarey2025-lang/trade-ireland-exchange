export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  location: string;
  bio?: string;
  credits: number;
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

export interface Service {
  id: string;
  userId: string;
  user?: User;
  title: string;
  description: string;
  category: ServiceCategory;
  type: 'offer' | 'need';
  images?: string[];
  qualifications?: string[];
  estimatedHours?: number;
  creditValue?: number;
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
  | 'crafts'
  | 'music'
  | 'photography'
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
  type: 'direct_swap' | 'credits';
  creditAmount?: number;
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
