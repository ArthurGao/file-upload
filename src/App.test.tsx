import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import App from './App';

// A helper to create a dummy file with given size (in bytes)
const createFile = (name: string, size: number, type: string) => {
	const blob = new Blob([new ArrayBuffer(size)], {type});
	return new File([blob], name, {type});
};

beforeEach(() => {
	jest.spyOn(window, 'alert').mockImplementation(() => {
	});
});

afterEach(() => {
	jest.restoreAllMocks();
});

test('renders File Uploader heading', () => {
	render(<App/>);
	const headingElement = screen.getByText(/File Uploader/i);
	expect(headingElement).toBeInTheDocument();
});

test('shows "No tasks submitted" when there are no tasks', () => {
	render(<App/>);
	const infoElement = screen.getByText(/No tasks submitted/i);
	expect(infoElement).toBeInTheDocument();
});

test('shows alert when uploading file over 2MB', async () => {
	render(<App/>);
	// Create file greater than 2MB (say, 3MB)
	const largeFile = createFile('large.pdf', 3 * 1024 * 1024, 'application/pdf');

	// Since the file input is hidden, get it via its id
	// eslint-disable-next-line testing-library/no-node-access
	const fileInput = document.getElementById('file-input') as HTMLInputElement;
	// Fire change event with our oversized file
	fireEvent.change(fileInput, {target: {files: [largeFile]}});

	expect(window.alert).toHaveBeenCalledWith('File size must be less than 2MB');
});
