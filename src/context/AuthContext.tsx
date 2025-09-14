import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types/blockchain';

interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string; organization: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

const mockUsers: User[] = [
  {
    id: 'farmer-001',
    name: 'Rajesh Kumar',
    organizationId: 'farmer-coop-1',
    role: 'farmer',
    permissions: ['create_collection_event', 'view_own_batches']
  },
  {
    id: 'processor-001',
    name: 'Dr. Priya Sharma',
    organizationId: 'processing-facility-1',
    role: 'processor',
    permissions: ['create_processing_step', 'view_batches', 'transfer_custody']
  },
  {
    id: 'lab-001',
    name: 'Dr. Anil Gupta',
    organizationId: 'testing-lab-1',
    role: 'lab_tech',
    permissions: ['create_quality_test', 'view_batches', 'approve_batches']
  },
  {
    id: 'manufacturer-001',
    name: 'Sunita Patel',
    organizationId: 'manufacturer-1',
    role: 'manufacturer',
    permissions: ['create_final_product', 'generate_qr', 'view_all_batches']
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = async (credentials: { username: string; password: string; organization: string }) => {
    // Simulate authentication
    const foundUser = mockUsers.find(u => 
      u.organizationId === credentials.organization
    );
    
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}