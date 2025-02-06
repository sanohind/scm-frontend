import { useEffect, useState } from "react";
import { API_Email_Organization_Admin, API_List_Partner_Admin, API_Update_Email_Organization_Admin } from "../../../api/api";
import { toast, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import Breadcrumb from "../../../components/Breadcrumbs/Breadcrumb";
import Select from "react-select";

const ManageOrganization = () => {
    const [suppliers, setSuppliers] = useState<{ value: string; label: string }[]>([]);
    const [selectedSupplier, setSelectedSupplier] = useState<{ value: string; label: string } | null>(null);
    const [emails, setEmails] = useState<string[]>([]);


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

    useEffect(() => {
        if (selectedSupplier) {
            fetchEmails(selectedSupplier.value);
        }
    }, [selectedSupplier]);

    const fetchEmails = async (bpCode: string) => {
        const token = localStorage.getItem("access_token");
        try {
        const response = await fetch(`${API_Email_Organization_Admin()}${bpCode}`, {
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

    const populateForm = (data: { email: string[] }) => {
        if (!data) {
            console.error("Cannot populate form: data is undefined");
            return;
        }
        setEmails(Array.isArray(data.email) ? data.email : [data.email || ""]);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedSupplier) {
            Swal.fire('Error', 'Please fill all required fields correctly.', 'error');
        return;
        }

        const payload = {
        email: emails.filter(email => email.trim() !== ""),
        };

        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch(`${API_Update_Email_Organization_Admin()}${selectedSupplier.value}`, {
                method: 'PUT',
                headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok && result.status) {
                toast.success('Email successfully updated!');
            } else {
                toast.error(result.message || 'Failed to update email');
            }
        } catch (error) {
            console.error('Error during email update:', error);
            toast.error('An error occurred while updating the email.');
        }
    };

    const EmailInput = () => {
        const [inputValue, setInputValue] = useState('');
        
        const handleEmailRemove = (index: number) => {
            setEmails(emails.filter((_, i) => i !== index));
        };

        const addEmail = (email: string) => {
            const trimmed = email.trim();
            if (trimmed !== "") {
                setEmails(prev => [...prev, trimmed]);
            }
        };

        const processInput = (value: string) => {
            // If semicolon is typed, split and add each valid email
            if (value.includes(';')) {
                const parts = value.split(';');
                parts.slice(0, -1).forEach(email => {
                    if (email.trim() !== "") addEmail(email);
                });
                // Set the remaining part as the input value (could be empty)
                return parts[parts.length - 1];
            }
            return value;
        };
        
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            let value = e.target.value;
            value = processInput(value);
            setInputValue(value);

            // Auto-add email if valid based on common domains or when semicolon is used
            const validDomains = ['.com', '.co.id', '.net', '.org', '.edu', '.gov', '.io', '.tech'];
            const hasAt = value.includes('@');
            const endsWithValidDomain = validDomains.some(domain => value.endsWith(domain));
            if (hasAt && endsWithValidDomain) {
                addEmail(value);
                setInputValue('');
                setTimeout(() => {
                    document.getElementById('email-input')?.focus();
                }, 0);
            }
        };

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (inputValue) {
                    addEmail(inputValue);
                    setInputValue('');
                    setTimeout(() => {
                    document.getElementById('email-input')?.focus();
                    }, 0);
                }
            }
        };

        const handleBlur = () => {
            if (inputValue) {
                addEmail(inputValue);
                setInputValue('');
                setTimeout(() => {
                    document.getElementById('email-input')?.focus();
                }, 0);
            }
        };

        return (
        <div className="w-full">
            <div className="flex flex-wrap gap-2 p-2 mb-2 rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary">
            {emails.map((email, index) => (
                <span key={index} className="bg-blue-100 px-2 py-1 rounded-md flex items-center gap-2">
                {email}
                    <button 
                        type="button"
                        onClick={() => handleEmailRemove(index)}
                        className="text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </span>
            ))}
            <input
                type="text"
                id="email-input"
                value={inputValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder="Type email ..."
                className="outline-none border-none flex-1 min-w-[200px]"
            />
            </div>
        </div>
        );
    };


    return (
        <>
            <ToastContainer position="top-right" />
            <Breadcrumb pageName="Manage Email Notification" />
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <form onSubmit={handleSubmit} className="max-w-[1024px] mx-auto">
                    <div className="p-4 md:p-6.5 space-y-4">
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
                        
                        {/* Email Fields */}
                        <div className="w-full">
                            <label className="mb-2.5 block text-black dark:text-white">
                                Email 
                            </label>
                            <EmailInput />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            className="w-full justify-center rounded bg-blue-900 p-3 font-medium text-white hover:bg-opacity-90"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ManageOrganization;