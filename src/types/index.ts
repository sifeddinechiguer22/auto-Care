export type Role = 'ADMIN' | 'GARAGISTE';

export interface User {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  role: Role;
  is_active: boolean;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export const getUserDisplayName = (user?: Partial<User> | null): string => {
  if (!user) return 'Utilisateur';

  const directName = user.name?.trim();
  if (directName) return directName;

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  if (fullName) return fullName;

  return user.email?.split('@')[0]?.trim() || 'Utilisateur';
};

export const normalizeUser = <T extends Partial<User>>(user?: T | null): (T & { name: string }) | null => {
  if (!user) return null;

  return {
    ...user,
    name: getUserDisplayName(user),
  } as T & { name: string };
};

export const splitUserName = (fullName?: string): { first_name: string; last_name: string } => {
  const normalized = (fullName || '').trim();
  if (!normalized) {
    return { first_name: '', last_name: '' };
  }

  const parts = normalized.split(/\s+/);
  const first_name = parts.shift() || '';
  const last_name = parts.join(' ');

  return { first_name, last_name };
};

export interface AuthResponse {
  access_token: string;
  token_type: string;
  role: Role;
  user: User;
}

export interface Client {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  created_at: string;
}

export type FuelType = 'DIESEL' | 'GASOLINE' | 'ELECTRIC' | 'HYBRID' | 'LPG';

export interface Vehicle {
  id: string;
  client_id: string;
  registration_number?: string; // License plate
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuel_type: FuelType;
  vin?: string;
  owner_name?: string;
  notes?: string;
  created_at: string;
}

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Appointment {
  id: string;
  client_id: string;
  vehicle_id: string;
  date: string; // YYYY-MM-DD
  time_slot: string; // e.g. "09:00 - 10:00"
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  client?: Client;
  vehicle?: Vehicle;
  created_at: string;
}

export type RepairStatus =
  | 'DIAGNOSIS'
  | 'PARTS_WAIT'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'COMPLETED'
  | 'DELIVERED';

export interface RepairServiceItem {
  id: string;
  service_id: string;
  service_name: string;
  price: number;
  quantity: number;
}

export interface RepairPartItem {
  id: string;
  part_id: string;
  part_name: string;
  part_number: string;
  unit_price: number;
  quantity: number;
}

export interface Repair {
  id: string;
  appointment_id?: string;
  vehicle_id: string;
  client_id: string;
  mechanic_id: string;
  mechanic_name?: string;
  diagnosis: string;
  status: RepairStatus;
  services: RepairServiceItem[];
  parts: RepairPartItem[];
  labor_hours: number;
  labor_rate: number;
  total_amount: number;
  notes?: string;
  vehicle?: Vehicle;
  client?: Client;
  created_at: string;
  completed_at?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  estimated_minutes?: number;
  category?: string;
  created_at: string;
}

export interface StockMovement {
  id: string;
  part_id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  date: string;
  created_by: string;
}

export interface Part {
  id: string;
  name: string;
  part_number: string;
  category: string;
  current_stock: number;
  minimum_stock: number;
  purchase_price: number;
  selling_price: number;
  location?: string;
  created_at: string;
  movements?: StockMovement[];
}

export type InvoiceStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CANCELLED'
  | 'PENDING'
  | 'PARTIAL'
  | 'OVERDUE';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  repair_id?: string;
  client_id: string;
  vehicle_id: string;
  issue_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  status: InvoiceStatus;
  notes?: string;
  client?: Client;
  vehicle?: Vehicle;
  created_at: string;
}

export type PaymentMethod = 'CASH' | 'CARD' | 'CREDIT_CARD' | 'BANK_TRANSFER';

export interface Payment {
  id: string;
  invoice_id: string;
  invoice_number?: string;
  client_name?: string;
  amount: number;
  payment_method: PaymentMethod;
  date: string;
  payment_date?: string;
  reference?: string;
  notes?: string;
  created_at: string;
}

export type ExpenseCategory =
  | 'PARTS_SUPPLIES'
  | 'EQUIPMENT'
  | 'UTILITIES'
  | 'RENT'
  | 'SALARIES'
  | 'INSURANCE'
  | 'MAINTENANCE'
  | 'OTHER';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  receipt_ref?: string;
  receipt_number?: string;
  created_by?: string;
  created_at: string;
}

export interface DashboardMetrics {
  total_clients: number;
  total_vehicles: number;
  today_appointments: number;
  repairs_in_progress: number;
  active_repairs?: number;
  today_revenue?: number;
  unpaid_invoices_count: number;
  unpaid_invoices_amount: number;
  monthly_revenue: number;
  monthly_expenses?: number; // ADMIN only
  monthly_net_profit?: number; // ADMIN only
  revenue_chart?: Array<{
    month: string;
    revenue: number;
    expenses?: number;
  }>; // ADMIN only
  recent_appointments: Appointment[];
  recent_payments: Payment[];
  low_stock_parts_count: number;
  active_repairs_count: number;
}
