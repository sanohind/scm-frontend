import { FaUserPlus } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const AddUser = () => {
    return (
        <li>
            <NavLink
                to="/add-user"
                className={({ isActive }) =>
                `group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium duration-300 ease-in-out ${
                    isActive
                    ? 'bg-graydark text-white'
                    : 'text-black-2 dark:text-bodydark2 hover:bg-graydark hover:text-white dark:hover:bg-meta-4'
                }`
                }
            >
                <FaUserPlus className="fill-current" size={18} />
                Add User
            </NavLink>
        </li>
    );
};

export default AddUser;