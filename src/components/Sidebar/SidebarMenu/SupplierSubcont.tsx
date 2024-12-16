import Dashboard from "./component/Dashboard";
import DeliveryNote from "./component/DeliveryNote";
import StockItems from "./component/StockItems";
import TransactionSubcont from "./component/TransactionSubcont";
import HistoryDeliveryNote from "./component/HistoryDeliveryNote";
import TransactionsReport from "./component/TransactionsReport";

export const SupplierSubcont = () => {

    return (
        <div>
            <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-black-2  dark:text-bodydark2">
                SUPPLIER SUBCONT MENU 
                </h3>
                <ul className="mb-6 flex flex-col gap-1.5">
                    {/* <!-- Menu Item Dashboard --> */}            
                    <Dashboard />
                    {/* <!-- Menu Item Dashboard --> */}

                    {/* <!-- Menu Item Delivery Note --> */}
                    <DeliveryNote />
                    {/* <!-- Menu Item Delivery Note --> */}
                </ul>
            </div>

            {/* <!-- Subcontractor Group --> */}
            <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-black-2 dark:text-bodydark2">
                SUBCONTRACTOR
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                    {/* <!-- Menu Item Stock Items --> */}
                    <StockItems />
                    {/* <!-- Menu Item Stock Items --> */}

                    {/* <!-- Menu Item Transaction --> */}
                    <TransactionSubcont />
                    {/* <!-- Menu Item Transaction --> */}
                    
                    {/* <!-- Menu Item Report Transactions --> */}
                    <TransactionsReport />
                    {/* <!-- Menu Item Report Transaction --> */}

                </ul>
            </div>

            {/* <!-- History Group --> */}
            <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-black-2 dark:text-bodydark2">
                HISTORY
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">

                    {/* <!-- Menu Item History Delivery Note --> */}
                    <HistoryDeliveryNote />
                    {/* <!-- Menu Item History Delivery Note --> */}

                </ul>
            </div>
        </div>
    );
};