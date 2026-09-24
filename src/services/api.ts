import { apiClient } from '../api/client';
import {
  AuthResponse,
  User,
  DashboardMetrics,
  Client,
  Vehicle,
  Appointment,
  Repair,
  Service,
  Part,
  Invoice,
  Payment,
  Expense,
  Role,
  normalizeUser,
  splitUserName,
} from '../types';

export const authService = {
  login: async (credentials: { email: string; password?: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return {
      ...response,
      user: normalizeUser(response.user) ?? response.user,
    };
  },
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return normalizeUser(response) ?? response;
  },
};

export const dashboardService = {
  getMetrics: (role: Role): Promise<DashboardMetrics> => {
    return apiClient.get<DashboardMetrics>('/dashboard', { role });
  },
};

export const clientsService = {
  getAll: (search?: string): Promise<Client[]> => {
    return apiClient.get<Client[]>('/clients', search ? { search } : undefined);
  },
  getById: (id: string): Promise<Client> => {
    return apiClient.get<Client>(`/clients/${id}`);
  },
  create: (data: Omit<Client, 'id' | 'created_at'>): Promise<Client> => {
    return apiClient.post<Client>('/clients', data);
  },
  update: (id: string, data: Partial<Client>): Promise<Client> => {
    return apiClient.put<Client>(`/clients/${id}`, data);
  },
  delete: (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/clients/${id}`);
  },
};

export const vehiclesService = {
  getAll: (clientId?: string): Promise<Vehicle[]> => {
    return apiClient.get<Vehicle[]>('/vehicles', clientId ? { client_id: clientId } : undefined);
  },
  getById: (id: string): Promise<Vehicle> => {
    return apiClient.get<Vehicle>(`/vehicles/${id}`);
  },
  create: (data: Omit<Vehicle, 'id' | 'created_at'>): Promise<Vehicle> => {
    return apiClient.post<Vehicle>('/vehicles', data);
  },
  update: (id: string, data: Partial<Vehicle>): Promise<Vehicle> => {
    return apiClient.put<Vehicle>(`/vehicles/${id}`, data);
  },
  delete: (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/vehicles/${id}`);
  },
};

export const appointmentsService = {
  getAll: (): Promise<Appointment[]> => {
    return apiClient.get<Appointment[]>('/appointments');
  },
  getById: (id: string): Promise<Appointment> => {
    return apiClient.get<Appointment>(`/appointments/${id}`);
  },
  create: (data: Omit<Appointment, 'id' | 'created_at' | 'client' | 'vehicle'>): Promise<Appointment> => {
    return apiClient.post<Appointment>('/appointments', data);
  },
  update: (id: string, data: Partial<Appointment>): Promise<Appointment> => {
    return apiClient.put<Appointment>(`/appointments/${id}`, data);
  },
  delete: (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/appointments/${id}`);
  },
};

export const repairsService = {
  getAll: (): Promise<Repair[]> => {
    return apiClient.get<Repair[]>('/repairs');
  },
  getById: (id: string): Promise<Repair> => {
    return apiClient.get<Repair>(`/repairs/${id}`);
  },
  create: (data: Omit<Repair, 'id' | 'created_at' | 'vehicle' | 'client'>): Promise<Repair> => {
    return apiClient.post<Repair>('/repairs', data);
  },
  update: (id: string, data: Partial<Repair>): Promise<Repair> => {
    return apiClient.put<Repair>(`/repairs/${id}`, data);
  },
};

export const servicesService = {
  getAll: (): Promise<Service[]> => {
    return apiClient.get<Service[]>('/services');
  },
  create: (data: Omit<Service, 'id' | 'created_at'>): Promise<Service> => {
    return apiClient.post<Service>('/services', data);
  },
  update: (id: string, data: Partial<Service>): Promise<Service> => {
    return apiClient.put<Service>(`/services/${id}`, data);
  },
  delete: (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/services/${id}`);
  },
};

