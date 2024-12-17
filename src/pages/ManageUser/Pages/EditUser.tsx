import { useEffect, useState } from "react";
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb";
import Select from "react-select";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast, ToastContainer } from 'react-toastify';
import { API_Edit_User_Admin, API_List_Partner_Admin, API_Update_User_Admin } from "../../../api/api";
import Button from "../../../components/Forms/Button";


const EditUser = () => {
  const [suppliers, setSuppliers] = useState<{ value: string; label: string }[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const userId = queryParams.get('userId');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (userId && suppliers.length > 0) {
      fetchUserData(userId);
    }
  }, [userId, suppliers]);

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

  const fetchUserData = async (userId: string) => {
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${API_Edit_User_Admin()}${userId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user data");

      const dataResponse = await response.json();
      const userData = dataResponse.data;
      populateForm(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(`Error fetching user data: ${error}`);
    }
  };

  const populateForm = (data: { bp_code: string; name: string; role: string; username: string; email: string }) => {
    if (!data) {
      console.error("Cannot populate form: data is undefined");
      return;
    }
    const matchedSupplier = suppliers.find((sup) => sup.value === data.bp_code);
    setSelectedSupplier(matchedSupplier || null);
    setFirstName(data.name || "");
    setRole(data.role || "");
    setUsername(data.username || "");
    setEmail(data.email || "");
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSupplier || emailError) {
      Swal.fire('Error', 'Please fill all required fields correctly.', 'error');
      return;
    }

    const payload = {
      bp_code: selectedSupplier.value,
      username: username,
      name: firstName,
      role,
      password: password || null,
      email,
    };

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_Update_User_Admin()}${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('User successfully updated!');
        setTimeout(() => {
          navigate('/list-user');
        }, 1000);
      } else {
        if (result.errors?.username) {
          toast.error(result.errors.username[0]);
        } else {
          toast.error(result.message || 'Failed to update user');
        }
      }
    } catch (error) {
      console.error('Error during user update:', error);
      toast.error('An error occurred while updating the user.');
    }
  };


  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb 
        pageName="Edit User" 
        isSubMenu={true}
        parentMenu={{
          name: "Manage User",
          link: "/list-user" // Explicit link to parent
        }}
      />
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
                  onChange={setSelectedSupplier}
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
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-d</a>efault disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="w-full md:w-[300px]">
                <label className="mb-2.5 block text-black dark:text-white">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-p</header>rimary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  required
                >
                  <option value="" disabled>Select a role</option>
                  <option value="1">Super Admin</option>
                  <option value="9">Super User</option>
                  <option value="2">Admin Purchasing</option>
                  <option value="3">Admin Warehouse</option>
                  <option value="4">Admin Subcont</option>
                  <option value="5">Supplier Marketing</option>
                  <option value="6">Supplier Subcont Marketing</option>
                  <option value="7">Supplier Warehouse</option>
                  <option value="8">Supplier Subcont</option>
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
                    placeholder="Leave blank to keep current"
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
                    <span className="text-meta-1 text-sm mt-1">
                      Password must be at least 8 characters
                    </span>
                  )}
                </div>
                <Button
                  title="Generate Password"
                  onClick={generateRandomPassword}
                  className="md:self-center"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full justify-center rounded bg-blue-900 p-3 font-medium text-white hover:bg-opacity-90"
            >
              Edit User
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditUser;