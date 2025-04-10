/// <reference types="cypress" />
describe('File Uploader E2E Tests', () => {
	// Before each test, visit the app's URL
	beforeEach(() => {
		cy.visit('/'); // Adjust this if your app is hosted on a different path
	});

	it('should display the heading and "No tasks submitted" message on load', () => {
		cy.contains('File Uploader').should('be.visible');
		cy.contains('No tasks submitted').should('be.visible');
	});

	it('should show an alert when uploading a file over 2MB', () => {
		// Stub the window alert to capture the alert message
		cy.window().then(win => {
			cy.stub(win, 'alert').as('alertStub');
		});

		// Create a dummy file larger than 2MB (e.g., 3MB)
		const bigFile = createFile('test.pdf', 3 * 1024 * 1024, 'application/pdf');

		// Upload the file by interacting with the hidden file input through its label
		cy.get('input[type="file"]').attachFile({
			fileContent: bigFile,
			fileName: 'large.pdf',
			mimeType: 'application/pdf'
		});

		// Verify that the alert was called with the expected message
		cy.get('@alertStub').should('have.been.calledWith', 'File size must be less than 2MB');
	});

	it('should submit a valid file and display it in the task list', () => {
		// Create a valid file (<2MB) - e.g., a 100KB file
		const validFile = createFile('test.pdf', 100 * 1024, 'application/pdf');

		// Attach the valid file using the custom file input label
		cy.get('input[type="file"]').attachFile({
			fileContent: validFile,
			fileName: 'test.pdf',
			mimeType: 'application/pdf'
		});

		// Click the "Submit File" button
		cy.contains('Submit File').click();

		// Verify that the task list now contains the submitted task.
		// We assume that the task text includes the file name and "pending" status.
		cy.contains('test.pdf').should('be.visible');
		cy.contains(/Status:\s*pending/i).should('be.visible');
	});

	it('should allow cancelling a pending task', () => {
		// Create a valid file (<2MB)
		const validFile = createFile('test.pdf', 100 * 1024, 'application/pdf');
		// Upload the valid file
		cy.get('input[type="file"]').attachFile({
			fileContent: validFile,
			fileName: 'cancel.pdf',
			mimeType: 'application/pdf'
		});

		// Submit the file
		cy.contains('Submit File').click();

		// Wait for the task to appear in the task list
		cy.contains('cancel.pdf').should('be.visible');

		// For a pending task, a "Cancel Task" button should be available.
		cy.contains('Cancel Task').click();

		// Verify that the task status updates to "cancelled"
		cy.contains(/Status:\s*cancelled/i).should('be.visible');
	});
});

const createFile = (name: string, size: number, type: string): File => {
	// Create a Uint8Array filled with zeros (or random bytes if you prefer)
	const data = new Uint8Array(size);
	// If you want to fill with random data, you might do:
	// window.crypto.getRandomValues(data);
	return new File([data], name, { type });
};
export {};
