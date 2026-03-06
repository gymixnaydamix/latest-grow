/* LoginPage component tests */
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../setup/test-utils';
import { LoginPage } from '../../../views/auth/LoginPage';

// Mock auth store
const mockLogin = jest.fn();
const mockClearError = jest.fn();
jest.mock('../../../store/auth.store', () => ({
  useAuthStore: () => ({
    login: mockLogin,
    isLoading: false,
    error: null,
    clearError: mockClearError,
  }),
}));

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null, pathname: '/login', search: '', hash: '', key: 'default' }),
  };
});

beforeEach(() => jest.clearAllMocks());

describe('LoginPage', () => {
  it('renders the login form', () => {
    renderWithProviders(React.createElement(LoginPage));
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('renders sign-in button', () => {
    renderWithProviders(React.createElement(LoginPage));
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('allows user to type email and password', async () => {
    const user = userEvent.setup();
    renderWithProviders(React.createElement(LoginPage));
    const emailInput = screen.getByLabelText(/email/i);
    const pwInput = screen.getByLabelText(/password/i);
    await user.type(emailInput, 'test@school.edu');
    await user.type(pwInput, 'secret123');
    expect(emailInput).toHaveValue('test@school.edu');
    expect(pwInput).toHaveValue('secret123');
  });

  it('calls login on form submit', async () => {
    mockLogin.mockResolvedValueOnce(undefined);
    const user = userEvent.setup();
    renderWithProviders(React.createElement(LoginPage));
    await user.type(screen.getByLabelText(/email/i), 'admin@greenfield.edu');
    await user.type(screen.getByLabelText(/password/i), 'demo123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockLogin).toHaveBeenCalledWith('admin@greenfield.edu', 'demo123');
  });

  it('has a link to register page', () => {
    renderWithProviders(React.createElement(LoginPage));
    expect(screen.getByText(/sign up/i)).toBeInTheDocument();
  });

  it('renders the GROW branding', () => {
    renderWithProviders(React.createElement(LoginPage));
    expect(screen.getByText(/GROW/)).toBeInTheDocument();
  });
});
