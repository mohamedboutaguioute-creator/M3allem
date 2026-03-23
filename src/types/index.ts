export type Category = 'Electricity' | 'Plumbing' | 'Construction' | 'Painting' | 'Carpentry';

export interface Handyman {
  id: string;
  full_name: string;
  avatar_url: string;
  category: Category;
  city: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_suspended?: boolean;
  subscription_status: 'Free' | 'Premium';
  bio: string;
  whatsapp_number: string;
  portfolio_images?: string[];
  created_at: string;
  years_of_experience?: number;
  skills?: string[];
  facebook_url?: string;
  address?: string;
  zipcode?: string;
  price?: number;
}

export interface Review {
  id: string;
  handyman_id: string;
  customer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  handyman_id: string;
  handyman_name: string;
  amount: number;
  date: string;
  method: 'Stripe' | 'Bank Transfer';
  status: 'Pending' | 'Confirmed';
}

export interface AdminStats {
  total_handymen: number;
  mrr: number;
  pending_verifications: number;
  growth_data: { date: string; count: number }[];
  category_distribution: { name: string; value: number }[];
}
