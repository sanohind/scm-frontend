import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { API_Dashboard } from '../../../../api/api';
import CardDataStats from '../../../../components/CardDataStats';
import { FaUserCheck, FaUserClock, FaUsers, FaUserTimes } from 'react-icons/fa';

const DashboardSuperAdmin: React.FC = () => {
    // State untuk menyimpan data dashboard
    const [dashboardData, setDashboardData] = useState({
        user_online: '-',
        total_user: '-',
        user_active: '-',
        user_deactive: '-',
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('access_token');

                const response = await fetch(API_Dashboard(), {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, 
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const result = await response.json();

                    if (result.success) {
                        const data = result.data;
                        setDashboardData({
                        user_online: data.active_tokens,
                        total_user: data.total_users,
                        user_active: data.active_users,
                        user_deactive: data.deactive_users,
                        });
                    } else {
                        console.error('Failed to load dashboard data:', result.message);
                        toast.error(`Failed to load dashboard data: ${result.message}`);
                    }
                } else {
                    console.error('Failed to fetch data:', response.status);
                    toast.error(`Failed to fetch data: ${response.status}`);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                if (error instanceof Error) {
                    toast.error(`Error fetching dashboard data: ${error.message}`);
                } else {
                    toast.error('Error fetching dashboard data');
                }
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                <CardDataStats
                    title="User Online"
                    total={dashboardData.user_online.toString()}
                    rate=""
                    levelUp
                >
                <FaUserClock className="fill-green-500 dark:fill-white" size={24} />

                </CardDataStats>
                <CardDataStats
                    title="Total User"
                    total={dashboardData.total_user.toString()}
                    rate=""
                    levelUp
                >
                <FaUsers className="fill-blue-500 dark:fill-white" size={24} />

                </CardDataStats>
                <CardDataStats
                    title="User Active"
                    total={dashboardData.user_active.toString()}
                    rate=""
                    levelUp
                >
                <FaUserCheck className="fill-yellow-500 dark:fill-white" size={24} />

                </CardDataStats>
                <CardDataStats
                    title="User Deactive"
                    total={dashboardData.user_deactive.toString()}
                    rate=""
                    levelUp
                >
                <FaUserTimes className="fill-red-500 dark:fill-white" size={24} />
                </CardDataStats>
            </div>
        </>
    );
};

export default DashboardSuperAdmin;