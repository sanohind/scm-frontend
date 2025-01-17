export const roles = [
    { value: '1', label: 'Super Admin' },
    { value: '9', label: 'Super User' }, // Super User Value 9 Be Careful
    { value: '2', label: 'Admin Purchasing' },
    { value: '3', label: 'Admin Warehouse' },
    { value: '4', label: 'Admin Subcont' },
    { value: '5', label: 'Supplier Marketing' },
    { value: '6', label: 'Supplier Subcont Marketing' },
    { value: '7', label: 'Supplier Warehouse' },
    { value: '8', label: 'Supplier Subcont' }, // After this role please add new role from Value 10
];

export const getRoleName = (role: string): string => {
    const foundRole = roles.find(r => r.value === role);
    return foundRole ? foundRole.label : 'Unknown Role';
};

export const getRoleValue = (role: string): string | null => {
    const foundRole = roles.find(r => r.label === role);
    return foundRole ? foundRole.value : null;
};

export const getRolePath = (role: string): string => {
    const foundRole = roles.find(r => r.value === role);
    return foundRole ? foundRole.label.toLowerCase().replace(/ /g, '-') : 'unknown-role';
};

export type Role = (typeof roles[number]['value']) | null;