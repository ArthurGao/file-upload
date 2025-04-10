// cypress.config.js
const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
        // Path to your Cypress E2E tests
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
        // Base URL can be set to your development server
        baseUrl: 'http://localhost:3000',
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
});
