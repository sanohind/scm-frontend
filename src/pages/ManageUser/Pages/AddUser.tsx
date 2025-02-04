import { useEffect, useState } from 'react';
import Select from "react-select";
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb";
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { API_Create_User_Admin, API_Get_Email_Admin, API_List_Partner_Admin } from '../../../api/api';
import Button from '../../../components/Forms/Button';
import { roles } from '../../Authentication/Role';

const AddUser = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  // Change emails state to single email string
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (value: string) => {
    const atPos = value.indexOf("@");
    const dotPos = value.lastIndexOf(".");
    return atPos > 0 && dotPos > atPos + 1 && dotPos < value.length - 1;
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(API_List_Partner_Admin(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      
      const result = await response.json();
      const suppliersList = result.data.map((supplier: { bp_code: string; bp_name: string }) => ({
        value: supplier.bp_code,
        label: `${supplier.bp_code} | ${supplier.bp_name}`,
      }));
      
      setSuppliers(suppliersList);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error(`Error fetching suppliers: ${error}`);
    }
  };

  const handleSupplierChange = (selectedOption: { value: string; label: string } | null) => {
    setSelectedSupplier(selectedOption);
    if (selectedOption) {
      fetchEmails(selectedOption.value);
    }
  };

  const fetchEmails = async (supplierCode: string) => {
    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`${API_Get_Email_Admin()}${supplierCode}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch emails');
      
      const result = await response.json();
      if (result.success && result.data) {
        // If result.data is an array, take the first email; otherwise use returned value
        const fetchedEmail = Array.isArray(result.data)
          ? result.data.length > 0
            ? result.data[0]
            : ""
          : result.data;
        if (!fetchedEmail) {
          toast.warning('No emails found for this supplier');
        }
        setEmail(fetchedEmail);
      }
    } catch (error) {
      console.error('Error fetching emails:', error);
      toast.error(`Error fetching emails: ${error}`);
    }
  };

  const generateRandomPassword = () => {
    if (selectedSupplier) {
      const bpCode = selectedSupplier.value;
      // Get 4 characters after first 3 characters
      const codeAfterThree = bpCode.substring(3, 7);

      // Generate random characters for the remaining 6 characters
      const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
      const randomChars = Array.from({ length: 6 }, () => 
        characters[Math.floor(Math.random() * characters.length)]
      ).join('');

      // Put supplier code first, then random chars (total 10 chars)
      const finalPassword = codeAfterThree + randomChars;

      setPassword(finalPassword);
    } else {
      toast.warning('Please select a supplier first to generate a password');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSupplier || !firstName || !role || !username || !password || !email) {
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
      email, // Send email as a string
    };

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(API_Create_User_Admin(), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.status) {
        toast.success('User successfully created!');
        resetForm();
      } else {
        const errorMessages = Object.values(result.errors).flat().join(', ');
        toast.error(`Failed to create user: ${errorMessages}`);
      }
    } catch (error) {
      console.error('Error during user creation:', error);
      toast.error('An error occurred while creating the user.');
    }
  };

  const resetForm = () => {
    // Optionally, reset supplier if needed
    // setSelectedSupplier(null);
    setFirstName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("");
  };


  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="Add User" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <form onSubmit={handleSubmit} className="max-w-[1024px] mx-auto">
          <div className="p-4 md:p-6.5">
            {/* Supplier Selection */}
            <div className="mb-4.5 w-full">
              <label className="mb-2.5 block text-black dark:text-white">
                Select Supplier <span className="text-meta-1">*</span>
              </label>
              <div className="w-full">
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
              <div className="w-full ">
                <label className="mb-2.5 block text-black dark:text-white">
                  Name <span className="text-meta-1">*</span>
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

              <div className="w-full ">
                <label className="mb-2.5 block text-black dark:text-white">
                  Role <span className="text-meta-1">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="" disabled>Select a role</option>
                  {roles.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Username and Email in one row */}
            <div className="mb-4.5 flex flex-col md:flex-row gap-4 md:gap-6">
              <div className="w-full ">
                <label className="mb-2.5 block text-black dark:text-white">
                  Username <span className="text-meta-1">*</span>
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

              <div className="w-full ">
                <label className="mb-2.5 block text-black dark:text-white">
                  Email <span className="text-meta-1">*</span>
                </label>
                <div className="w-full">
                  <input
                    type="text"
                    id="email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => {
                      if (!validateEmail(email)) {
                        setEmailError("Please enter a valid email address");
                      } else {
                        setEmailError("");
                      }
                    }}
                    placeholder="Enter email..."
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  {emailError && (
                    <span className="text-red-500 text-sm mt-1">{emailError}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="mb-2.5 block text-black dark:text-white">
                Password
              </label>
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                <div className="relative w-full md:w[1/2]">
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
                
                <div className="w-full md:w[1/2] flex items-center">
                  <Button
                  title="Generate Password"
                  onClick={generateRandomPassword}
                  className="w-full md:w-auto"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              title="Create User"
              type="submit"
              className="w-full justify-center"
            />
          </div>
        </form>
      </div>
    </>
  );
};

export default AddUser;