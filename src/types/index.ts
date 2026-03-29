export type Category = 'Electricity' | 'Plumbing' | 'Construction' | 'Painting' | 'Carpentry' | 'Plastering' | 'Aluminum' | 'Tiling';

export interface Handyman {
  id: string;
  full_name: string;
  email?: string;
  avatar_url: string;
  category: Category;
  city: string;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_suspended?: boolean;
  is_searchable?: boolean;
  isProfileComplete?: boolean;
  isPublished?: boolean;
  status?: 'active' | 'inactive' | 'pending';
  search_keywords?: string[];
  subscription_status: 'Free' | 'Premium';
  bio: string;
  whatsapp_number: string;
  phone_number?: string;
  diploma_title?: string;
  diploma_url?: string;
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

export interface Folder {
  id: string;
  name: string;
  createdAt: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  folderId?: string;
  size: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content?: string;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  createdAt: string;
}
