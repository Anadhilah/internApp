import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type InternProfile = Tables['intern_profiles']['Row'];
type EmployerProfile = Tables['employer_profiles']['Row'];

// Enhanced error handling for auth operations
class AuthError extends Error {
  constructor(message: string, public code?: string, public originalError?: any) {
    super(message);
    this.name = 'AuthError';
  }
}

const handleAuthError = (error: any, operation: string) => {
  console.error(`Auth error during ${operation}:`, error);
  
  // Map common Supabase auth errors to user-friendly messages
  const errorMessages: Record<string, string> = {
    'invalid_credentials': 'Invalid email or password',
    'email_not_confirmed': 'Please check your email and click the confirmation link',
    'signup_disabled': 'New registrations are currently disabled',
    'email_address_invalid': 'Please enter a valid email address',
    'password_too_short': 'Password must be at least 6 characters long',
    'user_already_registered': 'An account with this email already exists',
    'weak_password': 'Password is too weak. Please choose a stronger password',
    'rate_limit_exceeded': 'Too many attempts. Please try again later'
  };

  const message = errorMessages[error?.message] || error?.message || `Failed to ${operation}`;
  throw new AuthError(message, error?.message, error);
};

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  user_type: 'intern' | 'employer';
  company_name?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface UserProfile {
  user: User;
  intern_profile?: InternProfile;
  employer_profile?: EmployerProfile;
}

