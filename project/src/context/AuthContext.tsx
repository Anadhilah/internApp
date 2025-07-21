import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { authService, SignUpData, SignInData, UserProfile } from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'intern' | 'organization';
  created_at: string;
  status?: string;
  profile?: UserProfile;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: 'intern' | 'organization') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (supabase && !isUsingMockAuth) {
          // Get current user with profile
          const { user: authUser, profile } = await authService.getCurrentUser();
          
          if (authUser && profile) {
            setUser({
              id: profile.user.id,
              email: profile.user.email,
              name: profile.user.name,
              role: profile.user.user_type === 'employer' ? 'organization' : 'intern',
              created_at: profile.user.created_at,
              status: profile.user.status,
              profile
            });
          }

          // Listen for auth changes
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('Auth state changed:', event, session?.user?.id);
              
              if (session?.user) {
                try {
                  const { profile } = await authService.getCurrentUser();
                  if (profile) {
                    setUser({
                      id: profile.user.id,
                      email: profile.user.email,
                      name: profile.user.name,
                      role: profile.user.user_type === 'employer' ? 'organization' : 'intern',
                      created_at: profile.user.created_at,
                      status: profile.user.status,
                      profile
                    });
                  }
                } catch (error) {
                  console.error('Error fetching user profile after auth change:', error);
                }
              } else {
                setUser(null);
              }
            }
          );

          setLoading(false);
          return () => subscription.unsubscribe();
        } else {
          // Fallback to mock auth for development
          console.log('Using mock authentication - Supabase not configured');
          const { mockAuth } = await import('../services/mockAuth');
          const unsubscribe = mockAuth.onAuthStateChange((mockUser) => {
            setUser(mockUser);
          });
          setLoading(false);
          return unsubscribe;
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Fallback to mock auth if there's any error
        try {
          console.log('Falling back to mock authentication due to error');
          const { mockAuth } = await import('../services/mockAuth');
          const unsubscribe = mockAuth.onAuthStateChange((mockUser) => {
            setUser(mockUser);
          });
          setLoading(false);
          return unsubscribe;
        } catch (mockError) {
          console.error('Mock auth fallback failed:', mockError);
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      if (supabase && !isUsingMockAuth) {
        const result = await authService.signIn({ email, password });
        console.log('Sign in successful:', result);
      } else {
        const { mockAuth } = await import('../services/mockAuth');
        await mockAuth.signIn(email, password);
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      if (supabase && !isUsingMockAuth) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        });
        if (error) throw error;
      } else {
        throw new Error('Google sign in not available in development mode');
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'intern' | 'organization' = 'intern') => {
    try {
      if (supabase && !isUsingMockAuth) {
        const signUpData: SignUpData = {
          email,
          password,
          name, 
          user_type: role === 'organization' ? 'employer' : 'intern'
        };
        const result = await authService.signUp(signUpData);
        console.log('Sign up successful:', result);
      } else {
        const { mockAuth } = await import('../services/mockAuth');
        await mockAuth.signUp(email, password, name, role);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (supabase) {
        await authService.signOut();
      } else {
        const { mockAuth } = await import('../services/mockAuth');
        await mockAuth.signOut();
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any) => {
    try {
      if (supabase && !isUsingMockAuth && user) {
        if (user.role === 'intern') {
          await authService.updateInternProfile(updates);
        } else {
          await authService.updateEmployerProfile(updates);
        }
        // Refresh user data
        const { profile } = await authService.getCurrentUser();
        if (profile) {
          setUser(prev => prev ? { ...prev, profile } : null);
        }
      }
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      if (supabase && !isUsingMockAuth) {
        await authService.requestPasswordReset(email);
      }
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signInWithGoogle, 
      signUp, 
      signOut,
      updateProfile,
      requestPasswordReset
    }}>
      {children}
    </AuthContext.Provider>
  );
};