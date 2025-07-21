// Mock authentication service for development
interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'intern' | 'organization';
  created_at: string;
}

class MockAuthService {
  private users: MockUser[] = [];
  private currentUser: MockUser | null = null;
  private listeners: ((user: MockUser | null) => void)[] = [];

  constructor() {
    // Load from localStorage if available
    const savedUsers = localStorage.getItem('mockUsers');
    const savedCurrentUser = localStorage.getItem('mockCurrentUser');
    
    if (savedUsers) {
      this.users = JSON.parse(savedUsers);
    }
    
    if (savedCurrentUser) {
      this.currentUser = JSON.parse(savedCurrentUser);
    }
  }

  private saveToStorage() {
    localStorage.setItem('mockUsers', JSON.stringify(this.users));
    if (this.currentUser) {
      localStorage.setItem('mockCurrentUser', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('mockCurrentUser');
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  async signUp(email: string, password: string, name: string, role: 'intern' | 'organization'): Promise<MockUser> {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Create new user
    const newUser: MockUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      name,
      role,
      created_at: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    this.saveToStorage();
    this.notifyListeners();

    return newUser;
  }

  async signIn(email: string, password: string): Promise<MockUser> {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    this.currentUser = user;
    this.saveToStorage();
    this.notifyListeners();

    return user;
  }

  async signOut(): Promise<void> {
    this.currentUser = null;
    this.saveToStorage();
    this.notifyListeners();
  }

  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  onAuthStateChange(callback: (user: MockUser | null) => void): () => void {
    this.listeners.push(callback);
    
    // Call immediately with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
}

export const mockAuth = new MockAuthService();