export const partsService = {
  getAll: (): Promise<Part[]> => {
    return apiClient.get<Part[]>('/parts');
  },
  create: (data: Omit<Part, 'id' | 'created_at'>): Promise<Part> => {
    return apiClient.post<Part>('/parts', {
      name: data.name,
      reference: data.part_number,
      description: data.location ? `${data.category || 'Pièce'} — ${data.location}` : data.category || null,
      quantity_in_stock: Number(data.current_stock),
      minimum_stock: Number(data.minimum_stock),
      purchase_price: Number(data.purchase_price),
      selling_price: Number(data.selling_price),
    });
  },
  update: (id: string, data: Partial<Part>): Promise<Part> => {
    const payload: Record<string, any> = { ...data };

    if (data.part_number) payload.reference = data.part_number;
    if (typeof data.current_stock === 'number') payload.quantity_in_stock = data.current_stock;
    if (typeof data.minimum_stock === 'number') payload.minimum_stock = data.minimum_stock;
    if (typeof data.purchase_price === 'number') payload.purchase_price = data.purchase_price;
    if (typeof data.selling_price === 'number') payload.selling_price = data.selling_price;

    delete payload.part_number;
    delete payload.current_stock;

    return apiClient.put<Part>(`/parts/${id}`, payload);
  },
  delete: (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/parts/${id}`);
  },
};

const normalizeInvoiceStatus = (status?: string | null): Invoice['status'] => {
  switch (status) {
    case 'UNPAID':
      return 'PENDING';
    case 'PARTIALLY_PAID':
      return 'PARTIAL';
    case 'PAID':
      return 'PAID';
    case 'OVERDUE':
      return 'OVERDUE';
    case 'CANCELLED':
      return 'CANCELLED';
    default:
      return 'PENDING';
  }
};

const normalizeInvoiceResponse = (invoice: Partial<Invoice> & { total?: number; issue_date?: string; due_date?: string; status?: string }): Invoice => ({
  ...invoice,
  id: String(invoice.id ?? ''),
  invoice_number: invoice.invoice_number ?? '',
  client_id: invoice.client_id ?? '',
  vehicle_id: invoice.vehicle_id ?? '',
  total_amount: Number(invoice.total_amount ?? invoice.total ?? 0),
  paid_amount: Number(invoice.paid_amount ?? 0),
  remaining_amount: Number(invoice.remaining_amount ?? Math.max(0, Number(invoice.total_amount ?? invoice.total ?? 0) - Number(invoice.paid_amount ?? 0))),
  issue_date: invoice.issue_date ?? invoice.created_at ?? new Date().toISOString(),
  due_date: invoice.due_date ?? invoice.issue_date ?? new Date().toISOString(),
  status: normalizeInvoiceStatus(invoice.status),
  items: invoice.items ?? [],
  subtotal: Number(invoice.subtotal ?? invoice.total_amount ?? invoice.total ?? 0),
  tax_rate: Number(invoice.tax_rate ?? 0),
  tax_amount: Number(invoice.tax_amount ?? 0),
  client: invoice.client,
  vehicle: invoice.vehicle,
  created_at: invoice.created_at ?? new Date().toISOString(),
} as Invoice);

export const invoicesService = {
  getAll: async (): Promise<Invoice[]> => {
    const response = await apiClient.get<Partial<Invoice>[]>('/invoices');
    return response.map(normalizeInvoiceResponse);
  },
  getById: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get<Partial<Invoice> & { total?: number; issue_date?: string; due_date?: string; status?: string }>(`/invoices/${id}`);
    return normalizeInvoiceResponse(response);
  },
  create: async (data: any): Promise<Invoice> => {
    const statusMap: Record<string, string> = {
      PENDING: 'UNPAID',
      PARTIAL: 'PARTIALLY_PAID',
      PAID: 'PAID',
      OVERDUE: 'UNPAID',
      CANCELLED: 'CANCELLED',
    };

    const response = await apiClient.post<Partial<Invoice> & { total?: number; issue_date?: string; due_date?: string; status?: string }>('/invoices', {
      client_id: Number(data.client_id),
      vehicle_id: Number(data.vehicle_id),
      repair_id: data.repair_id ? Number(data.repair_id) : null,
      subtotal: Number(data.subtotal),
      tax: Number(data.tax_amount ?? data.tax_rate ?? 0),
      total: Number(data.total_amount),
      paid_amount: Number(data.paid_amount ?? 0),
      remaining_amount: Number(data.remaining_amount ?? Math.max(0, Number(data.total_amount) - Number(data.paid_amount ?? 0))),
      status: statusMap[data.status] || 'UNPAID',
      issued_at: data.issue_date ? new Date(data.issue_date).toISOString() : new Date().toISOString(),
    });

    return normalizeInvoiceResponse(response);
  },
};

export const paymentsService = {
  getAll: (): Promise<Payment[]> => {
    return apiClient.get<Payment[]>('/payments');
  },
  create: (data: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> => {
    return apiClient.post<Payment>('/payments', {
      invoice_id: Number(data.invoice_id),
      amount: Number(data.amount),
      payment_method: data.payment_method === 'CREDIT_CARD' ? 'CARD' : data.payment_method,
      payment_date: data.payment_date || data.date || new Date().toISOString(),
      notes: data.notes || null,
    });
  },
};

export const expensesService = {
  getAll: (): Promise<Expense[]> => {
    return apiClient.get<Expense[]>('/expenses');
  },
  create: (data: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> => {
    return apiClient.post<Expense>('/expenses', data);
  },
};

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/users');
    return response.map((user) => normalizeUser(user) ?? user);
  },
  create: async (data: Omit<User, 'id' | 'created_at'>): Promise<User> => {
    const { first_name, last_name } = splitUserName(data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim());
    const payload = {
      ...data,
      first_name: data.first_name || first_name,
      last_name: data.last_name || last_name,
      name: undefined,
    };
    const response = await apiClient.post<User>('/users', payload);
    return normalizeUser(response) ?? response;
  },
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const payload: Partial<User> = { ...data };

    if (payload.name && !payload.first_name && !payload.last_name) {
      const { first_name, last_name } = splitUserName(payload.name);
      payload.first_name = first_name;
      payload.last_name = last_name;
      delete payload.name;
    }

    const response = await apiClient.put<User>(`/users/${id}`, payload);
    return normalizeUser(response) ?? response;
  },
};
