import React, { useEffect, useState } from 'react';
import CardDataStats from '../../../../components/CardDataStats';
import { useNavigate } from 'react-router-dom';
import { FaFileAlt, FaFileInvoiceDollar } from 'react-icons/fa';
import { API_Dashboard } from '../../../../api/api';
import { toast } from 'react-toastify';
import ChartOne from '../../../../components/Charts/ChartOne';
import Calendar from '../../../../components/Calendar';

type Event = {
    id: number;
    title: string;
    start: Date;
    end: Date;
    type: string;
};

const DashboardSupplierSubcontMarketing: React.FC = () => {
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState({
        po_active: 0,
        po_in_progress: 0,
        dn_active: 0,
        dn_in_progress: 0,
    });

    const [poData, setPoData] = useState<{
        po_done: number[];
        po_canceled: number[];
    }>({
        po_done: [],
        po_canceled: [],
    });

    const [dnData, setDnData] = useState<{
        dn_done: number[];
        dn_canceled: number[];
    }>({
        dn_done: [],
        dn_canceled: [],
    });

    const [events, setEvents] = useState<Event[]>([]);

    useEffect(() => {
        const dummyEvents: Event[] = [
            {
                id: 1,
                title: 'PO: 1239',
                start: new Date('2024-12-10'),
                end: new Date('2024-12-10'),
                type: 'PO',
            },
            {
                id: 3,
                title: 'DN: 132',
                start: new Date('2024-12-10'),
                end: new Date('2024-12-13'),
                type: 'DN',
            },
            {
                id: 2,
                title: 'DN: 12324',
                start: new Date('2024-11-15'),
                end: new Date('2024-11-15'),
                type: 'DN',
            },
            // Tambahkan events lainnya...
        ];

        setEvents(dummyEvents);
    }, []);

    useEffect(() => {
        fetchDashboardData();
        fetchPoData();
        fetchDnData();
    }, []);

    
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
                po_active: data.po_active || 0,
                po_in_progress: data.po_in_progress || 0,
                dn_active: data.dn_active || 0,
                dn_in_progress: data.dn_confirmed || 0,
                });
                if (data.po_active > 0) {
                toast.warning(`You have ${data.po_active} PO active`);
                }
            } else {
                console.error('Failed to load dashboard data:', result.message);
                // toast.error(`Failed to load dashboard data: ${result.message}`);
            }
            } else {
            console.error('Failed to fetch data:', response.status);
            // toast.error(`Failed to fetch data: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error instanceof Error) {
                // toast.error(`Error fetching dashboard data: ${error.message}`);
            } else {
                // toast.error('Error fetching dashboard data');
            }
        }
    };

    const fetchPoData = async () => {
        // Fetch data from API and set state
        setPoData({
            po_done: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45],
            po_canceled: [3, 5, 3, 0, 5, 5, 6, 2, 5, 6, 1, 45],
        });
    };

    const fetchDnData = async () => {
        // Fetch data from API and set state
        setDnData({
            dn_done: [23, 11, 22, 27, 13, 22, 37, 21, 44, 22, 30, 45],
            dn_canceled: [3, 5, 3, 0, 5, 5, 6, 2, 5, 6, 1, 45],
        });
    };

    
    return (
        <>
            <div className='space-y-6'>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
                    <div onClick={() => navigate('/purchase-order')} className="cursor-pointer">
                        <CardDataStats
                        title="Purchase Order Open"
                        total={dashboardData.po_active.toString()}
                        rate=""
                        levelUp={dashboardData.po_active > 0}
                        levelDown={dashboardData.po_active === 0}
                        >
                        <FaFileInvoiceDollar className="fill-red-700 dark:fill-white" size={24} />
                        </CardDataStats>
                    </div>
                    
                    <div onClick={() => navigate('/purchase-order')} className="cursor-pointer">
                        <CardDataStats
                        title="Purchase Order In Progress"
                        total={dashboardData.po_in_progress.toString()}
                        rate=""
                        levelUp={dashboardData.po_in_progress > 0}
                        levelDown={dashboardData.po_in_progress === 0}
                        >
                        <FaFileInvoiceDollar className="fill-primary dark:fill-white" size={24} />
                        </CardDataStats>
                    </div>

                    <div onClick={() => navigate('/delivery-note')} className="cursor-pointer">
                        <CardDataStats
                        title="Delivery Note Open"
                        total={dashboardData.dn_active.toString()}
                        rate=""
                        levelUp={dashboardData.dn_active > 0}
                        levelDown={dashboardData.dn_active === 0}
                        >
                        <FaFileAlt className="fill-red-700 dark:fill-white" size={24} />
                        </CardDataStats>
                    </div>
                    
                    <div onClick={() => navigate('/delivery-note')} className="cursor-pointer">
                        <CardDataStats
                        title="Delivery Note In Progress"
                        total={dashboardData.dn_in_progress.toString()}
                        rate=""
                        levelUp={dashboardData.dn_in_progress > 0}
                        levelDown={dashboardData.dn_in_progress === 0}
                        >
                        <FaFileAlt className="fill-primary dark:fill-white" size={24} />
                        </CardDataStats>
                    </div>
                </div>
                
                <div className="flex flex-col xl:flex-row gap-4 md:gap-6 2xl:gap-7.5">
                    {/* Get last 12 months dynamically */}
                    {(() => {
                        const months = [];
                        const today = new Date();
                        for (let i = 11; i >= 0; i--) {
                        const d = new Date();
                        d.setMonth(today.getMonth() - i);
                        months.push(d.toLocaleString('default', { month: 'short', year: '2-digit' }));
                        }
                        return (
                        <>
                            <ChartOne
                                titleOne="PO Closed"
                                titleTwo="PO Cancelled"
                                dataOne={poData.po_done}
                                dataTwo={poData.po_canceled}
                                categories={months}
                                dateRange={`${new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toLocaleDateString()} - ${today.toLocaleDateString()}`}
                            />
                            <ChartOne
                                titleOne="DN Confirmed"
                                titleTwo="DN Cancelled"
                                dataOne={dnData.dn_done}
                                dataTwo={dnData.dn_canceled}
                                categories={months}
                                dateRange={`${new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()).toLocaleDateString()} - ${today.toLocaleDateString()}`}
                            />
                        </>
                        );
                    })()}
                </div>
                <div>
                    <Calendar
                        events={events}
                        defaultView="month"
                    />
                </div>
            </div>
        </>
    );
};

export default DashboardSupplierSubcontMarketing;