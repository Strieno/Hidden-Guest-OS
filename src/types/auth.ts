export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContext {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}
