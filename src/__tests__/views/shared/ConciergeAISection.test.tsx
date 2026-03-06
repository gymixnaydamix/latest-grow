/* ConciergeAISection component tests */
import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../setup/test-utils';
import { ConciergeAISection } from '../../../views/shared/sections/ConciergeAISection';

// ── Mocks ──
const mockNavigationState = {
  activeHeader: '' as string,
  activeSubNav: '' as string,
  section: 'concierge_ai',
  setActiveHeader: jest.fn(),
  setActiveSubNav: jest.fn(),
  setSection: jest.fn(),
  currentPath: '/concierge',
  setCurrentPath: jest.fn(),
};

jest.mock('../../../store/navigation.store', () => ({
  useNavigationStore: () => mockNavigationState,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigationState.activeHeader = '';
  mockNavigationState.activeSubNav = '';
});

describe('ConciergeAISection', () => {
  it('renders AssistantView by default', () => {
    renderWithProviders(React.createElement(ConciergeAISection));

    expect(screen.getByText('AI Assistant')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ask the AI assistant anything…')).toBeInTheDocument();
  });

  it('shows chat history messages in AssistantView', () => {
    renderWithProviders(React.createElement(ConciergeAISection));

    expect(screen.getByText(/What is the average attendance rate for Grade 10 this month/)).toBeInTheDocument();
    expect(screen.getByText(/96\.2%.*higher than the school-wide average/)).toBeInTheDocument();
    expect(screen.getByText(/Emily Watson/)).toBeInTheDocument();
  });

  it('allows typing in the chat input', async () => {
    const user = userEvent.setup();
    renderWithProviders(React.createElement(ConciergeAISection));

    const input = screen.getByPlaceholderText('Ask the AI assistant anything…');
    await user.type(input, 'Hello AI');
    expect(input).toHaveValue('Hello AI');
  });

  it('renders AIAnalyticsView when activeHeader is ai_analytics', () => {
    mockNavigationState.activeHeader = 'ai_analytics';
    renderWithProviders(React.createElement(ConciergeAISection));

    expect(screen.getByText('AI Analytics')).toBeInTheDocument();
    expect(screen.getByText('Queries Today')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();
    expect(screen.getByText('Top Query Categories')).toBeInTheDocument();
  });

  it('renders OperationsView when activeHeader is operations', () => {
    mockNavigationState.activeHeader = 'operations';
    renderWithProviders(React.createElement(ConciergeAISection));

    expect(screen.getByText(/AI Operations/)).toBeInTheDocument();
    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
    expect(screen.getByText('Memory')).toBeInTheDocument();
  });

  it('renders DevelopmentView with tool grid when activeHeader is development', () => {
    mockNavigationState.activeHeader = 'development';
    renderWithProviders(React.createElement(ConciergeAISection));

    expect(screen.getByText('AI Development Tools')).toBeInTheDocument();
    expect(screen.getByText('Code Generator')).toBeInTheDocument();
    expect(screen.getByText('DB Schema Helper')).toBeInTheDocument();
  });

  it('renders AISettingsView when activeHeader is ai_settings', () => {
    mockNavigationState.activeHeader = 'ai_settings';
    renderWithProviders(React.createElement(ConciergeAISection));

    expect(screen.getByText(/AI Settings/)).toBeInTheDocument();
    expect(screen.getByText('Model Configuration')).toBeInTheDocument();
    expect(screen.getByText('Data Sources')).toBeInTheDocument();
  });

  it('renders BudgetPredictorView when activeHeader is budget_predictor', () => {
    mockNavigationState.activeHeader = 'budget_predictor';
    renderWithProviders(React.createElement(ConciergeAISection));

    expect(screen.getByText('AI Budget Predictor')).toBeInTheDocument();
    expect(screen.getByText('Next Quarter Forecast')).toBeInTheDocument();
    expect(screen.getByText('$312K')).toBeInTheDocument();
    expect(screen.getByText('Run New Forecast')).toBeInTheDocument();
  });

  it('renders CommunityFeedbackView when activeHeader is community_feedback', () => {
    mockNavigationState.activeHeader = 'community_feedback';
    renderWithProviders(React.createElement(ConciergeAISection));

    expect(screen.getByText('Community Feedback AI')).toBeInTheDocument();
    expect(screen.getByText('Overall Sentiment')).toBeInTheDocument();
    expect(screen.getByText('82%')).toBeInTheDocument();
    expect(screen.getByText('Recent Feedback Themes')).toBeInTheDocument();
    expect(screen.getByText(/Parking congestion/)).toBeInTheDocument();
  });

  it('renders DevelopmentView detail when subNav is a specific tool', () => {
    mockNavigationState.activeHeader = 'development';
    mockNavigationState.activeSubNav = 'db_schema';
    renderWithProviders(React.createElement(ConciergeAISection));

    expect(screen.getByText('DB Schema Helper')).toBeInTheDocument();
    expect(screen.getByText('Generate')).toBeInTheDocument();
  });
});
