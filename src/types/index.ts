export interface ReminderView {
  id: string;
  firebase_id?: string;
  assignment_id: string;
  customer_name: string;
  product_name: string;
  vehicle_number: string;
  mobile_number: string;
  expiry_date: string;
  days_until_expiry: number;
  reminder_level: 'info' | 'warning' | 'critical';
  is_expired: boolean;  // <--- YEH LINE IMPORTANT HAI
  rem_1_sent: boolean;
  rem_2_sent: boolean;
  rem_3_sent: boolean;
  renewal_sent: boolean;
  warranty_renewed: boolean;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
