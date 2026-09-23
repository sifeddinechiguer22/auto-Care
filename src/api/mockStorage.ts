import {
  User,
  Client,
  Vehicle,
  Appointment,
  Repair,
  Service,
  Part,
  Invoice,
  Payment,
  Expense,
  DashboardMetrics,
  AuthResponse,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_CLIENTS,
  INITIAL_VEHICLES,
  INITIAL_SERVICES,
  INITIAL_PARTS,
  INITIAL_APPOINTMENTS,
  INITIAL_REPAIRS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
} from './seedData';
import { ApiRequestOptions } from './client';

// Local storage keys
const USERS_KEY = 'autocare_db_users';
const CLIENTS_KEY = 'autocare_db_clients';
const VEHICLES_KEY = 'autocare_db_vehicles';
const SERVICES_KEY = 'autocare_db_services';
const PARTS_KEY = 'autocare_db_parts';
const APPOINTMENTS_KEY = 'autocare_db_appointments';
const REPAIRS_KEY = 'autocare_db_repairs';
const INVOICES_KEY = 'autocare_db_invoices';
const PAYMENTS_KEY = 'autocare_db_payments';
const EXPENSES_KEY = 'autocare_db_expenses';

function getStored<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch {
    return initial;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to persist ${key}`, e);
  }
}

// Reset data to seeds
export function resetMockDatabase() {
  localStorage.setItem(USERS_KEY, JSON.stringify(INITIAL_USERS));
  localStorage.setItem(CLIENTS_KEY, JSON.stringify(INITIAL_CLIENTS));
  localStorage.setItem(VEHICLES_KEY, JSON.stringify(INITIAL_VEHICLES));
  localStorage.setItem(SERVICES_KEY, JSON.stringify(INITIAL_SERVICES));
  localStorage.setItem(PARTS_KEY, JSON.stringify(INITIAL_PARTS));
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(INITIAL_APPOINTMENTS));
  localStorage.setItem(REPAIRS_KEY, JSON.stringify(INITIAL_REPAIRS));
  localStorage.setItem(INVOICES_KEY, JSON.stringify(INITIAL_INVOICES));
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(INITIAL_PAYMENTS));
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(INITIAL_EXPENSES));
}

// Helper to calculate dashboard metrics
export function computeDashboardMetrics(role: 'ADMIN' | 'GARAGISTE'): DashboardMetrics {
  const clients = getStored<Client[]>(CLIENTS_KEY, INITIAL_CLIENTS);
  const vehicles = getStored<Vehicle[]>(VEHICLES_KEY, INITIAL_VEHICLES);
  const appointments = getStored<Appointment[]>(APPOINTMENTS_KEY, INITIAL_APPOINTMENTS);
  const repairs = getStored<Repair[]>(REPAIRS_KEY, INITIAL_REPAIRS);
  const parts = getStored<Part[]>(PARTS_KEY, INITIAL_PARTS);
  const invoices = getStored<Invoice[]>(INVOICES_KEY, INITIAL_INVOICES);
  const payments = getStored<Payment[]>(PAYMENTS_KEY, INITIAL_PAYMENTS);
  const expenses = getStored<Expense[]>(EXPENSES_KEY, INITIAL_EXPENSES);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayApps = appointments.filter((a) => a.date === todayStr);

  const activeRepairs = repairs.filter(
    (r) => r.status !== 'COMPLETED' && r.status !== 'DELIVERED'
  );

  const unpaidInvoices = invoices.filter(
    (inv) => inv.status === 'PENDING' || inv.status === 'PARTIAL' || inv.status === 'OVERDUE'
  );
  const unpaidTotal = unpaidInvoices.reduce((acc, curr) => acc + curr.remaining_amount, 0);

  const totalMonthlyRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalMonthlyExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const lowStockParts = parts.filter((p) => p.current_stock <= p.minimum_stock);

  // Revenue chart by past 6 months
  const chartData = [
    { month: 'Apr', revenue: 7800, expenses: 5400 },
    { month: 'May', revenue: 8900, expenses: 5800 },
    { month: 'Jun', revenue: 10400, expenses: 6100 },
    { month: 'Jul', revenue: 11200, expenses: 6300 },
    { month: 'Aug', revenue: 9800, expenses: 5900 },
    { month: 'Sep', revenue: totalMonthlyRevenue + 8500, expenses: totalMonthlyExpenses + 4200 },
  ];

  const enrichedAppointments = appointments.slice(0, 5).map((app) => ({
    ...app,
    client: clients.find((c) => c.id === app.client_id),
    vehicle: vehicles.find((v) => v.id === app.vehicle_id),
  }));

  const metrics: DashboardMetrics = {
    total_clients: clients.length,
    total_vehicles: vehicles.length,
    today_appointments: todayApps.length,
    repairs_in_progress: activeRepairs.length,
    unpaid_invoices_count: unpaidInvoices.length,
    unpaid_invoices_amount: unpaidTotal,
    monthly_revenue: totalMonthlyRevenue + 8500,
    recent_appointments: enrichedAppointments,
    recent_payments: payments.slice(0, 5),
    low_stock_parts_count: lowStockParts.length,
    active_repairs_count: activeRepairs.length,
  };

  if (role === 'ADMIN') {
    metrics.monthly_expenses = totalMonthlyExpenses + 4200;
    metrics.monthly_net_profit = (metrics.monthly_revenue || 0) - (metrics.monthly_expenses || 0);
    metrics.revenue_chart = chartData;
  }

  return metrics;
}

export async function handleMockRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const method = options.method?.toUpperCase() || 'GET';
  const cleanEndpoint = endpoint.replace(/^\/api/, '').replace(/^\//, '');
  const segments = cleanEndpoint.split('/');

  const body = options.body ? JSON.parse(options.body as string) : null;

  // Simulate network tick
  await new Promise((res) => setTimeout(res, 60));

  // 1. AUTH
  if (segments[0] === 'auth') {
    if (segments[1] === 'login' && method === 'POST') {
      const { email, password } = body;
      const users = getStored<User[]>(USERS_KEY, INITIAL_USERS);
      const user = users.find(
        (u) => u.email.toLowerCase() === (email || '').toLowerCase().trim()
      );

      if (!user) {
        throw new Error('Invalid email or password.');
      }
      if (!user.is_active) {
        throw new Error('This garage employee account has been deactivated.');
      }

      // Check password (for demo, owner@autocare.com accepts admin123 or any, mechanic@autocare.com accepts garagiste123 or any)
      const token = `mock-token-${user.id}-${Date.now()}`;
      const authResp: AuthResponse = {
        access_token: token,
        token_type: 'bearer',
        role: user.role,
        user,
      };
      return authResp as unknown as T;
    }

    if (segments[1] === 'me' && method === 'GET') {
      const users = getStored<User[]>(USERS_KEY, INITIAL_USERS);
      // Return currently logged user or first admin
      return (users[0] || INITIAL_USERS[0]) as unknown as T;
    }
  }

  // 2. DASHBOARD
  if (segments[0] === 'dashboard' && method === 'GET') {
    // Check if role param is provided
    const role = (options.params?.role as 'ADMIN' | 'GARAGISTE') || 'ADMIN';
    return computeDashboardMetrics(role) as unknown as T;
  }

  // 3. CLIENTS
  if (segments[0] === 'clients') {
    let clients = getStored<Client[]>(CLIENTS_KEY, INITIAL_CLIENTS);

    if (segments.length === 1) {
      if (method === 'GET') {
        const query = (options.params?.search as string)?.toLowerCase();
        if (query) {
          clients = clients.filter(
            (c) =>
              c.first_name.toLowerCase().includes(query) ||
              c.last_name.toLowerCase().includes(query) ||
              c.email.toLowerCase().includes(query) ||
              c.phone.includes(query)
          );
        }
        return clients as unknown as T;
      }
      if (method === 'POST') {
        const newClient: Client = {
          id: `cli-${Date.now()}`,
          first_name: body.first_name,
          last_name: body.last_name,
          email: body.email,
          phone: body.phone,
          address: body.address,
          notes: body.notes || '',
          created_at: new Date().toISOString(),
        };
        clients.unshift(newClient);
        setStored(CLIENTS_KEY, clients);
        return newClient as unknown as T;
      }
    }

    if (segments.length === 2) {
      const id = segments[1];
      const client = clients.find((c) => c.id === id);

      if (method === 'GET') {
        if (!client) throw new Error('Client not found');
        return client as unknown as T;
      }
      if (method === 'PUT') {
        if (!client) throw new Error('Client not found');
        const updated = { ...client, ...body };
        clients = clients.map((c) => (c.id === id ? updated : c));
        setStored(CLIENTS_KEY, clients);
        return updated as unknown as T;
      }
      if (method === 'DELETE') {
        clients = clients.filter((c) => c.id !== id);
        setStored(CLIENTS_KEY, clients);
        return { success: true } as unknown as T;
      }
    }
  }

  // 4. VEHICLES
  if (segments[0] === 'vehicles') {
    let vehicles = getStored<Vehicle[]>(VEHICLES_KEY, INITIAL_VEHICLES);
    const clients = getStored<Client[]>(CLIENTS_KEY, INITIAL_CLIENTS);

    if (segments.length === 1) {
      if (method === 'GET') {
        const clientId = options.params?.client_id as string;
        let result = vehicles;
        if (clientId) {
          result = result.filter((v) => v.client_id === clientId);
        }
        // Enrich owner name
        result = result.map((v) => {
          const owner = clients.find((c) => c.id === v.client_id);
          return {
            ...v,
            owner_name: owner ? `${owner.first_name} ${owner.last_name}` : v.owner_name,
          };
        });
        return result as unknown as T;
      }
      if (method === 'POST') {
        const owner = clients.find((c) => c.id === body.client_id);
        const newVehicle: Vehicle = {
          id: `veh-${Date.now()}`,
          client_id: body.client_id,
          registration_number: (body.registration_number || '').toUpperCase().trim(),
          brand: body.brand,
          model: body.model,
          year: Number(body.year),
          mileage: Number(body.mileage || 0),
          fuel_type: body.fuel_type || 'GASOLINE',
          vin: (body.vin || '').toUpperCase().trim(),
          owner_name: owner ? `${owner.first_name} ${owner.last_name}` : '',
          notes: body.notes || '',
          created_at: new Date().toISOString(),
        };
        vehicles.unshift(newVehicle);
        setStored(VEHICLES_KEY, vehicles);
        return newVehicle as unknown as T;
      }
    }

    if (segments.length === 2) {
      const id = segments[1];
      const vehicle = vehicles.find((v) => v.id === id);

      if (method === 'GET') {
        if (!vehicle) throw new Error('Vehicle not found');
        const owner = clients.find((c) => c.id === vehicle.client_id);
        return {
          ...vehicle,
          owner_name: owner ? `${owner.first_name} ${owner.last_name}` : vehicle.owner_name,
        } as unknown as T;
      }
      if (method === 'PUT') {
        if (!vehicle) throw new Error('Vehicle not found');
        const updated = { ...vehicle, ...body };
        vehicles = vehicles.map((v) => (v.id === id ? updated : v));
        setStored(VEHICLES_KEY, vehicles);
        return updated as unknown as T;
      }
      if (method === 'DELETE') {
        vehicles = vehicles.filter((v) => v.id !== id);
        setStored(VEHICLES_KEY, vehicles);
        return { success: true } as unknown as T;
      }
    }
  }

  // 5. APPOINTMENTS
  if (segments[0] === 'appointments') {
    let appointments = getStored<Appointment[]>(APPOINTMENTS_KEY, INITIAL_APPOINTMENTS);
    const clients = getStored<Client[]>(CLIENTS_KEY, INITIAL_CLIENTS);
    const vehicles = getStored<Vehicle[]>(VEHICLES_KEY, INITIAL_VEHICLES);

    if (segments.length === 1) {
      if (method === 'GET') {
        const enriched = appointments.map((a) => ({
          ...a,
          client: clients.find((c) => c.id === a.client_id),
          vehicle: vehicles.find((v) => v.id === a.vehicle_id),
        }));
        return enriched as unknown as T;
      }
      if (method === 'POST') {
        const newApp: Appointment = {
          id: `app-${Date.now()}`,
          client_id: body.client_id,
          vehicle_id: body.vehicle_id,
          date: body.date,
          time_slot: body.time_slot,
          reason: body.reason,
          status: body.status || 'PENDING',
          notes: body.notes || '',
          created_at: new Date().toISOString(),
        };
        appointments.unshift(newApp);
        setStored(APPOINTMENTS_KEY, appointments);
        return {
          ...newApp,
          client: clients.find((c) => c.id === newApp.client_id),
          vehicle: vehicles.find((v) => v.id === newApp.vehicle_id),
        } as unknown as T;
      }
    }

    if (segments.length === 2) {
      const id = segments[1];
      const app = appointments.find((a) => a.id === id);

      if (method === 'GET') {
        if (!app) throw new Error('Appointment not found');
        return {
          ...app,
          client: clients.find((c) => c.id === app.client_id),
          vehicle: vehicles.find((v) => v.id === app.vehicle_id),
        } as unknown as T;
      }
      if (method === 'PUT') {
        if (!app) throw new Error('Appointment not found');
        const updated = { ...app, ...body };
        appointments = appointments.map((a) => (a.id === id ? updated : a));
        setStored(APPOINTMENTS_KEY, appointments);
        return {
          ...updated,
          client: clients.find((c) => c.id === updated.client_id),
          vehicle: vehicles.find((v) => v.id === updated.vehicle_id),
        } as unknown as T;
      }
      if (method === 'DELETE') {
        appointments = appointments.filter((a) => a.id !== id);
        setStored(APPOINTMENTS_KEY, appointments);
        return { success: true } as unknown as T;
      }
    }
  }

  // 6. REPAIRS
  if (segments[0] === 'repairs') {
    let repairs = getStored<Repair[]>(REPAIRS_KEY, INITIAL_REPAIRS);
    const clients = getStored<Client[]>(CLIENTS_KEY, INITIAL_CLIENTS);
    const vehicles = getStored<Vehicle[]>(VEHICLES_KEY, INITIAL_VEHICLES);
    const users = getStored<User[]>(USERS_KEY, INITIAL_USERS);

    if (segments.length === 1) {
      if (method === 'GET') {
        const enriched = repairs.map((r) => {
          const mech = users.find((u) => u.id === r.mechanic_id);
          return {
            ...r,
            mechanic_name: mech ? mech.name : r.mechanic_name,
            client: clients.find((c) => c.id === r.client_id),
            vehicle: vehicles.find((v) => v.id === r.vehicle_id),
          };
        });
        return enriched as unknown as T;
      }
      if (method === 'POST') {
        const mech = users.find((u) => u.id === body.mechanic_id);
        const newRepair: Repair = {
          id: `rep-${Date.now()}`,
          appointment_id: body.appointment_id || undefined,
          vehicle_id: body.vehicle_id,
          client_id: body.client_id,
          mechanic_id: body.mechanic_id,
          mechanic_name: mech?.name || 'Assigned Mechanic',
          diagnosis: body.diagnosis || '',
          status: body.status || 'DIAGNOSIS',
          services: body.services || [],
          parts: body.parts || [],
          labor_hours: Number(body.labor_hours || 0),
          labor_rate: Number(body.labor_rate || 90),
          total_amount: Number(body.total_amount || 0),
          notes: body.notes || '',
          created_at: new Date().toISOString(),
        };
        repairs.unshift(newRepair);
        setStored(REPAIRS_KEY, repairs);
        return newRepair as unknown as T;
      }
    }

    if (segments.length === 2) {
      const id = segments[1];
      const repair = repairs.find((r) => r.id === id);

      if (method === 'GET') {
        if (!repair) throw new Error('Repair not found');
        const mech = users.find((u) => u.id === repair.mechanic_id);
        return {
          ...repair,
          mechanic_name: mech ? mech.name : repair.mechanic_name,
          client: clients.find((c) => c.id === repair.client_id),
          vehicle: vehicles.find((v) => v.id === repair.vehicle_id),
        } as unknown as T;
      }
      if (method === 'PUT') {
        if (!repair) throw new Error('Repair not found');
        const mech = users.find((u) => u.id === (body.mechanic_id || repair.mechanic_id));
        const updated = {
          ...repair,
          ...body,
          mechanic_name: mech ? mech.name : repair.mechanic_name,
        };
        if (body.status === 'COMPLETED' && !updated.completed_at) {
          updated.completed_at = new Date().toISOString();
        }
        repairs = repairs.map((r) => (r.id === id ? updated : r));
        setStored(REPAIRS_KEY, repairs);
        return updated as unknown as T;
      }
    }
  }

  // 7. SERVICES
  if (segments[0] === 'services') {
    let services = getStored<Service[]>(SERVICES_KEY, INITIAL_SERVICES);

    if (segments.length === 1) {
      if (method === 'GET') {
        return services as unknown as T;
      }
      if (method === 'POST') {
        const newService: Service = {
          id: `srv-${Date.now()}`,
          name: body.name,
          description: body.description,
          price: Number(body.price),
          estimated_minutes: Number(body.estimated_minutes || 60),
          category: body.category || 'General',
          created_at: new Date().toISOString(),
        };
        services.unshift(newService);
        setStored(SERVICES_KEY, services);
        return newService as unknown as T;
      }
    }

    if (segments.length === 2) {
      const id = segments[1];
      const service = services.find((s) => s.id === id);

      if (method === 'PUT') {
        if (!service) throw new Error('Service not found');
        const updated = { ...service, ...body, price: Number(body.price) };
        services = services.map((s) => (s.id === id ? updated : s));
        setStored(SERVICES_KEY, services);
        return updated as unknown as T;
      }
      if (method === 'DELETE') {
        services = services.filter((s) => s.id !== id);
        setStored(SERVICES_KEY, services);
        return { success: true } as unknown as T;
      }
    }
  }

  // 8. PARTS
  if (segments[0] === 'parts') {
    let parts = getStored<Part[]>(PARTS_KEY, INITIAL_PARTS);

    if (segments.length === 1) {
      if (method === 'GET') {
        return parts as unknown as T;
      }
      if (method === 'POST') {
        const newPart: Part = {
          id: `prt-${Date.now()}`,
          name: body.name,
          part_number: (body.part_number || '').toUpperCase(),
          category: body.category || 'General',
          current_stock: Number(body.current_stock || 0),
          minimum_stock: Number(body.minimum_stock || 5),
          purchase_price: Number(body.purchase_price || 0),
          selling_price: Number(body.selling_price || 0),
          location: body.location || '',
          created_at: new Date().toISOString(),
        };
        parts.unshift(newPart);
        setStored(PARTS_KEY, parts);
        return newPart as unknown as T;
      }
    }

    if (segments.length === 2) {
      const id = segments[1];
      const part = parts.find((p) => p.id === id);

      if (method === 'PUT') {
        if (!part) throw new Error('Part not found');
        const updated = {
          ...part,
          ...body,
          current_stock: Number(body.current_stock ?? part.current_stock),
          minimum_stock: Number(body.minimum_stock ?? part.minimum_stock),
          purchase_price: Number(body.purchase_price ?? part.purchase_price),
          selling_price: Number(body.selling_price ?? part.selling_price),
        };
        parts = parts.map((p) => (p.id === id ? updated : p));
        setStored(PARTS_KEY, parts);
        return updated as unknown as T;
      }
      if (method === 'DELETE') {
        parts = parts.filter((p) => p.id !== id);
        setStored(PARTS_KEY, parts);
        return { success: true } as unknown as T;
      }
    }
  }

  // 9. INVOICES
  if (segments[0] === 'invoices') {
    let invoices = getStored<Invoice[]>(INVOICES_KEY, INITIAL_INVOICES);
    const clients = getStored<Client[]>(CLIENTS_KEY, INITIAL_CLIENTS);
    const vehicles = getStored<Vehicle[]>(VEHICLES_KEY, INITIAL_VEHICLES);

    if (segments.length === 1) {
      if (method === 'GET') {
        const enriched = invoices.map((inv) => ({
          ...inv,
          client: clients.find((c) => c.id === inv.client_id),
          vehicle: vehicles.find((v) => v.id === inv.vehicle_id),
        }));
        return enriched as unknown as T;
      }
      if (method === 'POST') {
        const subtotal = Number(body.subtotal || 0);
        const taxRate = Number(body.tax_rate ?? 8.0);
        const taxAmount = (subtotal * taxRate) / 100;
        const totalAmount = subtotal + taxAmount;
        const paidAmount = Number(body.paid_amount || 0);
        const remainingAmount = Math.max(0, totalAmount - paidAmount);

        let status = body.status || 'PENDING';
        if (remainingAmount === 0 && totalAmount > 0) {
          status = 'PAID';
        } else if (paidAmount > 0 && remainingAmount > 0) {
          status = 'PARTIAL';
        }

        const newInvoice: Invoice = {
          id: `inv-${Date.now()}`,
          invoice_number: `INV-2025-${String(invoices.length + 1).padStart(3, '0')}`,
          repair_id: body.repair_id || undefined,
          client_id: body.client_id,
          vehicle_id: body.vehicle_id,
          issue_date: body.issue_date || new Date().toISOString().split('T')[0],
          due_date: body.due_date || new Date().toISOString().split('T')[0],
          items: body.items || [],
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          paid_amount: paidAmount,
          remaining_amount: remainingAmount,
          status,
          notes: body.notes || '',
          created_at: new Date().toISOString(),
        };

        invoices.unshift(newInvoice);
        setStored(INVOICES_KEY, invoices);
        return {
          ...newInvoice,
          client: clients.find((c) => c.id === newInvoice.client_id),
          vehicle: vehicles.find((v) => v.id === newInvoice.vehicle_id),
        } as unknown as T;
      }
    }

    if (segments.length === 2) {
      const id = segments[1];
      const inv = invoices.find((i) => i.id === id);

      if (method === 'GET') {
        if (!inv) throw new Error('Invoice not found');
        return {
          ...inv,
          client: clients.find((c) => c.id === inv.client_id),
          vehicle: vehicles.find((v) => v.id === inv.vehicle_id),
        } as unknown as T;
      }
    }
  }

  // 10. PAYMENTS
  if (segments[0] === 'payments') {
    let payments = getStored<Payment[]>(PAYMENTS_KEY, INITIAL_PAYMENTS);
    const invoices = getStored<Invoice[]>(INVOICES_KEY, INITIAL_INVOICES);
    const clients = getStored<Client[]>(CLIENTS_KEY, INITIAL_CLIENTS);

    if (method === 'GET') {
      return payments as unknown as T;
    }
    if (method === 'POST') {
      const inv = invoices.find((i) => i.id === body.invoice_id);
      const client = inv ? clients.find((c) => c.id === inv.client_id) : null;
      const amount = Number(body.amount);

      const newPayment: Payment = {
        id: `pay-${Date.now()}`,
        invoice_id: body.invoice_id,
        invoice_number: inv?.invoice_number || 'INV-REF',
        client_name: client ? `${client.first_name} ${client.last_name}` : 'Client',
        amount,
        payment_method: body.payment_method || 'CASH',
        date: body.date || new Date().toISOString().split('T')[0],
        reference: body.reference || '',
        notes: body.notes || '',
        created_at: new Date().toISOString(),
      };

      payments.unshift(newPayment);
      setStored(PAYMENTS_KEY, payments);

      // Also update related invoice's paid/remaining balance
      if (inv) {
        inv.paid_amount = Number((inv.paid_amount + amount).toFixed(2));
        inv.remaining_amount = Math.max(0, Number((inv.total_amount - inv.paid_amount).toFixed(2)));
        if (inv.remaining_amount === 0) {
          inv.status = 'PAID';
        } else {
          inv.status = 'PARTIAL';
        }
        setStored(INVOICES_KEY, invoices);
      }

      return newPayment as unknown as T;
    }
  }

  // 11. EXPENSES
  if (segments[0] === 'expenses') {
    let expenses = getStored<Expense[]>(EXPENSES_KEY, INITIAL_EXPENSES);

    if (method === 'GET') {
      return expenses as unknown as T;
    }
    if (method === 'POST') {
      const newExpense: Expense = {
        id: `exp-${Date.now()}`,
        category: body.category || 'OTHER',
        amount: Number(body.amount),
        date: body.date || new Date().toISOString().split('T')[0],
        description: body.description,
        receipt_ref: body.receipt_ref || '',
        created_by: body.created_by || 'Marcus Vance',
        created_at: new Date().toISOString(),
      };
      expenses.unshift(newExpense);
      setStored(EXPENSES_KEY, expenses);
      return newExpense as unknown as T;
    }
  }

  // 12. USERS
  if (segments[0] === 'users') {
    let users = getStored<User[]>(USERS_KEY, INITIAL_USERS);

    if (segments.length === 1) {
      if (method === 'GET') {
        return users as unknown as T;
      }
      if (method === 'POST') {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: body.name,
          email: body.email,
          role: body.role || 'GARAGISTE',
          is_active: body.is_active ?? true,
          phone: body.phone || '',
          avatar_url: body.avatar_url || '',
          created_at: new Date().toISOString(),
        };
        users.push(newUser);
        setStored(USERS_KEY, users);
        return newUser as unknown as T;
      }
    }

    if (segments.length === 2) {
      const id = segments[1];
      const user = users.find((u) => u.id === id);

      if (method === 'PUT') {
        if (!user) throw new Error('User not found');
        const updated = { ...user, ...body };
        users = users.map((u) => (u.id === id ? updated : u));
        setStored(USERS_KEY, users);
        return updated as unknown as T;
      }
    }
  }

  throw new Error(`Unhandled mock endpoint: ${method} ${endpoint}`);
}
