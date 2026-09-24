describe('AutoCare project-wide Cypress suite', () => {
  const loginAsAdmin = () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.intercept('POST', '**/api/auth/login').as('loginRequest');

    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        win.sessionStorage.clear();
      },
    });

    cy.contains('Connexion').should('be.visible');
    cy.get('input[type="email"]').clear().type('admin@autocare.local');
    cy.get('input[type="password"]').clear().type('Admin123!');
    cy.contains('button', 'Se connecter').click();

    cy.wait('@loginRequest').its('response.statusCode').should('eq', 200);
    cy.contains('Tableau de bord', { timeout: 20000 }).should('be.visible');
    cy.contains('Nouveau RDV').should('be.visible');
  };

  it('connects with the seeded admin account and loads the dashboard', () => {
    loginAsAdmin();
    cy.contains('Poste Direction & Propriétaire', { timeout: 20000 }).should('be.visible');
    cy.contains('Nouveau RDV').should('be.visible');
    cy.contains('Tableau de bord').should('be.visible');
  });

  it('navigates through the main sections of the application as admin', () => {
    loginAsAdmin();

    cy.contains('Clients & Comptes').click();
    cy.contains('Répertoire Clients').should('be.visible');

    cy.contains('Parc Véhicules').click();
    cy.contains('Parc & Immatriculations').should('be.visible');

    cy.contains('Rendez-vous').click();
    cy.contains('Planning & Rendez-vous').should('be.visible');

    cy.contains('Réparations & Ordres').click();
    cy.contains('Ordres de Travail & Réparations').should('be.visible');

    cy.contains('Facturation & Devis').click();
    cy.contains('Facturation & Devis').should('be.visible');
  });

  it('renders the main admin KPI cards after login', () => {
    loginAsAdmin();

    cy.contains('Total Clients').should('be.visible');
    cy.contains('Parc Véhicules').should('be.visible');
    cy.contains('Rendez-vous du Jour').should('be.visible');
    cy.contains('Factures Impayées').should('be.visible');
  });

});
