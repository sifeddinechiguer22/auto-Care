import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { RepairsPage } from './pages/RepairsPage';
import { ServicesPage } from './pages/ServicesPage';
import { PartsPage } from './pages/PartsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { UsersPage } from './pages/UsersPage';
import { Sidebar } from './components/navigation/Sidebar';
import { TopNavbar } from './components/navigation/TopNavbar';
import { NotificationDrawer, NotificationItem } from './components/navigation/NotificationDrawer';
import { AppointmentFormModal } from './components/appointments/AppointmentFormModal';
import { RepairFormModal } from './components/repairs/RepairFormModal';
import {
  clientsService,
  vehiclesService,
  appointmentsService,
  repairsService,
  servicesService,
  partsService,
  invoicesService,
  paymentsService,
  expensesService,
  usersService,
  dashboardService,
} from './services/api';
import {
  Client,
  Vehicle,
  Appointment,
  Repair,
  Service,
  Part,
  Invoice,
  Payment,
  Expense,
  User,
  DashboardMetrics,
} from './types';

const GarageApp: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, role, user } = useAuth();
  const { showToast } = useToast();

  // Navigation State
  const [currentSection, setCurrentSection] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Entities Data
  const [clients, setClients] = useState<Client[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [repairs, setRepairs] = useState<Repair[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);

  // Quick Action Modals
  const [quickAppointmentOpen, setQuickAppointmentOpen] = useState(false);
  const [quickRepairOpen, setQuickRepairOpen] = useState(false);
  const [targetClientId, setTargetClientId] = useState<string | undefined>();
  const [targetVehicleId, setTargetVehicleId] = useState<string | undefined>();
  const [repairToInvoice, setRepairToInvoice] = useState<Repair | null>(null);
  const [invoiceToPay, setInvoiceToPay] = useState<string | undefined>();
  const [selectedRepairToView, setSelectedRepairToView] = useState<Repair | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Fetch all data
  const loadAllData = useCallback(async () => {
    if (!isAuthenticated || !role) return;

    try {
      const [
        clientsData,
        vehiclesData,
        appointmentsData,
        repairsData,
        servicesData,
        partsData,
        invoicesData,
        paymentsData,
        expensesData,
        usersData,
        metricsData,
      ] = await Promise.all([
        clientsService.getAll(),
        vehiclesService.getAll(),
        appointmentsService.getAll(),
        repairsService.getAll(),
        servicesService.getAll(),
        partsService.getAll(),
        invoicesService.getAll(),
        paymentsService.getAll(),
        role === 'ADMIN' ? expensesService.getAll() : Promise.resolve([]),
        role === 'ADMIN' ? usersService.getAll() : Promise.resolve([]),
        dashboardService.getMetrics(role),
      ]);

      setClients(clientsData);
      setVehicles(vehiclesData);
      setAppointments(appointmentsData);
      setRepairs(repairsData);
      setServices(servicesData);
      setParts(partsData);
      setInvoices(invoicesData);
      setPayments(paymentsData);
      setExpenses(expensesData);
      setUsers(usersData);
      setMetrics(metricsData);

      // Build live garage notifications
      const alerts: NotificationItem[] = [];
      const todayStr = new Date().toISOString().split('T')[0];

      // Low stock parts
      const lowStock = partsData.filter((p) => p.current_stock <= p.minimum_stock);
      lowStock.forEach((p) => {
        alerts.push({
          id: `notif-part-${p.id}`,
          title: `Alerte Stock Bas : ${p.name}`,
          message: `Il ne reste que ${p.current_stock} unité(s) en stock (seuil d'alerte : ${p.minimum_stock}).`,
          time: 'Alerte',
          type: 'stock',
          read: false,
          linkSection: 'parts',
        });
      });

      // Today's appointments
      const todayApps = appointmentsData.filter((a) => a.date === todayStr);
      todayApps.forEach((a) => {
        alerts.push({
          id: `notif-app-${a.id}`,
          title: `Rendez-vous : ${a.reason}`,
          message: `${a.time_slot} · ${a.client?.first_name || 'Client'} (${a.vehicle?.registration_number || 'Véhicule'})`,
          time: "Aujourd'hui",
          type: 'appointment',
          read: false,
          linkSection: 'appointments',
        });
      });

      // Unpaid invoices
      const dueInvoices = invoicesData.filter((i) => i.remaining_amount > 0);
      if (dueInvoices.length > 0) {
        alerts.push({
          id: 'notif-invoices-due',
          title: `${dueInvoices.length} Facture(s) en Attente de Paiement`,
          message: `Total des créances restant dues : ${dueInvoices
            .reduce((acc, curr) => acc + curr.remaining_amount, 0)
            .toFixed(2)} €`,
          time: 'Facturation',
          type: 'invoice',
          read: false,
          linkSection: 'invoices',
        });
      }

      setNotifications(alerts);
    } catch (err: any) {
      console.error('Erreur lors du chargement des données garage :', err);
    }
  }, [isAuthenticated, role]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Role security guard: redirect Garagiste if trying to access Admin-only pages
  useEffect(() => {
    if (role === 'GARAGISTE') {
      if (currentSection === 'users' || currentSection === 'expenses' || currentSection === 'parts') {
        setCurrentSection('dashboard');
        showToast('Accès restreint : cette rubrique requiert les droits Direction / Gérant', 'warning');
      }
    }
  }, [role, currentSection, showToast]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-xs font-mono">Initialisation du Système Garage AutoCare...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Handlers for CRUD Operations
  const handleCreateClient = async (data: Omit<Client, 'id' | 'created_at'>) => {
    await clientsService.create(data);
    showToast('Fiche client créée avec succès', 'success');
    await loadAllData();
  };

  const handleUpdateClient = async (id: string, data: Partial<Client>) => {
    await clientsService.update(id, data);
    showToast('Fiche client mise à jour', 'success');
    await loadAllData();
  };

  const handleDeleteClient = async (id: string) => {
    await clientsService.delete(id);
    showToast('Client supprimé du répertoire', 'info');
    await loadAllData();
  };

  const handleCreateVehicle = async (data: Omit<Vehicle, 'id' | 'created_at'>) => {
    await vehiclesService.create(data);
    showToast('Véhicule enregistré dans le parc de l’atelier', 'success');
    await loadAllData();
  };

  const handleUpdateVehicle = async (id: string, data: Partial<Vehicle>) => {
    await vehiclesService.update(id, data);
    showToast('Caractéristiques du véhicule actualisées', 'success');
    await loadAllData();
  };

  const handleDeleteVehicle = async (id: string) => {
    await vehiclesService.delete(id);
    showToast('Véhicule retiré du parc', 'info');
    await loadAllData();
  };

  const handleCreateAppointment = async (data: Omit<Appointment, 'id' | 'created_at' | 'client' | 'vehicle'>) => {
    await appointmentsService.create(data);
    showToast('Rendez-vous atelier planifié avec succès', 'success');
    await loadAllData();
  };

  const handleUpdateAppointment = async (id: string, data: Partial<Appointment>) => {
    await appointmentsService.update(id, data);
    showToast('Rendez-vous mis à jour', 'success');
    await loadAllData();
  };

  const handleDeleteAppointment = async (id: string) => {
    await appointmentsService.delete(id);
    showToast('Rendez-vous annulé', 'info');
    await loadAllData();
  };

  const handleCreateRepair = async (data: Omit<Repair, 'id' | 'created_at' | 'vehicle' | 'client'>) => {
    await repairsService.create(data);
    showToast('Ordre de réparation ouvert sur un pont', 'success');
    await loadAllData();
  };

  const handleUpdateRepair = async (id: string, data: Partial<Repair>) => {
    await repairsService.update(id, data);
    showToast('Ordre de réparation actualisé', 'success');
    await loadAllData();
  };

  const handleCreateService = async (data: Omit<Service, 'id' | 'created_at'>) => {
    await servicesService.create(data);
    showToast('Prestation ajoutée au catalogue atelier', 'success');
    await loadAllData();
  };

  const handleUpdateService = async (id: string, data: Partial<Service>) => {
    await servicesService.update(id, data);
    showToast('Prestation mise à jour', 'success');
    await loadAllData();
  };

  const handleDeleteService = async (id: string) => {
    await servicesService.delete(id);
    showToast('Prestation retirée du catalogue', 'info');
    await loadAllData();
  };

  const handleCreatePart = async (data: Omit<Part, 'id' | 'created_at'>) => {
    await partsService.create(data);
    showToast('Référence pièce enregistrée en stock', 'success');
    await loadAllData();
  };

  const handleUpdatePart = async (id: string, data: Partial<Part>) => {
    await partsService.update(id, data);
    showToast('Fiche de stock mise à jour', 'success');
    await loadAllData();
  };

  const handleDeletePart = async (id: string) => {
    await partsService.delete(id);
    showToast('Référence de pièce supprimée', 'info');
    await loadAllData();
  };

  const handleCreateInvoice = async (data: any) => {
    await invoicesService.create(data);
    showToast('Facture client émise avec succès', 'success');
    await loadAllData();
  };

  const handleCreatePayment = async (data: Omit<Payment, 'id' | 'created_at'>) => {
    await paymentsService.create(data);
    showToast('Règlement enregistré et encaissé', 'success');
    await loadAllData();
  };

  const handleCreateExpense = async (data: Omit<Expense, 'id' | 'created_at'>) => {
    await expensesService.create(data);
    showToast('Charge d’atelier enregistrée', 'success');
    await loadAllData();
  };

  const handleCreateUser = async (data: Omit<User, 'id' | 'created_at'>) => {
    await usersService.create(data);
    showToast('Compte collaborateur créé', 'success');
    await loadAllData();
  };

  const handleUpdateUser = async (id: string, data: Partial<User>) => {
    await usersService.update(id, data);
    showToast('Profil collaborateur mis à jour', 'success');
    await loadAllData();
  };

  // Cross-entity shortcuts
  const handleAddVehicleForClient = (cId: string) => {
    setTargetClientId(cId);
    setCurrentSection('vehicles');
  };

  const handleBookAppointmentForClient = (cId: string) => {
    setTargetClientId(cId);
    setQuickAppointmentOpen(true);
  };

  const handleBookAppointmentForVehicle = (vId: string) => {
    setTargetVehicleId(vId);
    setQuickAppointmentOpen(true);
  };

  const handleCreateRepairForVehicle = (vId: string) => {
    setTargetVehicleId(vId);
    setQuickRepairOpen(true);
  };

  const handleGenerateInvoiceFromRepair = (repair: Repair) => {
    setRepairToInvoice(repair);
    setCurrentSection('invoices');
  };

  const handleRecordPaymentForInvoice = (invoiceId: string) => {
    setInvoiceToPay(invoiceId);
    setCurrentSection('payments');
  };

  // Active repair count & today's count for badges
  const todayCount = appointments.filter((a) => a.date === new Date().toISOString().split('T')[0]).length;
  const activeRepairsCount = repairs.filter((r) => r.status !== 'COMPLETED' && r.status !== 'DELIVERED').length;
  const lowStockCount = parts.filter((p) => p.current_stock <= p.minimum_stock).length;
  const unpaidCount = invoices.filter((i) => i.remaining_amount > 0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={setCurrentSection}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        metricsCounts={{
          todayAppointments: todayCount,
          activeRepairs: activeRepairsCount,
          lowStock: lowStockCount,
          unpaidInvoices: unpaidCount,
        }}
      />

      {/* Main App Container */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Navbar */}
        <TopNavbar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          currentSection={currentSection}
          onOpenNotifications={() => setNotificationDrawerOpen(true)}
          unreadNotificationsCount={notifications.filter((n) => !n.read).length}
          onQuickAction={(action) => {
            if (action === 'appointment') setQuickAppointmentOpen(true);
            if (action === 'repair') setQuickRepairOpen(true);
          }}
          onNavigate={setCurrentSection}
        />

        {/* Dynamic Section Content */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
          {currentSection === 'dashboard' && (
            <DashboardPage
              metrics={metrics}
              appointments={appointments}
              repairs={repairs}
              parts={parts}
              invoices={invoices}
              onNavigate={setCurrentSection}
              onOpenAppointmentModal={() => setQuickAppointmentOpen(true)}
              onOpenRepairModal={() => setQuickRepairOpen(true)}
              onSelectRepair={(rep) => {
                setSelectedRepairToView(rep);
                setCurrentSection('repairs');
              }}
            />
          )}

          {currentSection === 'clients' && (
            <ClientsPage
              clients={clients}
              vehicles={vehicles}
              appointments={appointments}
              repairs={repairs}
              onCreateClient={handleCreateClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              onAddVehicleForClient={handleAddVehicleForClient}
              onBookAppointmentForClient={handleBookAppointmentForClient}
            />
          )}

          {currentSection === 'vehicles' && (
            <VehiclesPage
              vehicles={vehicles}
              clients={clients}
              repairs={repairs}
              appointments={appointments}
              onCreateVehicle={handleCreateVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onCreateRepairForVehicle={handleCreateRepairForVehicle}
              onBookAppointmentForVehicle={handleBookAppointmentForVehicle}
            />
          )}

          {currentSection === 'appointments' && (
            <AppointmentsPage
              appointments={appointments}
              clients={clients}
              vehicles={vehicles}
              onCreateAppointment={handleCreateAppointment}
              onUpdateAppointment={handleUpdateAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              initialClientId={targetClientId}
              initialVehicleId={targetVehicleId}
            />
          )}

          {currentSection === 'repairs' && (
            <RepairsPage
              repairs={repairs}
              vehicles={vehicles}
              clients={clients}
              mechanics={role === 'ADMIN' ? users : users.filter((u) => u.id === user?.id)}
              servicesCatalog={services}
              partsInventory={parts}
              onCreateRepair={handleCreateRepair}
              onUpdateRepair={handleUpdateRepair}
              onGenerateInvoiceFromRepair={handleGenerateInvoiceFromRepair}
              initialVehicleId={targetVehicleId}
              selectedRepairToView={selectedRepairToView}
              onClearSelectedRepair={() => setSelectedRepairToView(null)}
            />
          )}

          {currentSection === 'services' && (
            <ServicesPage
              services={services}
              onCreateService={handleCreateService}
              onUpdateService={handleUpdateService}
              onDeleteService={handleDeleteService}
            />
          )}

          {currentSection === 'parts' && role === 'ADMIN' && (
            <PartsPage
              parts={parts}
              onCreatePart={handleCreatePart}
              onUpdatePart={handleUpdatePart}
              onDeletePart={handleDeletePart}
            />
          )}

          {currentSection === 'invoices' && (
            <InvoicesPage
              invoices={invoices}
              clients={clients}
              vehicles={vehicles}
              repairs={repairs}
              onCreateInvoice={handleCreateInvoice}
              onRecordPaymentForInvoice={handleRecordPaymentForInvoice}
              initialRepairToInvoice={repairToInvoice}
              onClearInitialRepair={() => setRepairToInvoice(null)}
            />
          )}

          {currentSection === 'payments' && (
            <PaymentsPage
              payments={payments}
              invoices={invoices}
              onCreatePayment={handleCreatePayment}
              initialInvoiceIdForPayment={invoiceToPay}
              onClearInitialInvoiceId={() => setInvoiceToPay(undefined)}
            />
          )}

          {currentSection === 'expenses' && role === 'ADMIN' && (
            <ExpensesPage
              expenses={expenses}
              onCreateExpense={handleCreateExpense}
            />
          )}

          {currentSection === 'users' && role === 'ADMIN' && (
            <UsersPage
              users={users}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
            />
          )}
        </main>
      </div>

      {/* Global Quick Action: Book Appointment Modal */}
      <AppointmentFormModal
        isOpen={quickAppointmentOpen}
        onClose={() => {
          setQuickAppointmentOpen(false);
          setTargetClientId(undefined);
          setTargetVehicleId(undefined);
        }}
        onSubmit={async (data) => {
          await handleCreateAppointment(data);
          setQuickAppointmentOpen(false);
          setTargetClientId(undefined);
          setTargetVehicleId(undefined);
        }}
        clients={clients}
        vehicles={vehicles}
        initialClientId={targetClientId}
        initialVehicleId={targetVehicleId}
      />

      {/* Global Quick Action: Create Repair Order Modal */}
      <RepairFormModal
        isOpen={quickRepairOpen}
        onClose={() => {
          setQuickRepairOpen(false);
          setTargetVehicleId(undefined);
        }}
        onSubmit={async (data) => {
          await handleCreateRepair(data);
          setQuickRepairOpen(false);
          setTargetVehicleId(undefined);
        }}
        vehicles={vehicles}
        clients={clients}
        mechanics={users.length > 0 ? users : user ? [user] : []}
        servicesCatalog={services}
        partsInventory={parts}
        initialVehicleId={targetVehicleId}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => {
          setNotifications(
            notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
          );
        }}
        onNavigate={(sec) => setCurrentSection(sec)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <GarageApp />
      </AuthProvider>
    </ToastProvider>
  );
}
