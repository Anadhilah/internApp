export interface User {
  id: string;
  email: string;
  name: string;
  profileCompleted: boolean;
  role: 'intern' | 'organization';
}

export interface Profile {
  userId: string;
  education: Education[];
  skills: string[];
  interests: string[];
  resumeUrl?: string;
  bio?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: number;
}

export interface Internship {
  id: string;
  companyName: string;
  position: string;
  location: string;
  description: string;
  requirements: string[];
  applicationDeadline: string;
  duration: string;
  paid: boolean;
  remote: boolean;
  skills: string[];
  logo?: string;
  postedBy?: string;
  postedDate?: string;
  stipend?: string;
}

export interface Application {
  id: string;
  userId: string;
  internshipId: string;
  internship: Internship;
  status: 'pending' | 'accepted' | 'rejected';
  appliedDate: string;
  notes?: string;
  resume?: string;
  coverLetter?: string;
}

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: 'intern' | 'organization') => Promise<void>;
  signOut: () => Promise<void>;
};

export interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
  industry: string;
  size: string;
  location: string;
  logo?: string;
  contactName: string;
}