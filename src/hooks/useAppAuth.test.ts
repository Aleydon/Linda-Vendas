import { act, renderHook, waitFor } from '@testing-library/react-native';

import { supabase } from '@/lib/supabase';

import { useAppAuth } from './useAppAuth';

// Mocking dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } }
      })),
      signInWithOAuth: jest.fn(),
      setSession: jest.fn(),
      signOut: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          maybeSingle: jest.fn()
        })),
        update: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    })),
    channel: jest.fn(() => ({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn()
    })),
    removeChannel: jest.fn()
  }
}));

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'linda-vendas://oauth')
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn()
}));

describe('useAppAuth', () => {
  const mockOnLogin = jest.fn();
  const mockOnLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: null }
    });
  });

  it('should initialize with no user and call onLogout if no session', async () => {
    const { result } = renderHook(() =>
      useAppAuth({ onLogin: mockOnLogin, onLogout: mockOnLogout })
    );

    await waitFor(() => expect(result.current.loadingProfile).toBe(false));

    expect(result.current.user).toBeNull();
    expect(mockOnLogout).toHaveBeenCalled();
  });

  it('should fetch profile and call onLogin if session exists', async () => {
    const mockUser = { id: 'user-123', email: 'test@test.com' };
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { user: mockUser } }
    });

    const mockProfile = { id: 'user-123', role: 'admin' };
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest
        .fn()
        .mockResolvedValue({ data: mockProfile, error: null })
    });

    const { result } = renderHook(() =>
      useAppAuth({ onLogin: mockOnLogin, onLogout: mockOnLogout })
    );

    await waitFor(() => expect(result.current.user).toEqual(mockUser));
    await waitFor(() => expect(result.current.profile).toEqual(mockProfile));
    expect(result.current.isAdmin).toBe(true);
    expect(mockOnLogin).toHaveBeenCalledWith('user-123');
  });

  it('should handle signOut', async () => {
    const { result } = renderHook(() =>
      useAppAuth({ onLogin: mockOnLogin, onLogout: mockOnLogout })
    );

    await act(async () => {
      await result.current.signOut();
    });

    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
