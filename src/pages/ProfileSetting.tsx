import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { API_Change_Password } from '../api/api';
import Button from '../components/Forms/Button';

const ProfileSetting = () => {
  const [userData, setUserData] = useState({
    supplierName: '',
    bpCode: '',
    name: '',
    role: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [errors, setErrors] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const supplierName = localStorage.getItem('supplier_name') || '';
    const bpCode = localStorage.getItem('bp_code') || '';
    const name = localStorage.getItem('name') || '';
    const role = localStorage.getItem('role') || '';

    setUserData({
      supplierName,
      bpCode,
      name,
      role
    });
  }, []);

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear errors when user starts typing
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

    const handleSubmitPassword = async () => {
        // Validate passwords
        const newErrors = {
            newPassword: '',
            confirmPassword: ''
        };

        if (!validatePassword(passwordData.newPassword)) {
            newErrors.newPassword = 'Password must be at least 8 characters long';
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!passwordData.newPassword) {
            newErrors.newPassword = 'New password is required';
        }

        if (!passwordData.confirmPassword) {
            newErrors.confirmPassword = 'Confirm password is required';
        }

        setErrors(newErrors);

        // If there are errors, don't proceed
        if (newErrors.newPassword || newErrors.confirmPassword) {
            return;
        }

        try {
            const token = localStorage.getItem('access_token');

            if (!token) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Authentication token not found. Please login again.',
                    confirmButtonColor: '#1e3a8a',
                });
                return;
            }

            const confirmResult = await Swal.fire({
                icon: "question",
                title: 'Are you sure?',
                text: 'Do you want to change your password?',
                showCancelButton: true,
                confirmButtonColor: '#1e3a8a',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, change it!',
                cancelButtonText: 'Cancel'
            });

            if (!confirmResult.isConfirmed) return;

            const response = await fetch(API_Change_Password(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    new_password: passwordData.newPassword
                })
            });

            let result;
            try {
                result = await response.json();
            } catch {
                result = {};
            }

            if (response.ok && result && result.status !== false) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: 'Password changed successfully!',
                    confirmButtonColor: '#1e3a8a',
                }).then(() => {
                    setPasswordData({
                        newPassword: '',
                        confirmPassword: ''
                    });
                    setShowChangePassword(false);
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result?.message || 'Failed to change password. Please try again.',
                    confirmButtonColor: '#1e3a8a',
                });
            }
        } catch (error) {
            console.error('Error changing password:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while changing password. Please try again.',
                confirmButtonColor: '#1e3a8a',
            });
        }
    };

  return (
    <>
      <Breadcrumb pageName="Profile Settings" />

      <div className="grid grid-cols-1 gap-8">
        {/* User Information Card */}
        <div className="col-span-5 xl:col-span-3">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                User Information
              </h3>
            </div>
            <div className="p-7">
              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="supplierName"
                  >
                    Supplier Name
                  </label>
                  <div className="relative">
                    <input
                      className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                      type="text"
                      name="supplierName"
                      id="supplierName"
                      value={userData.supplierName}
                      disabled
                    />
                  </div>
                </div>

                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="bpCode"
                  >
                    BP Code
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="bpCode"
                    id="bpCode"
                    value={userData.bpCode}
                    disabled
                  />
                </div>
              </div>

              <div className="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="name"
                    id="name"
                    value={userData.name}
                    disabled
                  />
                </div>

                <div className="w-full sm:w-1/2">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="role"
                  >
                    Role
                  </label>
                  <input
                    className="w-full rounded border border-stroke bg-gray py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    name="role"
                    id="role"
                    value={userData.role}
                    disabled
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4.5">
                <Button
                  type="button"
                  title={showChangePassword ? 'Cancel' : 'Change Password'}
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className={
                    showChangePassword
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-primary hover:bg-opacity-90 text-gray'
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        {showChangePassword && (
          <div className="col-span-5 xl:col-span-3">
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Change Password
                </h3>
              </div>
              <div className="p-7">
                <div className="mb-5.5">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="newPassword"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      className={`w-full rounded border py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:bg-meta-4 dark:text-white dark:focus:border-primary ${
                        errors.newPassword 
                          ? 'border-red-500 dark:border-red-500' 
                          : 'border-stroke dark:border-strokedark'
                      }`}
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      id="newPassword"
                      placeholder="Enter new password (minimum 8 characters)"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300"
                      tabIndex={-1}
                      onClick={() => setShowNewPassword((prev) => !prev)}
                    >
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.236.938-4.675M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.062-4.675A9.956 9.956 0 0122 9c0 5.523-4.477 10-10 10a9.956 9.956 0 01-4.675-.938M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm7.5 0c-1.74 4.5-6.26 7.5-10.5 7.5S2.74 16.5 1 12c1.74-4.5 6.26-7.5 10.5-7.5S20.26 7.5 22 12z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.newPassword}</p>
                  )}
                </div>

                <div className="mb-5.5">
                  <label
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                    htmlFor="confirmPassword"
                  >
                    Confirm New Password
                  </label>
                  <input
                    className={`w-full rounded border py-3 px-4.5 text-black focus:border-primary focus-visible:outline-none dark:bg-meta-4 dark:text-white dark:focus:border-primary ${
                      errors.confirmPassword 
                        ? 'border-red-500 dark:border-red-500' 
                        : 'border-stroke dark:border-strokedark'
                    }`}
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex justify-end gap-4.5">
                  <Button
                    type="button"
                    onClick={handleSubmitPassword}
                    title='submit'
                  >
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileSetting;
