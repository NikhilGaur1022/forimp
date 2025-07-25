export interface SellerApplication {
  id: number;
  user_id: string;
  business_name: string;
  business_type: string;
  business_address: string;
  business_phone: string;
  business_email: string;
  tax_id?: string;
  business_license?: string;
  identity_document?: string;
  bank_account_details?: string;
  experience_years?: number;
  product_categories?: string[];
  seller_status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SellerApplicationWithProfile extends SellerApplication {
  profiles: {
    full_name: string;
    email: string;
  } | null;
}
