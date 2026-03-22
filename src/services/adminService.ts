import { supabase } from '../lib/supabase';
import { Handyman, Transaction, AdminStats } from '../types';

/**
 * Fetch aggregated statistics for the Admin Dashboard
 */
export async function fetchAdminStats(): Promise<AdminStats> {
  // 1. Total Handymen
  const { count: totalHandymen } = await supabase
    .from('handymen')
    .select('*', { count: 'exact', head: true });

  // 2. MRR (Sum of active premium subscriptions)
  const { data: premiumData } = await supabase
    .from('handymen')
    .select('subscription_price')
    .eq('subscription_status', 'Premium');
  
  const mrr = premiumData?.reduce((acc, curr) => acc + (curr.subscription_price || 0), 0) || 0;

  // 3. Pending Verifications
  const { count: pendingVerifications } = await supabase
    .from('handymen')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', false)
    .not('id_card_url', 'is', null);

  // 4. Growth Data (Last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: growthData } = await supabase
    .from('handymen')
    .select('created_at')
    .gte('created_at', thirtyDaysAgo.toISOString());

  // Logic to group by date would go here...

  return {
    total_handymen: totalHandymen || 0,
    mrr,
    pending_verifications: pendingVerifications || 0,
    growth_data: [], // Processed from growthData
    category_distribution: [] // Processed from a group-by query
  };
}

/**
 * Fetch list of handymen with filters
 */
export async function fetchHandymen(searchTerm: string = '') {
  let query = supabase
    .from('handymen')
    .select('*')
    .order('created_at', { ascending: false });

  if (searchTerm) {
    query = query.ilike('full_name', `%${searchTerm}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Handyman[];
}

/**
 * Update handyman verification status
 */
export async function verifyHandyman(id: string, status: boolean) {
  const { error } = await supabase
    .from('handymen')
    .update({ is_verified: status })
    .eq('id', id);
  
  if (error) throw error;
}

/**
 * Toggle premium subscription manually
 */
export async function togglePremium(id: string, currentStatus: 'Free' | 'Premium') {
  const newStatus = currentStatus === 'Free' ? 'Premium' : 'Free';
  const { error } = await supabase
    .from('handymen')
    .update({ subscription_status: newStatus })
    .eq('id', id);
  
  if (error) throw error;
}