export const authService = {
  /**
   * Sign up a new user with profile creation
   */
  async signUp(data: SignUpData): Promise<{ user: any; profile: User }> {
    if (!supabase) throw new AuthError('Authentication service not available');
    
    try {
      console.log('Starting signup process for:', data.email, data.user_type);

      // Validate input data
      if (!data.email || !data.password || !data.name) {
        throw new AuthError('Email, password, and name are required');
      }

      if (data.password.length < 6) {
        throw new AuthError('Password must be at least 6 characters long');
      }

      if (data.user_type === 'employer' && !data.company_name) {
        throw new AuthError('Company name is required for employer accounts');
      }

      // Create auth user with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            user_type: data.user_type,
            company_name: data.company_name,
            phone: data.phone
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        handleAuthError(authError, 'create account');
      }

      if (!authData.user) {
        throw new AuthError('Failed to create user account');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Wait for trigger to create profile
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get the created user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new AuthError('Account created but profile setup failed');
      }

      console.log('User profile created successfully:', userProfile);

      return { user: authData.user, profile: userProfile };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      handleAuthError(error, 'create account');
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInData): Promise<{ user: any; profile: UserProfile }> {
    if (!supabase) throw new AuthError('Authentication service not available');
    
    try {
      console.log('Starting signin process for:', data.email);

      // Validate input
      if (!data.email || !data.password) {
        throw new AuthError('Email and password are required');
      }

      // Sign in with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (authError) {
        console.error('Auth signin error:', authError);
        handleAuthError(authError, 'sign in');
      }

      if (!authData.user) {
        throw new AuthError('Sign in failed');
      }

      console.log('Auth signin successful:', authData.user.id);

      // Get user profile with related data
      const profile = await this.getUserProfile(authData.user.id);
      
      if (!profile) {
        throw new AuthError('User profile not found');
      }

      // Create session tracking
      if (authData.session) {
        try {
          await supabase.rpc('create_user_session', {
            user_auth_id: authData.user.id,
            session_token: authData.session.access_token,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        } catch (sessionError) {
          console.warn('Failed to create session record:', sessionError);
          // Don't fail the login for session tracking errors
        }
      }

      return { user: authData.user, profile };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      handleAuthError(error, 'sign in');
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    if (!supabase) throw new AuthError('Authentication service not available');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        handleAuthError(error, 'sign out');
      }
    } catch (error) {
      handleAuthError(error, 'sign out');
    }
  },

  /**
   * Get current authenticated user with profile
   */
  async getCurrentUser(): Promise<{ user: any; profile: UserProfile | null }> {
    if (!supabase) {
      // Return null for mock auth - this is expected behavior
      return { user: null, profile: null };
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        // Don't throw error for missing session - just return null
        if (error.message === 'Auth session missing!') {
          return { user: null, profile: null };
        }
        handleAuthError(error, 'get current user');
      }
      
      if (!user) {
        return { user: null, profile: null };
      }

      const profile = await this.getUserProfile(user.id);
      return { user, profile };
    } catch (error) {
      if (error instanceof AuthError) throw error;
      // For any other errors, just return null instead of throwing
      console.warn('Error getting current user:', error);
      return { user: null, profile: null };
    }
  },

  /**
   * Get user profile with related data
   */
  async getUserProfile(authUserId: string): Promise<UserProfile | null> {
    if (!supabase) return null;
    
    try {
      // Get base user data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (userError || !user) {
        console.error('User not found:', userError);
        return null;
      }

      const profile: UserProfile = { user };

      // Get extended profile based on user type
      if (user.user_type === 'intern') {
        const { data: internProfile } = await supabase
          .from('intern_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (internProfile) {
          profile.intern_profile = internProfile;
        }
      } else if (user.user_type === 'employer') {
        const { data: employerProfile } = await supabase
          .from('employer_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (employerProfile) {
          profile.employer_profile = employerProfile;
        }
      }

      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!supabase) throw new AuthError('Authentication service not available');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AuthError('Not authenticated');

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('auth_user_id', user.id)
        .select()
        .single();

      if (error) {
        handleAuthError(error, 'update profile');
      }

      return data;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      handleAuthError(error, 'update profile');
    }
  },

  /**
   * Update intern profile
   */
  async updateInternProfile(updates: Partial<InternProfile>): Promise<InternProfile> {
    if (!supabase) throw new AuthError('Authentication service not available');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AuthError('Not authenticated');

      // Get user ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) throw new AuthError('User profile not found');

      const { data, error } = await supabase
        .from('intern_profiles')
        .update(updates)
        .eq('user_id', userData.id)
        .select()
        .single();

      if (error) {
        handleAuthError(error, 'update intern profile');
      }

      return data;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      handleAuthError(error, 'update intern profile');
    }
  },

  /**
   * Update employer profile
   */
  async updateEmployerProfile(updates: Partial<EmployerProfile>): Promise<EmployerProfile> {
    if (!supabase) throw new AuthError('Authentication service not available');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new AuthError('Not authenticated');

      // Get user ID
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', user.id)
        .single();

      if (!userData) throw new AuthError('User profile not found');

      const { data, error } = await supabase
        .from('employer_profiles')
        .update(updates)
        .eq('user_id', userData.id)
        .select()
        .single();

      if (error) {
        handleAuthError(error, 'update employer profile');
      }

      return data;
    } catch (error) {
      if (error instanceof AuthError) throw error;
      handleAuthError(error, 'update employer profile');
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    if (!supabase) throw new AuthError('Authentication service not available');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        handleAuthError(error, 'request password reset');
      }
    } catch (error) {
      handleAuthError(error, 'request password reset');
    }
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<void> {
    if (!supabase) throw new AuthError('Authentication service not available');
    
    try {
      if (newPassword.length < 6) {
        throw new AuthError('Password must be at least 6 characters long');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        handleAuthError(error, 'update password');
      }
    } catch (error) {
      if (error instanceof AuthError) throw error;
      handleAuthError(error, 'update password');
    }
  },

  /**
   * Resend email confirmation
   */
  async resendConfirmation(email: string): Promise<void> {
    if (!supabase) throw new AuthError('Authentication service not available');
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) {
        handleAuthError(error, 'resend confirmation');
      }
    } catch (error) {
      handleAuthError(error, 'resend confirmation');
    }
  },

  /**
   * Check if user has admin access
   */
  async checkAdminAccess(): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('admin_users')
        .select('id')
        .eq('user_id', user.id)
        .single();

      return !!data;
    } catch (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
  },

  /**
   * Validate session token
   */
  async validateSession(token: string): Promise<boolean> {
    if (!supabase) return false;
    
    try {
      const { data } = await supabase.rpc('validate_session', { token });
      return data?.[0]?.session_valid || false;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }
};