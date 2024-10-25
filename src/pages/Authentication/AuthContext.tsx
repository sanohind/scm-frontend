import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { APIlogout } from '../../api/api';

type Role = '1' | '2' | '3' | '4' | '5' | null;

interface AuthContextProps {
    isAuthenticated: boolean;
    userRole: Role;
    login: (role: Role, token: string) => void;
    logout: () => void;
    isLoading: boolean; // Tambahkan isLoading
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true); // Tambahkan isLoading

  useEffect(() => {
    // Periksa apakah token ada di localStorage saat aplikasi dimuat
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('userRole') as Role;

    if (token && role) {
      setIsAuthenticated(true);
      setUserRole(role);
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
    setIsLoading(false); // Set isLoading ke false setelah pengecekan selesai
  }, []);

  const login = (role: Role, token: string) => {
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('access_token', token);
    localStorage.setItem('userRole', role);
  };

  const logout = async () => {    
    const token = localStorage.getItem('access_token');

    if (token) {
      try {
        const response = await fetch(APIlogout, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ access_token: token }),
        });
        localStorage.clear();
        setIsAuthenticated(false);
        setUserRole(null);
      } catch (error) {
        localStorage.clear();
        setIsAuthenticated(false);
        setUserRole(null);
        console.error('Error:', error.response ? error.response.data : error.message);
      }
    } else {
      localStorage.clear();
      setIsAuthenticated(false);
      setUserRole(null);
      console.error('Error: Token not found');
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
