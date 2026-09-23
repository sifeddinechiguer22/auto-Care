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
} from '../types';

export const authService = {
  login: (credentials: { email: string; password?: string }): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },
  getMe: (): Promise<User> => {
    return apiClient.get<User>('/auth/me');
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
    return apiClient.post<Part>('/parts', data);
  },
  update: (id: string, data: Partial<Part>): Promise<Part> => {
    return apiClient.put<Part>(`/parts/${id}`, data);
  },
  delete: (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete<{ success: boolean }>(`/parts/${id}`);
  },
};

export const invoicesService = {
  getAll: (): Promise<Invoice[]> => {
    return apiClient.get<Invoice[]>('/invoices');
  },
  getById: (id: string): Promise<Invoice> => {
    return apiClient.get<Invoice>(`/invoices/${id}`);
  },
  create: (data: any): Promise<Invoice> => {
    return apiClient.post<Invoice>('/invoices', data);
  },
};

export const paymentsService = {
  getAll: (): Promise<Payment[]> => {
    return apiClient.get<Payment[]>('/payments');
  },
  create: (data: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> => {
    return apiClient.post<Payment>('/payments', data);
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
  getAll: (): Promise<User[]> => {
    return apiClient.get<User[]>('/users');
  },
  create: (data: Omit<User, 'id' | 'created_at'>): Promise<User> => {
    return apiClient.post<User>('/users', data);
  },
  update: (id: string, data: Partial<User>): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, data);
  },
};
