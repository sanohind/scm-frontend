import { useEffect, useState } from "react";
import ChartTwo from "../../../../components/Charts/ChartTwo";
import Select from 'react-select';
import { API_Dashboard_Performance_Subcont_Admin, API_List_Partner_Admin } from "../../../../api/api";
import { toast } from "react-toastify";

const DashboardAdminSubcont = () => {
    
    interface Supplier {
        value: string;
        label: string;
    }
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);

    const [freshData, setFreshData] = useState<{
        fresh_incoming: number[];
        fresh_process: number[];
        fresh_outgoing: number[];
    }>({
        fresh_incoming: [],
        fresh_process: [],
        fresh_outgoing: [],
    });
    const [replatingData, setreplatingData] = useState<{
        replating_incoming: number[];
        replating_process: number[];
        replating_outgoing: number[];
    }>({
        replating_incoming: [],
        replating_process: [],
        replating_outgoing: [],
    });

    const fetchSuppliers = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(API_List_Partner_Admin(), {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch suppliers');

            const result = await response.json();
            const suppliersList = result.data.map((supplier: any) => ({
                value: supplier.bp_code,
                label: `${supplier.bp_code} | ${supplier.bp_name}`,
            }));

            setSuppliers(suppliersList);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            if (error instanceof Error) {
                toast.error(`Failed to fetch suppliers. ${error.message}`);
            } else {
                toast.error('Failed to fetch suppliers.');
            }
        }
    };
    
    const fetchData = async (supplierCode: string) => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_Dashboard_Performance_Subcont_Admin()}${supplierCode}`, {
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
                    setFreshData({
                        fresh_incoming: data.fresh_incoming.map((item: { count: number }) => item.count).slice(-12),
                        fresh_process: data.fresh_process.map((item: { count: number }) => item.count).slice(-12),
                        fresh_outgoing: data.fresh_outgoing.map((item: { count: number }) => item.count).slice(-12),
                    });
                    setreplatingData({
                        replating_incoming: data.replating_incoming.map((item: { count: number }) => item.count).slice(-12),
                        replating_process: data.replating_process.map((item: { count: number }) => item.count).slice(-12),
                        replating_outgoing: data.replating_outgoing.map((item: { count: number }) => item.count).slice(-12),
                    });
                } else {
                    console.error('Failed to load data:', result.message);
                }
            } else {
                console.error('Failed to fetch data:', response.status);
            }

            // Dummy data
            // setFreshData({
            //     fresh_incoming: [20, 30, 25, 40, 35, 60, 45, 55, 50, 65, 70, 80],
            //     fresh_process: [15, 25, 20, 35, 30, 50, 40, 45, 60, 75, 85, 90],
            //     fresh_outgoing: [10, 20, 15, 30, 25, 45, 35, 40, 50, 65, 75, 85],
            // });
            // setreplatingData({
            //     replating_incoming: [5, 15, 10, 20, 25, 30, 45, 35, 40, 55, 60, 70],
            //     replating_process: [8, 18, 12, 28, 32, 38, 48, 36, 47, 60, 72, 88],
            //     replating_outgoing: [3, 13, 9, 19, 23, 29, 39, 28, 38, 50, 60, 65],
            // });
        } catch (error) {
            console.error('Error fetching data:', error);
        } 
    };

    const handleSupplierChange = (selectedOption: { value: string; label: string } | null) => {
        setSelectedSupplier(selectedOption);
        if (selectedOption) {
            localStorage.setItem('selected_supplier', selectedOption.value);
            fetchData(selectedOption.value);
        } else {
            localStorage.removeItem('selected_supplier');
            setFreshData({
                fresh_incoming: [],
                fresh_process: [],
                fresh_outgoing: [],
            });
            setreplatingData({
                replating_incoming: [],
                replating_process: [],
                replating_outgoing: [],
            });
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        const savedSupplierCode = localStorage.getItem('selected_supplier');
        if (savedSupplierCode && suppliers.length > 0) {
            const savedSupplier = suppliers.find(
                (sup: Supplier) => sup.value === savedSupplierCode
            );
            if (savedSupplier) { 
                setSelectedSupplier(savedSupplier);
            }
        }
    }, [suppliers]);

    return (
        <>
            
            <div className="space-y-6">
                <div className="w-full rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
                    <Select
                        options={suppliers}
                        value={selectedSupplier}
                        onChange={handleSupplierChange}
                        placeholder="Select Supplier"
                        className="w-80"
                    />
                </div>
                <div className="flex flex-col xl:flex-row gap-4 md:gap-6 2xl:gap-7.5">
                    {/* Get last 12 months dynamically */}
                    {(() => {
                        const days = [];
                        const today = new Date();
                        for (let i = 11; i >= 0; i--) {
                            const d = new Date();
                            d.setDate(today.getDate() - i);
                            days.push(d.toLocaleDateString('default', { day: '2-digit', month: 'short' }));
                        }
                        return (
                        <>
                            <ChartTwo
                                titleOne="Fresh Incoming"
                                titleTwo="Fresh Process"
                                titleThree="Fresh Outgoing"
                                dataOne={freshData.fresh_incoming.slice(-12)}
                                dataTwo={freshData.fresh_process.slice(-12)}
                                dataThree={freshData.fresh_outgoing.slice(-12)}
                                categories={days}
                                dateRange={`${new Date(today.getTime() - 11 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${today.toLocaleDateString()}`}
                            />
                            <ChartTwo
                                titleOne="Replating Incoming"
                                titleTwo="Replating Process"
                                titleThree="Replating Outgoing"
                                dataOne={replatingData.replating_incoming.slice(-12)}
                                dataTwo={replatingData.replating_process.slice(-12)}
                                dataThree={replatingData.replating_outgoing.slice(-12)}
                                categories={days}
                                dateRange={`${new Date(today.getTime() - 11 * 24 * 60 * 60 * 1000).toLocaleDateString()} - ${today.toLocaleDateString()}`}
                            />
                        </>
                        );
                    })()}
                </div>
            </div>
        </>
    );

}

export default DashboardAdminSubcont;
