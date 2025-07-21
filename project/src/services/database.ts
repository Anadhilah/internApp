import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type InternProfile = Tables['intern_profiles']['Row'];
type EmployerProfile = Tables['employer_profiles']['Row'];
type JobListing = Tables['job_listings']['Row'];
type Application = Tables['applications']['Row'];
type Message = Tables['messages']['Row'];
type Review = Tables['reviews']['Row'];

// Enhanced error handling
class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

const handleDatabaseError = (error: any, operation: string) => {
  console.error(`Database error during ${operation}:`, error);
  throw new DatabaseError(`Failed to ${operation}. Please try again.`, error);
};

// User operations
export const userService = {
  async createUser(userData: Tables['users']['Insert']) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'create user');
    }
  },

  async getUserByAuthId(authUserId: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      handleDatabaseError(error, 'get user');
    }
  },

  async updateUser(userId: string, updates: Tables['users']['Update']) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'update user');
    }
  }
};

// Intern profile operations
export const internProfileService = {
  async createProfile(profileData: Tables['intern_profiles']['Insert']) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('intern_profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'create intern profile');
    }
  },

  async getProfile(userId: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('intern_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      handleDatabaseError(error, 'get intern profile');
    }
  },

  async updateProfile(userId: string, updates: Tables['intern_profiles']['Update']) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('intern_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'update intern profile');
    }
  },

  async getAllProfiles() {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('intern_profiles')
        .select(`
          *,
          users (
            id,
            name,
            email,
            profile_picture
          )
        `);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'get all intern profiles');
    }
  }
};

// Employer profile operations
export const employerProfileService = {
  async createProfile(profileData: Tables['employer_profiles']['Insert']) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'create employer profile');
    }
  },

  async getProfile(userId: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      if (error instanceof DatabaseError) throw error;
      handleDatabaseError(error, 'get employer profile');
    }
  },

  async updateProfile(userId: string, updates: Tables['employer_profiles']['Update']) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('employer_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'update employer profile');
    }
  }
};

// Job listing operations with real-time subscriptions
export const jobListingService = {
  async createJobListing(jobData: Tables['job_listings']['Insert']) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .insert(jobData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'create job listing');
    }
  },

  async getAllJobListings() {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select(`
          *,
          employer_profiles (
            company_name,
            logo_url
          )
        `)
        .eq('status', 'active')
        .order('posted_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'get job listings');
    }
  },

  async getJobListingsByEmployer(employerId: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .select('*')
        .eq('employer_id', employerId)
        .order('posted_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'get employer job listings');
    }
  },

  async updateJobListing(jobId: string, updates: Tables['job_listings']['Update']) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('job_listings')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'update job listing');
    }
  },

  async deleteJobListing(jobId: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { error } = await supabase
        .from('job_listings')
        .delete()
        .eq('id', jobId);
      
      if (error) throw error;
    } catch (error) {
      handleDatabaseError(error, 'delete job listing');
    }
  },

  // Real-time subscription for job listings
  subscribeToJobListings(callback: (payload: any) => void) {
    if (!supabase) return () => {};
    
    const subscription = supabase
      .channel('job_listings_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'job_listings' },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
};

// Application operations with real-time subscriptions
export const applicationService = {
  async createApplication(applicationData: Tables['applications']['Insert']) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert(applicationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'create application');
    }
  },

  async getApplicationsByIntern(internId: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job_listings (
            *,
            employer_profiles (
              company_name,
              logo_url
            )
          )
        `)
        .eq('intern_id', internId)
        .order('applied_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'get intern applications');
    }
  },

  async getApplicationsByEmployer(employerId: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          job_listings!inner (
            id,
            title,
            employer_id
          ),
          users!applications_intern_id_fkey (
            id,
            name,
            email,
            profile_picture
          ),
          intern_profiles (
            skills,
            bio,
            resume_url
          )
        `)
        .eq('job_listings.employer_id', employerId)
        .order('applied_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'get employer applications');
    }
  },

  async updateApplicationStatus(applicationId: string, status: Application['status']) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', applicationId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'update application status');
    }
  },

  async deleteApplication(applicationId: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { error } = await supabase
        .from('applications')
        .delete()
        .eq('id', applicationId);
      
      if (error) throw error;
    } catch (error) {
      handleDatabaseError(error, 'delete application');
    }
  },

  // Real-time subscription for applications
  subscribeToApplications(userId: string, callback: (payload: any) => void) {
    if (!supabase) return () => {};
    
    const subscription = supabase
      .channel('applications_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'applications',
          filter: `intern_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
};

// Message operations with real-time chat
export const messageService = {
  async sendMessage(messageData: Tables['messages']['Insert']) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'send message');
    }
  },

  async getConversation(userId1: string, userId2: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey (
            id,
            name,
            profile_picture
          ),
          receiver:users!messages_receiver_id_fkey (
            id,
            name,
            profile_picture
          )
        `)
        .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('sent_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'get conversation');
    }
  },

  async getMessagesByUser(userId: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:users!messages_sender_id_fkey (
            id,
            name,
            profile_picture
          ),
          receiver:users!messages_receiver_id_fkey (
            id,
            name,
            profile_picture
          )
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'get user messages');
    }
  },

  async markAsRead(messageId: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'mark message as read');
    }
  },

  // Real-time subscription for messages
  subscribeToMessages(userId: string, callback: (payload: any) => void) {
    if (!supabase) return () => {};
    
    const subscription = supabase
      .channel('messages_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        callback
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }
};

