import Dashboard from "./component/Dashboard";
import PurchaseOrder from "./component/PurchaseOrder";
import HistoryPurchaseOrder from "./component/HistoryPurchaseOrder";
import PerformanceReport from "./component/PerformanceReport";
import ForecastReport from "./component/ForecastReport";

export const AdminPurchasing = () => {


    return (
        <div>
            <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-black-2  dark:text-bodydark2">
                ADMIN PURCHASING MENU 
                </h3>
                <ul className="mb-6 flex flex-col gap-1.5">
                    {/* <!-- Menu Item Dashboard --> */}            
                    <Dashboard />
                    {/* <!-- Menu Item Dashboard --> */}

                    {/* <!-- Menu Item Purchase Order --> */}
                    <PurchaseOrder />
                    {/* <!-- Menu Item Purchase Order --> */}

                </ul>
                </div>

                {/* <!-- History Group --> */}
                <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-black-2 dark:text-bodydark2">
                    HISTORY
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                    {/* <!-- Menu Item History Purchase Order --> */}
                    <HistoryPurchaseOrder />
                    {/* <!-- Menu Item History Purchase Order --> */}
                </ul>
                </div>

                {/* <!-- OTHER Group --> */}
                <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-black-2 dark:text-bodydark2">
                    OTHER
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                    {/* <!-- Menu Item Performance Report --> */}
                    <PerformanceReport />
                    {/* <!-- Menu Item Performance Report --> */}

                    {/* <!-- Menu Item Forecast Report --> */}
                    <ForecastReport />
                    {/* <!-- Menu Item Forecast Report --> */}
                </ul>
            </div>
    </div>
    )
};