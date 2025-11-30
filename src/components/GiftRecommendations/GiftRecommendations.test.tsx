import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  GiftRecommendations,
  GiftRecommendationsProps,
} from './GiftRecommendations';
import * as aiRecommendations from '../../services/aiRecommendations';
import { NotificationsContext } from '../../context/NotificationsContext';

// Mock the AI recommendations service
vi.mock('../../services/aiRecommendations', () => ({
  getGiftRecommendations: vi.fn(),
}));

// Mock postReport
vi.mock('../../utilities/postReport', () => ({
  default: vi.fn(),
}));

// Mock fetchData
vi.mock('../../utilities/fetchData', () => ({
  default: vi.fn(),
}));

// Mock notifications context
const mockAddNotification = vi.fn();
const mockContextValue = {
  notifications: {},
  addNotification: mockAddNotification,
  removeNotification: vi.fn(),
};

describe('GiftRecommendations Component', () => {
  const defaultProps: GiftRecommendationsProps = {
    theiruserid: '123',
    onAddRecommendation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithContext = (props = defaultProps) => {
    return render(
      <NotificationsContext.Provider value={mockContextValue}>
        <GiftRecommendations {...props} />
      </NotificationsContext.Provider>
    );
  };

  it('renders get recommendations button initially', () => {
    renderWithContext();
    expect(screen.getByText('Get AI Gift Recommendations')).toBeInTheDocument();
  });

  it('calls getGiftRecommendations when button is clicked', async () => {
    const mockRecommendations = {
      success: [
        {
          name: 'Test Gift',
          description: 'A test gift description',
          category: 'Electronics',
          reason: 'Based on their interests',
        },
      ],
    };

    vi.mocked(aiRecommendations.getGiftRecommendations).mockResolvedValue(
      mockRecommendations
    );

    renderWithContext();

    const button = screen.getByText('Get AI Gift Recommendations');
    fireEvent.click(button);

    await waitFor(() => {
      expect(aiRecommendations.getGiftRecommendations).toHaveBeenCalledWith(
        '123',
        10
      );
    });
  });

  it('displays recommendations when loaded', async () => {
    const mockRecommendations = {
      success: [
        {
          name: 'Test Gift 1',
          description: 'Description 1',
          category: 'Electronics',
          reason: 'Reason 1',
        },
        {
          name: 'Test Gift 2',
          description: 'Description 2',
          category: 'Books',
        },
      ],
    };

    vi.mocked(aiRecommendations.getGiftRecommendations).mockResolvedValue(
      mockRecommendations
    );

    renderWithContext();

    const button = screen.getByText('Get AI Gift Recommendations');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Test Gift 1')).toBeInTheDocument();
      expect(screen.getByText('Test Gift 2')).toBeInTheDocument();
    });
  });

  it('displays error message when API fails', async () => {
    const mockError = {
      error: 'API Error',
    };

    vi.mocked(aiRecommendations.getGiftRecommendations).mockResolvedValue(
      mockError
    );

    renderWithContext();

    const button = screen.getByText('Get AI Gift Recommendations');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('calls onAddRecommendation when add button is clicked', async () => {
    const mockOnAdd = vi.fn();
    const mockRecommendations = {
      success: [
        {
          name: 'Test Gift',
          description: 'Description',
          category: 'Electronics',
        },
      ],
    };

    vi.mocked(aiRecommendations.getGiftRecommendations).mockResolvedValue(
      mockRecommendations
    );

    renderWithContext({
      ...defaultProps,
      onAddRecommendation: mockOnAdd,
    });

    const button = screen.getByText('Get AI Gift Recommendations');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('Test Gift')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add to List');
    fireEvent.click(addButton);

    expect(mockOnAdd).toHaveBeenCalledWith('Test Gift', 'Description', '');
  });
});
