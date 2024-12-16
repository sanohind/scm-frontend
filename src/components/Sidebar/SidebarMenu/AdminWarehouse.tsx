import Dashboard from "./component/Dashboard";
import DeliveryNote from "./component/DeliveryNote";
import HistoryDeliveryNote from "./component/HistoryDeliveryNote";

export const AdminWarehouse = () => {

    return (
        <div>
            <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-black-2  dark:text-bodydark2">
                WAREHOUSE MENU 
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
    )
}