// Review operations
export const reviewService = {
  async createReview(reviewData: Tables['reviews']['Insert']) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(reviewData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'create review');
    }
  },

  async getReviewsForUser(userId: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewer:users!reviews_reviewer_id_fkey (
            id,
            name,
            profile_picture
          )
        `)
        .eq('reviewee_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'get user reviews');
    }
  },

  async getReviewsByUser(userId: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          reviewee:users!reviews_reviewee_id_fkey (
            id,
            name,
            profile_picture
          )
        `)
        .eq('reviewer_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      handleDatabaseError(error, 'get reviews by user');
    }
  }
};

// Enhanced authentication service
export const authService = {
  async signUp(email: string, password: string, userData: { name: string; user_type: 'intern' | 'employer' }) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      console.log('Starting signup process for:', email, userData);

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw authError;
      }
      if (!authData.user) {
        console.error('No user returned from auth signup');
        throw new Error('Failed to create user');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Wait a bit for the auth user to be fully created
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        // Create user profile
        console.log('Creating user profile...');
        const user = await userService.createUser({
          auth_user_id: authData.user.id,
          name: userData.name,
          email,
          user_type: userData.user_type,
        });

        console.log('User profile created successfully:', user);

        // Create extended profile based on user type
        if (userData.user_type === 'intern') {
          await internProfileService.createProfile({
            user_id: user.id,
            skills: [],
            education: [],
            experience: []
          });
        } else if (userData.user_type === 'employer') {
          await employerProfileService.createProfile({
            user_id: user.id,
            company_name: userData.name
          });
        }

        return { user: authData.user, profile: user };
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
        throw new Error('Failed to create user profile. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      handleDatabaseError(error, 'sign in');
    }
  },

  async signOut() {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      handleDatabaseError(error, 'sign out');
    }
  },

  async getCurrentUser() {
    if (!supabase) throw new DatabaseError('Database not available');
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        const profile = await userService.getUserByAuthId(user.id);
        return { user, profile };
      }
      
      return { user: null, profile: null };
    } catch (error) {
      handleDatabaseError(error, 'get current user');
    }
  }
};

// Real-time notification service
export const notificationService = {
  subscribeToUserNotifications(userId: string, callback: (notification: any) => void) {
    if (!supabase) return () => {};

    // Subscribe to applications for employers
    const applicationSub = supabase
      .channel('user_notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'applications'
        },
        async (payload) => {
          // Get job details to check if this employer should be notified
          const { data: job } = await supabase
            .from('job_listings')
            .select('employer_id, title')
            .eq('id', payload.new.job_id)
            .single();
          
          if (job && job.employer_id === userId) {
            callback({
              type: 'new_application',
              message: `New application received for ${job.title}`,
              data: payload.new
            });
          }
        }
      )
      .subscribe();

    // Subscribe to application status changes for interns
    const statusSub = supabase
      .channel('status_notifications')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'applications',
          filter: `intern_id=eq.${userId}`
        },
        (payload) => {
          if (payload.old.status !== payload.new.status) {
            callback({
              type: 'status_change',
              message: `Application status changed to ${payload.new.status}`,
              data: payload.new
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(applicationSub);
      supabase.removeChannel(statusSub);
    };
  }
};