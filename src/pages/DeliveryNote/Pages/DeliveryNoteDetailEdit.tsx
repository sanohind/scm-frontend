import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import { API_DN_Detail, API_Update_DN_Supplier } from '../../../api/api';
import { FaPrint } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';

const DeliveryNoteDetailEdit = () => {
  interface Detail {
    no: string;
    dnDetailNo: string;
    partNumber: string;
    partName: string;
    UoM: string;
    QTY: string;
    qtyLabel: string;
    qtyRequested: string;
    qtyConfirm: string;
    qtyDelivered: string;
    qtyMinus: string;
  }

  interface DNDetails {
    noDN: string;
    noPO: string;
    planDelivery: string;
    statusDN: string;
    confirmUpdateAt: string;
  }
  
  const [dnDetails, setDNDetails] = useState<DNDetails>({
    noDN: '',
    noPO: '',
    planDelivery: '',
    statusDN: '',
    confirmUpdateAt: '',
  });
  const [filteredData, setFilteredData] = useState<Detail[]>([]);
  const [confirmMode, setConfirmMode] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const noDN = new URLSearchParams(location.search).get('noDN');

  // Fetch Delivery Note Details
  const fetchDeliveryNotes = async () => {
    const token = localStorage.getItem('access_token');
    setLoading(true);
    try {
      const response = await fetch(`${API_DN_Detail()}${noDN}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch delivery notes');

      const result = await response.json();

      if (result && result.data) {
        const dn = result.data;
        setDNDetails({
          noDN: dn.no_dn,
          noPO: dn.po_no,
          planDelivery: dn.plan_delivery_date,
          statusDN: dn.status_desc,
          confirmUpdateAt: dn.confirm_update_at,
        });
        

        const details = dn.detail.map((detail: any, index: number) => ({
          no: (index + 1).toString(),
          dnDetailNo: detail.dn_detail_no || '',
          partNumber: detail.part_no || '-',
          partName: detail.item_desc_a || '-',
          UoM: detail.dn_unit || '-',
          QTY: detail.dn_qty || '-',
          qtyLabel: detail.dn_snp || '-',
          qtyRequested: detail.dn_qty || '-',
          qtyConfirm: detail.qty_confirm ?? detail.dn_qty,
          qtyDelivered: detail.receipt_qty || '-',
          qtyMinus: Number(detail.dn_qty || 0) - Number(detail.receipt_qty || 0),
        }));

        
        setFilteredData(details);
        setLoading(false);
      } else {
        toast.error('No Delivery Notes found.');
      }
    } catch (error) {
      console.error('Error fetching delivery notes:', error);
      if (error instanceof Error) {
        toast.error(`Error fetching delivery notes: ${error.message}`);
      } else {
        toast.error('Error fetching delivery notes');
      }
    }
  };

  useEffect(() => {
    if (noDN) {
      fetchDeliveryNotes();
    }
  }, [noDN]);

  const handleConfirmMode = () => {
    setConfirmMode(true);
    setIsCheckboxChecked(false);
  };

  const handleCancel = () => {
    setConfirmMode(false);
    fetchDeliveryNotes();
  };

  const handleQtyChange = (index: number, value: string) => {
    const updatedData = [...filteredData];
    updatedData[index].qtyConfirm = value;
    setFilteredData(updatedData);
  };

  const handleSubmit = async () => {
    const updates = filteredData.map(detail => ({
      dn_detail_no: detail.dnDetailNo,
      qty_confirm: parseInt(detail.qtyConfirm),
    }));

    const payload = {
      no_dn: dnDetails.noDN,
      updates: updates,
    };

    try {
      const response = await fetch(`${API_Update_DN_Supplier()}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update DN details');

      toast.success('Data submitted successfully!');
      Swal.fire('Success', 'Data submitted successfully!', 'success');
      setConfirmMode(false);
      setIsCheckboxChecked(false);
      fetchDeliveryNotes();
    } catch (error) {
      console.error('Failed to update DN details:', error);
      if (error instanceof Error) {
        toast.error(`Failed to update DN details: ${error.message}`);
      } else {
        toast.error('Failed to update DN details');
      }
      Swal.fire('Error', 'Failed to update DN details.', 'error');
    }
  };

  const handlePrintDN = () => {
    window.open(`/#/print/delivery-note?noDN=${noDN}`, '_blank');
  };

  const handlePrintLabel = () => {
    window.open(`/#/print/label/delivery-note?noDN=${noDN}`, '_blank');
  };



  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb pageName="Delivery Note Detail" />
      <div className="font-poppins bg-white text-black">
        <div className="p-2 md:p-4 lg:p-6 space-y-6">
          {/* Header Section */}
          <div className="flex flex-col space-y-4 md:space-y-6">
            {/* No. DN */}
            <div className="flex items-center">
              <span className="text-sm md:text-base font-medium mr-2">No. DN:</span>
              {loading ? (
                <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-32"></div>
              ) : (
                <span className="bg-stone-200 px-4 py-2 rounded-lg text-sm md:text-base">
                  {dnDetails.noDN}
                </span>
              )}
            </div>

            {/* Details Section */}
            <div className="flex flex-col lg:flex-row lg:justify-between space-y-4 lg:space-y-0">
              {/* Left side details */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* No. PO */}
                <div className="flex items-center">
                  <span className="text-sm md:text-base font-medium mr-2">No. PO:</span>
                  {loading ? (
                    <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-32"></div>
                  ) : (
                    <span className="bg-stone-200 px-4 py-2 rounded-lg text-sm md:text-base">
                      {dnDetails.noPO}
                    </span>
                  )}
                </div>
                {/* Plan Delivery Date */}
                <div className="flex items-center">
                  <span className="text-sm md:text-base font-medium mr-2">Plan Delivery Date:</span>
                  {loading ? (
                    <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-36"></div>
                  ) : (
                    <span className="bg-stone-200 px-4 py-2 rounded-lg text-sm md:text-base">
                      {dnDetails.planDelivery}
                    </span>
                  )}
                </div>
              </div>
              {/* Print Buttons */}
              <div className="flex gap-2 items-center">
                <button
                  className="md:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2 text-sm md:text-base font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                  onClick={handlePrintLabel}
                >
                  <FaPrint className="w-4 h-4" />
                  <span>Print Label</span>
                </button>
                <button
                  className="md:w-auto flex items-center justify-center gap-2 px-6 md:px-8 py-2 text-sm md:text-base font-medium text-white bg-blue-900 rounded-lg hover:bg-blue-800 transition-colors duration-200 shadow-md hover:shadow-lg"
                  onClick={handlePrintDN}
                >
                  <FaPrint className="w-4 h-4" />
                  <span>Print DN</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[5%]"
                    >
                      No
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[15%]">
                      Part Number
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[24%]">
                      Part Name
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[8%]">
                      UoM
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[8%]">
                      QTY PO
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[8%]">
                      QTY Label
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[8%]">
                      QTY Requested
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[8%]">
                      QTY Confirm
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[8%]">
                      QTY Delivered
                    </th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-b w-[8%]">
                      QTY Minus
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        {Array.from({ length: 10 }).map((_, idx) => (
                          <td key={idx} className="px-3 py-3 text-center whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredData.length > 0 ? (
                    filteredData.map((detail, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.no}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {detail.partNumber}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.partName}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.UoM}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.QTY}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {detail.qtyLabel}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {detail.qtyRequested}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {confirmMode ? (
                            <input
                              type="number"
                              className="border border-gray-300 rounded text-center"
                              value={detail.qtyConfirm}
                              onChange={(e) => handleQtyChange(index, e.target.value)}
                            />
                          ) : (
                            detail.qtyConfirm
                          )}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {detail.qtyDelivered}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {isNaN(Number(detail.qtyMinus)) ? '-' : detail.qtyMinus}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-3 py-4 text-center text-gray-500">
                        No details available for this delivery note
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center">
            {!confirmMode && (
              <button
                onClick={handleConfirmMode}
                className="bg-blue-900 text-white px-4 py-2 rounded-lg"
              >
                {dnDetails.confirmUpdateAt ? 'Edit' : 'Confirm Order'}
              </button>
            )}

            {confirmMode && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isCheckboxChecked}
                  onChange={() => setIsCheckboxChecked(!isCheckboxChecked)}
                  className="mr-1"
                />
                <label className="text-sm">
                  I confirm that the data I provided is correct
                </label>
              </div>
            )}
          </div>
          <div className="flex items-center mb-20">
            {confirmMode && (
              <>
                <button
                  onClick={handleSubmit}
                  className={`bg-green-600 text-white px-6 py-2 rounded-lg mr-2 ${
                    !isCheckboxChecked ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={!isCheckboxChecked}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DeliveryNoteDetailEdit;
