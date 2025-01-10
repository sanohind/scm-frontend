import { FaRegCheckCircle } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";

const TransactionReviewSubcont = () => {

    const location = useLocation();
    const currentPath = location.pathname;

    const transactionsReviewPaths = [
        '/transactions-review', 
        '/transactions-review-detail',
    ];

    const isActive = transactionsReviewPaths.some(path => 
        currentPath.startsWith(path) || currentPath.includes(path)
    );
    return (
        <li>
            <NavLink
                to="/transactions-review"
                end
                className={
                    `group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium duration-300 ease-in-out ${
                    isActive
                        ? 'bg-graydark text-white'
                        : 'text-black-2 dark:text-bodydark2 hover:bg-graydark hover:text-white dark:hover:bg-meta-4'
                    }`
                }
                >
                <FaRegCheckCircle className="text-xl" />
                Transactions Review
            </NavLink>
        </li>
    );
};

export default TransactionReviewSubcont;