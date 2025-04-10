import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders File Uploader heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/File Uploader/i);
  expect(headingElement).toBeInTheDocument();
});

test('shows "No tasks submitted" when there are no tasks', () => {
  render(<App />);
  const infoElement = screen.getByText(/No tasks submitted/i);
  expect(infoElement).toBeInTheDocument();
});
