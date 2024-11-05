import React, { useEffect, useState } from 'react';
import Select from "react-select";
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb";
import Swal from 'sweetalert2';
import { API_Create_User, API_List_Partner } from '../../../api/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const AddUser = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(API_List_Partner(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      
      const result = await response.json();
      const suppliersList = result.data.map(supplier => ({
        value: supplier.bp_code,
        label: `${supplier.bp_code} | ${supplier.bp_name}`,
      }));
      
      setSuppliers(suppliersList);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    }
  };

  const handleSupplierChange = (selectedOption) => {
    setSelectedSupplier(selectedOption);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(!value.includes('@'));
  };


  const generateRandomPassword = () => {
    if (selectedSupplier) {
      const bpCode = selectedSupplier.value;
      // Get 4 characters after first 3 characters
      const codeAfterThree = bpCode.substring(3, 7);

      // Generate random characters for the remaining 6 characters
      const randomChars = Array.from({ length: 6 }, () => 
        'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
      ).join('');

      // Put supplier code first, then random chars (total 10 chars)
      const finalPassword = codeAfterThree + randomChars;

      setPassword(finalPassword);
    } else {
      Swal.fire('Error', 'Please select a supplier first', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSupplier || emailError) {
      Swal.fire('Error', 'Please fill all required fields correctly.', 'error');
      return;
    }

    const payload = {
      bp_code: selectedSupplier.value,
      name: firstName,
      role,
      status: "1",  // Default status for new users, can be adjusted as needed
      username,
      password,
      email,
    };

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_Create_User(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Swal.fire('Success', 'User successfully created!', 'success');
        resetForm();
      } else {
        Swal.fire('Error', `Failed to create user: ${result.message}`, 'error');
      }
    } catch (error) {
      console.error('Error during user creation:', error);
      Swal.fire('Error', 'An error occurred while creating the user.', 'error');
    }
  };

  const resetForm = () => {
    setSelectedSupplier(null);
    setFirstName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("");
  };

  return (
    <>
      <Breadcrumb pageName="Add User" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <form onSubmit={handleSubmit} className="max-w-[1024px] mx-auto">
          <div className="p-4 md:p-6.5">
            {/* Supplier Selection */}
            <div className="mb-4.5 w-full">
              <label className="mb-2.5 block text-black dark:text-white">
                Select Supplier <span className="text-meta-1">*</span>
              </label>
              <div className="w-full max-w-[600px]">
                <Select
                  id="supplier_id"
                  options={suppliers}
                  value={selectedSupplier}
                  onChange={handleSupplierChange}
                  placeholder="Search Supplier"
                  className="w-full"
                  isClearable
                />
              </div>
            </div>

            {/* Name and Role in one row */}
            <div className="mb-4.5 flex flex-col md:flex-row gap-4 md:gap-6">
              <div className="w-full md:w-[300px]">
                <label className="mb-2.5 block text-black dark:text-white">
                  Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter name"
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                    </div>

                    <div className="w-full md:w-[300px]">
                <label className="mb-2.5 block text-black dark:text-white">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="" disabled>Select a role</option>
                  <option value="4">Admin</option>
                  <option value="3">Purchasing</option>
                  <option value="2">Warehouse</option>
                  <option value="1">Supplier</option>
                  <option value="5">Supplier Subcont</option>
                </select>
                    </div>
                  </div>

                  {/* Username and Email in one row */}
                  <div className="mb-4.5 flex flex-col md:flex-row gap-4 md:gap-6">
                    <div className="w-full md:w-[300px]">
                <label className="mb-2.5 block text-black dark:text-white">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                    </div>

                    <div className="w-full md:w-[300px]">
                <label className="mb-2.5 block text-black dark:text-white">
                  Email <span className="text-meta-1">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter email address"
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
                {emailError && <span className="text-meta-1 text-sm mt-1">Email must contain "@" symbol.</span>}
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="mb-2.5 block text-black dark:text-white">
                Password
              </label>
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="relative w-full md:w-[300px]">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min. 8 characters)"
                    required
                    minLength={8}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-500" />
                    ) : (
                      <FaEye className="text-gray-500" />
                    )}
                  </button>
                  {password.length > 0 && password.length < 8 && (
                  <span className="text-meta-1 text-sm mt-1">Password must be at least 8 characters</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={generateRandomPassword}
                  className="w-full h-11 md:w-auto rounded bg-primary py-2 px-4 text-white hover:bg-opacity-90 text-sm"
                >
                  Generate Password
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full justify-center rounded bg-blue-900 p-3 font-medium text-white hover:bg-opacity-90"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddUser;
