import React, { createContext, useContext, useState } from 'react';
import ReactDOM from 'react-dom';
import '../../css/Notification.css';

interface NotificationProps {
  message: string;
  type: 'success' | 'error' | 'warning';
}

interface NotificationContextType {
  showNotification: (message: string, type: 'success' | 'error' | 'warning') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationProps | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2000); // Hapus notifikasi setelah 2 detik
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && <Notification message={notification.message} type={notification.type} />}
    </NotificationContext.Provider>
  );
};

const Notification: React.FC<NotificationProps> = ({ message, type }) => {
  // Pilih ikon dan warna berdasarkan tipe notifikasi
  const icons = {
    success: 'M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z',
    error: 'M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z',
    warning: 'M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z',
  };

  const bgColor = {
    success: 'bg-green-100 text-green-500',
    error: 'bg-red-100 text-red-500',
    warning: 'bg-yellow-100 text-yellow-500',
  };

  return ReactDOM.createPortal(
    <div className={`fixed top-4 right-4 flex items-center max-w-xs p-4 rounded-lg shadow-md border ${bgColor[type]}`}>
      <div className="flex items-center justify-center w-8 h-8 rounded-lg">
        <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
          <path d={icons[type]} />
        </svg>
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
    </div>,
    document.body
  );
};
