import React, { useState, useEffect } from 'react';
import { API_Sync } from '../../api/api';

const DashboardPurchasingWarehouse: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<{ message: string, type: 'success' | 'error' | 'warning' }[]>([]);
  
    useEffect(() => {
      // Set initial value of month picker to current month
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      setSelectedMonth(`${year}-${month}`);
    }, []);
  
    const addNotification = (message: string, type: 'success' | 'error' | 'warning') => {
      setNotifications((prev) => [...prev, { message, type }]);
    };
  
    const handleSync = async () => {
      if (!selectedMonth) {
        addNotification('Please select a month before syncing.', 'warning');
        return;
      }
  
      const [year, month] = selectedMonth.split('-');
      const token = localStorage.getItem('access_token');
  
      setIsSyncing(true);
  
      try {
        // Construct the URL with separate month and year parameters
        const url = `${API_Sync()}?month=${month}&year=${year}`;
  
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
  
        const data = await response.json();
  
        if (response.ok) {
          addNotification('Data has been synchronized successfully.', 'success');
        } else {
          addNotification(data.message || 'An error occurred during synchronization.', 'error');
        }
      } catch (error) {
        addNotification('An error occurred during synchronization.', 'error');
      } finally {
        setIsSyncing(false);
      }
    };
  
    return (
      <>
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark px-3">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-lg text-black dark:text-white">
              Synchronization Data
            </h3>
          </div>
  
          {/* Sync Section */}
          <div className="flex flex-col gap-5.5 p-6.5">
            <div className="flex items-center">
              <label htmlFor="month-picker" className="mr-2 text-base font-semibold text-gray-700 dark:text-white">
                Select Month:
              </label>
              <input
                type="month"
                id="month-picker"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-gray-300 dark:border-strokedark rounded-md p-2 mr-4"
              />
              <button
                id="sync-button"
                onClick={handleSync}
                className={`flex items-center px-4 py-1 text-white rounded-md ${isSyncing ? 'bg-blue-400' : 'bg-blue-500 hover:bg-blue-600'}`}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <svg className="animate-spin w-8 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : (
                  <img src="../../../assets/icon_sync.png" className="w-8 mr-2" alt="Sync Icon" />
                )}
                {isSyncing ? 'Syncing...' : 'Sync'}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  };

export default DashboardPurchasingWarehouse;
