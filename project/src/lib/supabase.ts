import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For development, use mock data if Supabase is not configured properly
const isDevelopment = !supabaseUrl || 
                     !supabaseAnonKey || 
                     supabaseUrl === 'your_supabase_project_url' ||
                     supabaseUrl === '' ||
                     supabaseAnonKey === 'your_supabase_anon_key' ||
                     supabaseAnonKey === '';

if (isDevelopment) {
  console.warn('Supabase not configured, using mock authentication');
}

export const supabase = isDevelopment ? null : createClient(supabaseUrl!, supabaseAnonKey!);
export const isUsingMockAuth = isDevelopment;

// Enhanced database types for our app
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_user_id: string;
          user_type: 'intern' | 'employer';
          name: string;
          email: string;
          profile_picture: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id: string;
          user_type: 'intern' | 'employer';
          name: string;
          email: string;
          profile_picture?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string;
          user_type?: 'intern' | 'employer';
          name?: string;
          email?: string;
          profile_picture?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      intern_profiles: {
        Row: {
          id: string;
          user_id: string;
          resume_url: string | null;
          skills: any;
          availability_start: string | null;
          availability_end: string | null;
          education: any;
          experience: any;
          bio: string | null;
          location: string | null;
          phone: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          portfolio_url: string | null;
          gpa: number | null;
          graduation_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          resume_url?: string | null;
          skills?: any;
          availability_start?: string | null;
          availability_end?: string | null;
          education?: any;
          experience?: any;
          bio?: string | null;
          location?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          gpa?: number | null;
          graduation_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_url?: string | null;
          skills?: any;
          availability_start?: string | null;
          availability_end?: string | null;
          education?: any;
          experience?: any;
          bio?: string | null;
          location?: string | null;
          phone?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          gpa?: number | null;
          graduation_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      employer_profiles: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          company_description: string | null;
          industry: string | null;
          location: string | null;
          website: string | null;
          company_size: string | null;
          logo_url: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          founded_year: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          company_description?: string | null;
          industry?: string | null;
          location?: string | null;
          website?: string | null;
          company_size?: string | null;
          logo_url?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          founded_year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          company_description?: string | null;
          industry?: string | null;
          location?: string | null;
          website?: string | null;
          company_size?: string | null;
          logo_url?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          founded_year?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_listings: {
        Row: {
          id: string;
          employer_id: string;
          title: string;
          description: string;
          requirements: any;
          skills_required: any;
          location: string;
          job_type: 'remote' | 'in-person' | 'hybrid';
          duration: string | null;
          stipend: string | null;
          is_paid: boolean;
          application_deadline: string | null;
          start_date: string | null;
          end_date: string | null;
          status: 'active' | 'closed' | 'draft';
          posted_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employer_id: string;
          title: string;
          description: string;
          requirements?: any;
          skills_required?: any;
          location: string;
          job_type: 'remote' | 'in-person' | 'hybrid';
          duration?: string | null;
          stipend?: string | null;
          is_paid?: boolean;
          application_deadline?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: 'active' | 'closed' | 'draft';
          posted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employer_id?: string;
          title?: string;
          description?: string;
          requirements?: any;
          skills_required?: any;
          location?: string;
          job_type?: 'remote' | 'in-person' | 'hybrid';
          duration?: string | null;
          stipend?: string | null;
          is_paid?: boolean;
          application_deadline?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: 'active' | 'closed' | 'draft';
          posted_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          intern_id: string;
          job_id: string;
          status: 'applied' | 'reviewing' | 'interviewing' | 'accepted' | 'rejected' | 'withdrawn';
          cover_letter: string | null;
          resume_url: string | null;
          notes: string | null;
          applied_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          intern_id: string;
          job_id: string;
          status?: 'applied' | 'reviewing' | 'interviewing' | 'accepted' | 'rejected' | 'withdrawn';
          cover_letter?: string | null;
          resume_url?: string | null;
          notes?: string | null;
          applied_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          intern_id?: string;
          job_id?: string;
          status?: 'applied' | 'reviewing' | 'interviewing' | 'accepted' | 'rejected' | 'withdrawn';
          cover_letter?: string | null;
          resume_url?: string | null;
          notes?: string | null;
          applied_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          application_id: string | null;
          subject: string | null;
          content: string;
          is_read: boolean;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          application_id?: string | null;
          subject?: string | null;
          content: string;
          is_read?: boolean;
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          application_id?: string | null;
          subject?: string | null;
          content?: string;
          is_read?: boolean;
          sent_at?: string;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          reviewer_id: string;
          reviewee_id: string;
          application_id: string;
          rating: number;
          comment: string | null;
          review_type: 'intern_to_employer' | 'employer_to_intern';
          created_at: string;
        };
        Insert: {
          id?: string;
          reviewer_id: string;
          reviewee_id: string;
          application_id: string;
          rating: number;
          comment?: string | null;
          review_type: 'intern_to_employer' | 'employer_to_intern';
          created_at?: string;
        };
        Update: {
          id?: string;
          reviewer_id?: string;
          reviewee_id?: string;
          application_id?: string;
          rating?: number;
          comment?: string | null;
          review_type?: 'intern_to_employer' | 'employer_to_intern';
          created_at?: string;
        };
      };
    };
  };
}