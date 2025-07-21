/*
  # Initial Database Schema for InternLink Platform

  1. New Tables
    - `users` - Main user table with auth integration
    - `intern_profiles` - Extended profile data for students
    - `employer_profiles` - Extended profile data for organizations
    - `admin_users` - Admin role management
    - `user_sessions` - Session tracking for security

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Create secure functions for user management

  3. Functions
    - User creation with profile setup
    - Role-based access control
    - Session management
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_type AS ENUM ('intern', 'employer', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'banned', 'pending_verification');
CREATE TYPE admin_level AS ENUM ('super_admin', 'admin', 'moderator');

-- Main users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  profile_picture text,
  status user_status DEFAULT 'active',
  email_verified boolean DEFAULT false,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Intern profiles table
CREATE TABLE IF NOT EXISTS intern_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  resume_url text,
  skills jsonb DEFAULT '[]',
  availability_start date,
  availability_end date,
  education jsonb DEFAULT '[]',
  experience jsonb DEFAULT '[]',
  bio text,
  location text,
  linkedin_url text,
  github_url text,
  portfolio_url text,
  gpa decimal(3,2),
  graduation_date date,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Employer profiles table
CREATE TABLE IF NOT EXISTS employer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  company_description text,
  industry text,
  location text,
  website text,
  company_size text,
  logo_url text,
  contact_name text,
  contact_phone text,
  founded_year integer,
  verification_status text DEFAULT 'pending',
  verification_documents jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  admin_level admin_level DEFAULT 'moderator',
  permissions jsonb DEFAULT '[]',
  assigned_by uuid REFERENCES users(id),
  assigned_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- User sessions table for tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  ip_address inet,
  user_agent text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Email verification tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE intern_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN users u ON au.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users au
      JOIN users u ON au.user_id = u.id
      WHERE u.auth_user_id = auth.uid()
    )
  );

-- RLS Policies for intern_profiles
CREATE POLICY "Interns can manage own profile" ON intern_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_id AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Employers can read intern profiles" ON intern_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid() AND u.user_type = 'employer'
    )
  );

-- RLS Policies for employer_profiles
CREATE POLICY "Employers can manage own profile" ON employer_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_id AND u.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Interns can read employer profiles" ON employer_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid() AND u.user_type = 'intern'
    )
  );

-- RLS Policies for admin_users
CREATE POLICY "Admins can read admin data" ON admin_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.auth_user_id = auth.uid() AND u.user_type = 'admin'
    )
  );

-- RLS Policies for sessions
CREATE POLICY "Users can read own sessions" ON user_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = user_id AND u.auth_user_id = auth.uid()
    )
  );

-- Functions for user management
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (auth_user_id, user_type, name, email, email_verified)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'intern')::user_type,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.email_confirmed_at IS NOT NULL
  );
  
  -- Create appropriate profile based on user type
  IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'intern') = 'intern' THEN
    INSERT INTO intern_profiles (user_id, skills, education, experience)
    SELECT id, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb
    FROM users WHERE auth_user_id = NEW.id;
  ELSIF COALESCE(NEW.raw_user_meta_data->>'user_type', 'intern') = 'employer' THEN
    INSERT INTO employer_profiles (user_id, company_name)
    SELECT id, COALESCE(NEW.raw_user_meta_data->>'company_name', 'Company')
    FROM users WHERE auth_user_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Function to update user last login
CREATE OR REPLACE FUNCTION update_last_login(user_auth_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE users 
  SET last_login = now(), updated_at = now()
  WHERE auth_user_id = user_auth_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create session
CREATE OR REPLACE FUNCTION create_user_session(
  user_auth_id uuid,
  session_token text,
  ip_address inet DEFAULT NULL,
  user_agent text DEFAULT NULL,
  expires_at timestamptz DEFAULT (now() + interval '7 days')
)
RETURNS uuid AS $$
DECLARE
  session_id uuid;
  user_record users%ROWTYPE;
BEGIN
  -- Get user record
  SELECT * INTO user_record FROM users WHERE auth_user_id = user_auth_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Create session
  INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
  VALUES (user_record.id, session_token, ip_address, user_agent, expires_at)
  RETURNING id INTO session_id;
  
  -- Update last login
  PERFORM update_last_login(user_auth_id);
  
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate session
CREATE OR REPLACE FUNCTION validate_session(token text)
RETURNS TABLE(
  user_id uuid,
  user_type user_type,
  user_status user_status,
  session_valid boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.user_type,
    u.status,
    (s.expires_at > now() AND u.status = 'active') as session_valid
  FROM user_sessions s
  JOIN users u ON s.user_id = u.id
  WHERE s.session_token = token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < now();
  DELETE FROM password_reset_tokens WHERE expires_at < now();
  DELETE FROM email_verification_tokens WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type_status ON users(user_type, status);
CREATE INDEX IF NOT EXISTS idx_intern_profiles_user_id ON intern_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employer_profiles_user_id ON employer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intern_profiles_updated_at BEFORE UPDATE ON intern_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_profiles_updated_at BEFORE UPDATE ON employer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();