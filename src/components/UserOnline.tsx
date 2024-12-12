import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

interface User {
    id: string;
    token: string;
    username: string;
    name: string;
    role: string;
    last_login: string;
    last_update: string;
}

interface UserOnlineProps {
    onlineUsers: User[];
    handleLogoutUser: (token_id: string) => void;
    getRoleName: (role: string) => string;
}

const UserOnline: React.FC<UserOnlineProps> = ({ onlineUsers, handleLogoutUser, getRoleName }) => (
    <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 ">User Online</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">User Role</th>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Logged In At</th>
                        <th className="px-6 py-3 text-sm font-semibold text-gray-600 uppercase tracking-wider">Updated At</th>
                        <th className="px-6 py-3 relative">
                        <span className="sr-only">Action</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {onlineUsers.length > 0 ? (
                        onlineUsers.map((user) => (
                        <tr key={user.token} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{getRoleName(user.role)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.last_login}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{user.last_update}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button
                                    onClick={() => handleLogoutUser(user.id)}
                                    className="text-red-500 hover:text-red-700"
                                    title="Logout User"
                                >
                                    <FaSignOutAlt size={18} />
                                </button>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                No online users
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default UserOnline;