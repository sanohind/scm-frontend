import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { FaSyncAlt, FaSpinner } from 'react-icons/fa';
import { API_Sync_Admin } from '../../../../api/api';
import Button from '../../../../components/Forms/Button';

const DashboardAdminPurchasingWarehouse: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState<string>('');
    const [isSyncing, setIsSyncing] = useState<boolean>(false);
  
    useEffect(() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      setSelectedMonth(`${year}-${month}`);
    }, []);
  
  
    const handleSync = async () => {
  
      const [year, month] = selectedMonth.split('-');
      const token = localStorage.getItem('access_token');
  
      setIsSyncing(true);
  
      try {
        // Construct the URL with separate month and year parameters
        const url = `${API_Sync_Admin()}?month=${month}&year=${year}`;
      
        const response = await fetch(url, {
          method: 'GET',
          headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
          },
        });
      
        const data = await response.json();
      
        if (response.ok) {
          toast.success('Data has been synchronized successfully.');
        } else {
          toast.error(data.message || 'An error occurred during synchronization.');
        }
      } catch (error) {
        toast.error('An error occurred during synchronization.');
      } finally {
        setIsSyncing(false);
      }
    };
  
    return (
      <>
        <ToastContainer position="top-right" />
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark px-3">
          <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
            <h3 className="font-medium text-lg text-black dark:text-white">
              Synchronization Data
            </h3>
          </div>
  
          {/* Sync Section */}
          <div className="flex flex-col gap-5.5 p-4 sm:p-6.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0">
              <label htmlFor="month-picker" className="text-base font-semibold text-gray-700 dark:text-white sm:mr-2">
                Select Month:
              </label>
              <input
                type="month"
                id="month-picker"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-auto border border-gray-300 dark:border-strokedark rounded-md p-2 mb-4 sm:mb-0 sm:mr-4"
              />
              {/* <button
                id="sync-button"
                onClick={handleSync}
                className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 text-white rounded-md ${
                  isSyncing ? 'bg-blue-900' : 'bg-blue-900 hover:bg-blue-800'
                }`}
                disabled={isSyncing}
                >
                {isSyncing ? (
                  <svg className="animate-spin w-5 h-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : (
                  <FaSyncAlt className="w-4 h-4 mr-2" />
                )}
                {isSyncing ? 'Syncing...' : 'Sync'}
              </button> */}
              <Button
                title={isSyncing ? 'Syncing...' : 'Sync'}
                onClick={handleSync}
                icon={isSyncing ? FaSpinner : FaSyncAlt}
                disabled={isSyncing}
                iconClassName={isSyncing ? 'animate-spin' : ''}
              />
            </div>
          </div>
        </div>
      </>
    );
  };

export default DashboardAdminPurchasingWarehouse;
