import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify';
import { 
  API_Transaction_Review_Detail_Subcont_Admin, 
  API_Transaction_Review_Update_Subcont_Admin } from '../../../../../api/api';
import Breadcrumb from '../../../../../components/Breadcrumbs/Breadcrumb';
import Button from '../../../../../components/Forms/Button';

const TransactionReviewDetail = () => {
  interface Detail {
    no: string;
    transactionId: string;
    partNumber: string;
    partName: string;
    oldPartName: string;
    qtyOk: string;
    qtyNg: string;
    qtyTotal: string;
    actualQtyOk: string;
    actualQtyNg: string;
    actualQtyTotal: string;
    itemId: string;
  }

  interface DNDetails {
    noDN: string;
    status: string;
    transactionDate: string;
  }
  
  const [dnDetails, setDNDetails] = useState<DNDetails>({
    noDN: '',
    status: '',
    transactionDate: '',
  });
  const [filteredData, setFilteredData] = useState<Detail[]>([]);
  const [confirmMode, setConfirmMode] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const noDN = new URLSearchParams(location.search).get('noDN');

  // Fetch transaction review Details
  const fetchTransactionReviewDetail = async () => {
    const token = localStorage.getItem('access_token');
    setLoading(true);
    try {
      const response = await fetch(`${API_Transaction_Review_Detail_Subcont_Admin()}${noDN}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) throw new Error('Failed to fetch transaction reviews');
  
      const result = await response.json();
  
      if (result && result.data) {
        const dn = result.data;
  
        const dnDetails = {
          noDN: dn.dn_number || '',
          status: dn.status || '',
          transactionDate: dn.date_time || '',
        };
  
        setDNDetails(dnDetails);
  
        const details = dn.detail.map((detail: any, index: number) => {  
          return {
            no: (index + 1).toString(),
            transactionId: detail.sub_transaction_id,
            itemId: detail.sub_item_id,
            partNumber: detail.part_number || '-',
            partName: detail.part_name || '-',
            oldPartName: detail.old_part_name || '-',
            qtyOk: detail.qty_ok,
            qtyNg: detail.qty_ng,
            qtyTotal: detail.qty_total || '-',
            actualQtyOk: detail.actual_qty_ok || '-',
            actualQtyNg: detail.actual_qty_ng || '-',
            actualQtyTotal: detail.actual_qty_total || '-',
          };
        });
        setFilteredData(details);
        setLoading(false);
      } else {
        toast.error('No transaction reviews found.');
      }
    } catch (error) {
      console.error('Error fetching transaction reviews:', error);
      if (error instanceof Error) {
        toast.error(`Error fetching transaction reviews: ${error.message}`);
      } else {
        toast.error('Error fetching transaction reviews');
      }
    }
  };

  useEffect(() => {
    if (noDN) {
      fetchTransactionReviewDetail();
    }
  }, [noDN]);

  const handleConfirmMode = () => {
    const updatedData = filteredData.map((detail) => ({
      ...detail,
      actualQtyOk: detail.actualQtyOk === '-' ? detail.qtyOk : detail.actualQtyOk,
      actualQtyNg: detail.actualQtyNg === '-' ? detail.qtyNg : detail.actualQtyNg,
    }));
    setFilteredData(updatedData);
    setConfirmMode(true);
    setIsCheckboxChecked(false);
  };

  const handleQtyChangeOk = (index: number, value: string) => {
    const updatedData = [...filteredData];
    const numValue = Number(value);
  
    if (numValue < 0) {
      toast.warning('QTY Confirm Cannot be Negative');
      return;
    }
  
    updatedData[index].actualQtyOk = value;
    setFilteredData(updatedData);
  };
  
  const handleQtyChangeNg = (index: number, value: string) => {
    const updatedData = [...filteredData];
    const numValue = Number(value);
  
    if (numValue < 0) {
      toast.warning('QTY Confirm Cannot be Negative');
      return;
    }
  
    updatedData[index].actualQtyNg = value;
    setFilteredData(updatedData);
  };

  const handleCancel = () => {
    setConfirmMode(false);
    fetchTransactionReviewDetail();
  };

  const handleSubmit = async () => {
    if (confirmMode) {
      const data = filteredData.map(detail => ({
        sub_transaction_id: detail.transactionId,
        sub_item_id: detail.itemId,
        actual_qty_ok: detail.actualQtyOk,
        actual_qty_ng: detail.actualQtyNg,
      }));

      const payload = {
        data
      };
  
      try {
        const response = await fetch(`${API_Transaction_Review_Update_Subcont_Admin()}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) throw new Error('Failed to confirm actual QTY received');
  
        toast.success('Data submitted successfully!');
        Swal.fire({
          title: 'Success',
          text: 'Data submitted successfully!', 
          icon: 'success',
          confirmButtonColor: '#1e3a8a'
        });
        setConfirmMode(false);
        setIsCheckboxChecked(false);
        fetchTransactionReviewDetail();
      } catch (error) {
        console.error('Failed to confirm actual QTY received:', error);
        if (error instanceof Error) {
          toast.error(`${error.message}`);
        } else {
          toast.error('Failed to confirm actual QTY received');
        }
        Swal.fire({
          title: 'Error',
          text: 'Failed to confirm actual QTY received.',
          icon: 'error',
          confirmButtonColor: '#1e3a8a'
        });
      }
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb 
        pageName="Transaction Review Detail" 
        isSubMenu={true}
        parentMenu={{
          name: "Transaction Review",
          link: "/transactions-review"
        }}
      />
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
            <div className="flex flex-col lg:flex-row lg:justify-between space-y-4 lg:space-y-0 lg:gap-4">
              {/* Left side details */}
              <div className="flex flex-col md:flex-row gap-4">
                {/* Status */}
                <div className="flex items-center">
                  <span className="text-sm md:text-base font-medium mr-2">Status:</span>
                  {loading ? (
                    <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-32"></div>
                  ) : (
                    <span className="bg-stone-200 px-4 py-2 rounded-lg text-sm md:text-base">
                      {dnDetails.status}
                    </span>
                  )}
                </div>
                {/* Plan Delivery Date */}
                <div className="flex items-center">
                  <span className="text-sm md:text-base font-medium mr-2">Transaction Date:</span>
                  {loading ? (
                    <div className="h-8 bg-gray-200 animate-pulse rounded-lg w-36"></div>
                  ) : (
                    <span className="bg-stone-200 px-4 py-2 rounded-lg text-sm md:text-base">
                      {dnDetails.transactionDate}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]" rowSpan={2}>No</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[17%]" rowSpan={2}>Part Number</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[18%]" rowSpan={2}>Part Name</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[30%]" colSpan={3}>Confirm Supplier</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[30%]" colSpan={3}>Actual Received</th>
                  </tr>
                  <tr>
                      <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[10%]">QTY OK</th>
                      <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[10%]">QTY NG</th>
                      <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[10%]">Total</th>
                      <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[10%]">QTY OK</th>
                      <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[10%]">QTY NG</th>
                      <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[10%]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        {Array.from({ length: 9 }).map((_, idx) => (
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
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.partNumber}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.partName}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.qtyOk}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.qtyNg}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {detail.qtyTotal}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {confirmMode ? (
                            <input
                              type="number"
                              className="border border-gray-300 rounded text-center"
                              value={detail.actualQtyOk}
                              onChange={(e) => handleQtyChangeOk(index, e.target.value)}
                              min="0"
                            />
                          ) : (
                            detail.actualQtyOk
                          )}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {confirmMode ? (
                            <input
                              type="number"
                              className="border border-gray-300 rounded text-center"
                              value={detail.actualQtyNg}
                              onChange={(e) => handleQtyChangeNg(index, e.target.value)}
                              min="0"
                            />
                          ) : (
                            detail.actualQtyNg
                          )}
                        </td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                            {(parseInt(detail.actualQtyOk) + parseInt(detail.actualQtyNg)) || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-3 py-4 text-center text-gray-500">
                        No data available for this transaction review
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
              <>
                <Button
                  title="QTY Confirm"
                  onClick={handleConfirmMode}
                />
              </>
            )}

            {(confirmMode) && (
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCheckboxChecked}
                    onChange={() => setIsCheckboxChecked(!isCheckboxChecked)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm select-none">
                    I confirm that the data I provided is correct
                  </span>
                </label>
              </div>
            )}
          </div>
          <div className="flex items-center mb-20">
            {(confirmMode) && (
              <>
                <Button
                  title="Save"
                  onClick={handleSubmit}
                  disabled={!isCheckboxChecked}
                  className={`mr-2 px-6 ${!isCheckboxChecked ? 'opacity-40 cursor-not-allowed' : ''}`}
                  color='bg-green-600'
                />
                <Button
                  title="Cancel"
                  onClick={handleCancel}
                  color='bg-red-600'
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TransactionReviewDetail;