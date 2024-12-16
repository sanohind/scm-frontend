import Dashboard from "./component/Dashboard";
import ListUser from "./component/ListUser";
import AddUser from "./component/AddUser";

export const SuperAdmin = () => {

    return (
        <div>
            <div>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-black-2  dark:text-bodydark2">
                    ADMIN MENU
                </h3>
                <ul className="mb-6 flex flex-col gap-1.5">
                    {/* <!-- Menu Item Dashboard --> */}            
                    <Dashboard />
                    {/* <!-- Menu Item Dashboard --> */}

                    {/* <!-- Menu List User --> */}
                    <ListUser />
                    {/* <!-- Menu List User --> */}

                    {/* <!-- Menu Add User --> */}
                    <AddUser />
                    {/* <!-- Menu Add User --> */}
                </ul>
            </div>
        </div>
    );
}