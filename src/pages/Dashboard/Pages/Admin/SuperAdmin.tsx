import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { API_Dashboard,  API_User_Login_Performance__Admin,  API_User_Logout_Admin, API_User_Online_Admin } from '../../../../api/api';
import CardDataStats from '../../../../components/CardDataStats';
import { FaUserCheck, FaUserClock, FaUsers, FaUserTimes } from 'react-icons/fa';
import UserOnline from '../../../../components/UserOnline';
import BarChart from '../../../../components/Charts/BarChart';
import { getRoleName } from '../../../Authentication/Role';

interface LoginData {
  username: string;
  login_count: number;
}
const DashboardSuperAdmin: React.FC = () => {
  const [dashboardData, setDashboardData] = useState({
    user_online: '-',
    total_user: '-',
    user_active: '-',
    user_deactive: '-',
  });

  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isFetchingEnabled, setIsFetchingEnabled] = useState(true);
  const [dailyLoginData, setDailyLoginData] = useState<LoginData[]>([]);
  const [monthlyLoginData, setMonthlyLoginData] = useState<LoginData[]>([]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_Dashboard(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok || !response) {
        handleFetchError('Failed to fetch dashboard data');
        return;
      }
  
      const result = await response.json();
      if (result.success) {
        setFailedAttempts(0); // Reset error count on success
        const data = result.data;
        setDashboardData({
          user_online: data.active_tokens,
          total_user: data.total_users,
          user_active: data.active_users,
          user_deactive: data.deactive_users,
        });
      } else {
        handleFetchError(result.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      handleFetchError('Network error while fetching dashboard data');
    }
  };
  
  const handleFetchError = (message: string) => {
    const newFailedAttempts = failedAttempts + 1;
    setFailedAttempts(newFailedAttempts);
    
    if (newFailedAttempts >= 3) {
      setIsFetchingEnabled(false);
      toast.error('Stopped fetching after 3 failed attempts');
    }
    toast.error(message);
  };

  const fetchOnlineUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_User_Online_Admin(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        handleFetchError('Failed to fetch online users');
        return;
      }
  
      const result = await response.json();
      if (result.success) {
        setFailedAttempts(0); // Reset error count on success
        setOnlineUsers(result.data);
      } else {
        handleFetchError(result.message || 'Failed to fetch online users');
      }
    } catch (error) {
      handleFetchError('Network error while fetching online users');
    }
  };

  const handleLogoutUser = async (token_id: string) => {
    try {
      const adminToken = localStorage.getItem('access_token');

      const response = await fetch(API_User_Logout_Admin(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          "token_id": token_id,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const loggedOutUser = onlineUsers.find((user) => user.id === token_id);
          toast.success(`User ${loggedOutUser?.name || 'unknown'} logged out successfully`);
          setOnlineUsers((prevUsers) => prevUsers.filter((user) => user.token !== token_id));
        } else {
          toast.error('Error logging out user:', result.message);
        }
      } else {
        toast.error('Error logging out user');
      }
    } catch (error) {
      console.error('Error logging out user:', error);
      toast.error('Error logging out user');
    }
  };

  const fetchLoginData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_User_Login_Performance__Admin(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        handleFetchError('Failed to fetch login data');
        return;
      }
  
      const result = await response.json();
      if (result.success) {
        setFailedAttempts(0); // Reset error count on success
        const sortedDailyData = result.data.daily
          .sort((a: LoginData, b: LoginData) => b.login_count - a.login_count)
          .slice(0, 10);
        
        const sortedMonthlyData = result.data.monthly
          .sort((a: LoginData, b: LoginData) => b.login_count - a.login_count)
          .slice(0, 10);
  
        setDailyLoginData(sortedDailyData);
        setMonthlyLoginData(sortedMonthlyData);
      } else {
        handleFetchError(result.message || 'Failed to fetch login data');
      }
    } catch (error) {
      handleFetchError('Network error while fetching login data');
    }
  };



  useEffect(() => {
    if (isFetchingEnabled && failedAttempts < 3) {
      fetchLoginData();
      fetchDashboardData();
      fetchOnlineUsers();
  
      const intervalId = setInterval(() => {
        if (isFetchingEnabled && failedAttempts < 3) {
          fetchOnlineUsers();
          fetchDashboardData();
          fetchLoginData();
        } else {
          clearInterval(intervalId);
        }
      }, 2000);
  
      return () => clearInterval(intervalId);
    }
  }, [isFetchingEnabled, failedAttempts]);

  const categoriesDaily = dailyLoginData.map(item => item.username);
  const dataDaily = dailyLoginData.map(item => item.login_count);
  const categoriesMonthly = monthlyLoginData.map(item => item.username);
  const dataMonthly = monthlyLoginData.map(item => item.login_count);

  return (
    <>
      <ToastContainer position="top-right" />
      <div className='space-y-6'>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
          <CardDataStats
            title="User Online"
            total={dashboardData.user_online.toString()}
            rate=""
            levelUp={Number(dashboardData.user_online) > 0}
            levelDown={Number(dashboardData.user_online) <= 0}
          >
            <FaUserClock className="fill-green-500 dark:fill-white" size={24} />
          </CardDataStats>
          <CardDataStats
            title="Total User"
            total={dashboardData.total_user.toString()}
            rate=""
            levelUp={Number(dashboardData.total_user) > 0}
            levelDown={Number(dashboardData.total_user) <= 0}
          >
            <FaUsers className="fill-blue-500 dark:fill-white" size={24} />
          </CardDataStats>
          <CardDataStats
            title="User Active" 
            total={dashboardData.user_active.toString()}
            rate=""
            levelUp={Number(dashboardData.user_active) > 0}
            levelDown={Number(dashboardData.user_active) <= 0}
          >
            <FaUserCheck className="fill-yellow-500 dark:fill-white" size={24} />
          </CardDataStats>
          <CardDataStats
            title="User Deactive"
            total={dashboardData.user_deactive.toString()}
            rate=""
            levelUp={Number(dashboardData.user_deactive) > 0}
            levelDown={Number(dashboardData.user_deactive) <= 0}
          >
            <FaUserTimes className="fill-red-500 dark:fill-white" size={24} />
          </CardDataStats>
        </div>

        <div className='flex flex-col md:flex-row w-full gap-4 md:gap-6 2xl:gap-7'>
          <BarChart
            title="Login Performance"
            categories={categoriesDaily}
            data={dataDaily}
            subTitle='24 Hours'
            footer='User Login Daily Performance'
          />
          <BarChart
            title="Login Performance"
            categories={categoriesMonthly}
            data={dataMonthly}
            subTitle='Monthly'
            footer='User Login Monthly Performance'
          />
        </div>

        {/* Tabel User Online */}
        <UserOnline
          onlineUsers={onlineUsers}
          handleLogoutUser={handleLogoutUser}
          getRoleName={(role: string) => getRoleName(role)}
        />
      </div>
    </>
  );
};

export default DashboardSuperAdmin;