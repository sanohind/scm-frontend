import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { API_Logout } from '../../api/api';
import { toast, ToastContainer } from 'react-toastify';

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
      setUserRole(role);
      setIsAuthenticated(true);
    } else {
      setUserRole(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false); // Set isLoading ke false setelah pengecekan selesai

    const checkTokenExpiration = () => {
      const expirationTime = localStorage.getItem('token_expiration');
      if (!expirationTime) {
        setUserRole(null);
        setIsAuthenticated(false);
        localStorage.clear();
        return;
      }

      if (expirationTime && new Date().getTime() > parseInt(expirationTime)) {
        setUserRole(null);
        localStorage.removeItem('access_token');
        localStorage.removeItem('token_expiration');
        toast.error('Session expired, please login again');
        setIsAuthenticated(false);
      } 
    };

    const interval = setInterval(checkTokenExpiration, 100); // Cek setiap 1 detik
    return () => clearInterval(interval);
  }, []);

  const login = (role: Role, token: string) => {
    const name = localStorage.getItem('name');
    toast.success('Welcome back! ' + name);
    setIsAuthenticated(true);
    setUserRole(role);
    localStorage.setItem('access_token', token);
    if (role) {
      localStorage.setItem('userRole', role);
    }
    const expirationTime = new Date().getTime() + 3599 * 1000;
    localStorage.setItem('token_expiration', expirationTime.toString()); // 59 Menit 59 Detik
  };

  const logout = async () => {    
    const token = localStorage.getItem('access_token');

    if (token) {
      try {
        await fetch(API_Logout(), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ access_token: token }),
        });
        
        setUserRole(null);
        localStorage.clear();
        setIsAuthenticated(false);
        toast.success('Logout success');
      } catch (error : any) {
        setUserRole(null);
        localStorage.clear();
        setIsAuthenticated(false);
        toast.error('Logout failed: ' + (error.response ? error.response.data : error.message));
        console.error('Error:', error.response ? error.response.data : error.message);
      }
    } else {
      setUserRole(null);
      localStorage.clear();
      setIsAuthenticated(false);
      toast.error('Error: Token not found');
      console.error('Error: Token not found');
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, isLoading }}>
        {children}
      </AuthContext.Provider>
    </>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
