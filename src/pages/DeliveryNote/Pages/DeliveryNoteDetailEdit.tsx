import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import { API_DN_Detail, API_Update_DN_Supplier } from '../../../api/api';
import { FaPrint } from 'react-icons/fa';

const DeliveryNoteDetailEdit = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dnDetails, setDNDetails] = useState({});
  const [confirmMode, setConfirmMode] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const location = useLocation();
  const noDN = new URLSearchParams(location.search).get('noDN');

  // Fetch Delivery Note Details
  const fetchDeliveryNotes = async () => {
    const token = localStorage.getItem('access_token');

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
        

        const details = dn.detail.map((detail, index) => ({
          no: (index + 1).toString(),
          dnDetailNo: detail.dn_detail_no || '',
          partNumber: detail.part_no || '-',
          partName: detail.item_desc_a || '-',
          UoM: detail.dn_unit || '-',
          QTY: detail.dn_qty || 0,
          qtyLabel: detail.dn_snp || '-',
          qtyRequested: detail.dn_qty || 0,
          qtyConfirm: detail.qty_confirm ?? detail.dn_qty,
          qtyDelivered: detail.receipt_qty || 0,
          qtyMinus: (detail.dn_qty || 0) - (detail.receipt_qty || 0),
        }));

        

        setData(details);
        setFilteredData(details);

      } else {
        Swal.fire('Error', 'No Delivery Notes found.', 'error');
      }
    } catch (error) {
      console.error('Error fetching delivery notes:', error);
      Swal.fire('Error', 'Failed to fetch delivery notes.', 'error');
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

  const handleQtyChange = (index, value) => {
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

      Swal.fire('Success', 'Data submitted successfully!', 'success');
      setConfirmMode(false);
      setIsCheckboxChecked(false);
      fetchDeliveryNotes();
    } catch (error) {
      console.error('Failed to update DN details:', error);
      Swal.fire('Error', 'Failed to update DN details.', 'error');
    }
  };



  return (
    <>
      <Breadcrumb pageName="Delivery Note Detail" />
      <div className="font-poppins bg-white text-black">
        <div className="flex flex-col p-6 gap-4">
          <div className="flex items-center">
            <span className="mr-2">No. DN:</span>
            <span className="bg-stone-300 px-4 py-2 rounded">{dnDetails.noDN}</span>
          </div>
          
          <div className="flex justify-between">
            
            <div className="flex gap-4">
              <div className="flex items-center">
                <span className="mr-2">No. PO:</span>
                <span className="bg-stone-300 px-4 py-2 rounded">{dnDetails.noPO}</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">Plan Delivery Date:</span>
                <span className="bg-stone-300 px-4 py-2 rounded">{dnDetails.planDelivery}</span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => window.print()}
              >
                <FaPrint className="w-4 h-4" /> {/* Print icon added here */}
                <span>Print Label</span>
              </button>
              <button
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded"
                onClick={() => window.print()}
              >
                <FaPrint className="w-4 h-4" /> {/* Print icon added here */}
                <span>Print DN</span>
              </button>
            </div>
          </div>

          <div className="relative overflow-x-auto shadow-md rounded-lg border border-gray-300 mt-1">
            <table className="w-full text-sm text-left text-gray-700">
              <thead className="text-base text-gray-700">
                <tr>
                  <th className="px-2 py-3 text-center">No</th>
                  <th className="px-2 py-3 text-center">Part Number</th>
                  <th className="px-2 py-3 text-center">Part Name</th>
                  <th className="px-2 py-3 text-center">UoM</th>
                  <th className="px-2 py-3 text-center">QTY PO</th>
                  <th className="px-2 py-3 text-center">QTY Label</th>
                  <th className="px-2 py-3 text-center">QTY Requested</th>
                  <th className="px-2 py-3 text-center">QTY Confirm</th>
                  <th className="px-2 py-3 text-center">QTY Delivered</th>
                  <th className="px-2 py-3 text-center">QTY Minus</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((detail, index) => (
                  <tr key={index} className="odd:bg-white even:bg-gray-50 border-b">
                    <td className="px-2 py-4 text-center">{detail.no}</td>
                    <td className="px-2 py-4 text-center">{detail.partNumber}</td>
                    <td className="px-2 py-4 text-center">{detail.partName}</td>
                    <td className="px-2 py-4 text-center">{detail.UoM}</td>
                    <td className="px-2 py-4 text-center">{detail.QTY}</td>
                    <td className="px-2 py-4 text-center">{detail.qtyLabel}</td>
                    <td className="px-2 py-4 text-center">{detail.qtyRequested}</td>
                    <td className="px-2 py-4 text-center">
                      {confirmMode ? (
                        <input
                          type="number"
                          className="border border-gray-300 rounded px-2 py-1 text-center"
                          value={detail.qtyConfirm}
                          onChange={(e) => handleQtyChange(index, e.target.value)}
                        />
                      ) : (
                        detail.qtyConfirm
                      )}
                    </td>
                    <td className="px-2 py-4 text-center">{detail.qtyDelivered}</td>
                    <td className="px-2 py-4 text-center">{detail.qtyMinus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center">
            {!confirmMode && (
              <button
                onClick={handleConfirmMode}
                className="bg-blue-500 text-white px-4 py-2 rounded"
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
                <label className="text-sm">I confirm that the data I provided is correct</label>
              </div>
            )}

          </div>
          <div className="flex items-center mb-20">
            {confirmMode && (
              <>
                <button
                  onClick={handleSubmit}
                  className={`bg-green-500 text-white px-6 py-2 rounded mr-2 ${!isCheckboxChecked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!isCheckboxChecked}
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-red-500 text-white px-4 py-2 rounded"
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
