import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../../../components/Breadcrumbs/Breadcrumb';
import Swal from 'sweetalert2';
import { FaFileExcel, FaPrint } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import { Dropdown } from 'flowbite-react';
import * as XLSX from 'xlsx';
import { API_DN_Detail, API_Update_DN, API_Update_Driver_Info } from '../../../api/api';
import Button from '../../../components/Forms/Button';

const DeliveryNoteDetailEdit = () => {
  interface Detail {
    no: string;
    dnDetailNo: string;
    partNumber: string;
    partName: string;
    UoM: string;
    QTY: string;
    qtyPO: string;
    qtyLabel: string;
    qtyRequested: string;
    qtyConfirm: string;
    qtyDelivered: string;
    qtyReceived: string;
    qtyMinus: string;
    outstandings: { [wave: string]: string | number };
  }

  interface DNDetails {
    noDN: string;
    noPO: string;
    planDelivery: string;
    confirmUpdateAt: string;
    driverName: string;
    platNumber: string;
    [key: string]: string | undefined;
  }
  
  const [dnDetails, setDNDetails] = useState<DNDetails>({
    noDN: '',
    noPO: '',
    planDelivery: '',
    confirmUpdateAt: '',
    driverName: '',
    platNumber: '',
  });
  const [filteredData, setFilteredData] = useState<Detail[]>([]);
  const [confirmMode, setConfirmMode] = useState(false);
  const [outstandingMode, setOutstandingMode] = useState(false);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [waveNumbers, setWaveNumbers] = useState<number[]>([]);
  const location = useLocation();
  const noDN = new URLSearchParams(location.search).get('noDN');
  const allQtyDeliveredMatch = filteredData.every(detail => detail.qtyDelivered === detail.qtyRequested);

  // Daftar kode wilayah plat nomor Indonesia yang valid
  const VALID_REGION_CODES = [
    // Sumatera
    'BL', 'BB', 'BN', 'BA', 'BD', 'BE', 'BG', 'BK', 'BM', 'BP', 'BT',
    // Jawa
    'A', 'B', 'D', 'E', 'F', 'G', 'H', 'K', 'L', 'M', 'N', 'P', 'R', 'S', 'T', 'W', 'Z', 'AA', 'AB', 'AD', 'AE', 'AG',
    // Kalimantan
    'DA', 'KB', 'KH', 'KT', 'KU',
    // Sulawesi
    'DB', 'DC', 'DD', 'DE', 'DG', 'DH', 'DL', 'DM', 'DN', 'DR', 'DT',
    // Bali & Nusa Tenggara
    'DK', 'DR', 'EA', 'EB', 'ED',
    // Maluku & Papua
    'DE', 'DG', 'PA', 'PB'
  ];

  // Helper function to remove spaces from plat number (untuk output ke backend)
  const removePlatNumberSpaces = (platNumber: string): string => {
    return platNumber.replace(/\s/g, '');
  };

  // Helper function to format license plate for display (dengan spasi)
  const formatPlatNumberDisplay = (input: string): string => {
    // Remove all spaces and convert to uppercase
    const cleaned = input.toUpperCase().replace(/\s/g, '');
    
    // Only allow alphanumeric characters, max 12
    const alphanumeric = cleaned.replace(/[^A-Z0-9]/g, '').substring(0, 12);
    
    // Match pattern: letters, then digits, then letters
    const match = alphanumeric.match(/^([A-Z]{1,2})(\d{0,4})([A-Z]{0,3})$/);
    
    if (match) {
      const [, prefix, numbers, suffix] = match;
      let formatted = prefix;
      if (numbers) {
        formatted += ` ${numbers}`;
      }
      if (suffix) {
        formatted += ` ${suffix}`;
      }
      return formatted;
    }
    
    return alphanumeric;
  };

  // Helper function to validate Indonesian license plate format
  const validatePlatNumber = (platNumber: string): { isValid: boolean; error: string } => {
    // Remove spaces for validation
    const cleaned = platNumber.replace(/\s/g, '').toUpperCase();
    
    if (!cleaned) {
      return { isValid: false, error: 'Plat nomor tidak boleh kosong' };
    }

    // Check length (min 4, max 12)
    if (cleaned.length < 4) {
      return { isValid: false, error: 'Plat nomor terlalu pendek (minimal 4 karakter)' };
    }

    if (cleaned.length > 12) {
      return { isValid: false, error: 'Plat nomor terlalu panjang (maksimal 12 karakter)' };
    }

    // Match format: [1-2 letters] [1-4 digits] [1-3 letters]
    const platRegex = /^([A-Z]{1,2})(\d{1,4})([A-Z]{1,3})$/;
    const match = cleaned.match(platRegex);

    if (!match) {
      return { isValid: false, error: 'Format tidak sesuai. Contoh: B1234AB' };
    }

    const [, regionCode, numbers, series] = match;

    // Validate region code
    if (!VALID_REGION_CODES.includes(regionCode)) {
      return { isValid: false, error: `Kode wilayah '${regionCode}' tidak valid` };
    }

    // Validate numbers (tidak boleh 0 atau dimulai dengan 0)
    if (numbers === '0' || numbers.startsWith('0')) {
      return { isValid: false, error: 'Nomor tidak boleh 0 atau dimulai dengan 0' };
    }

    return { isValid: true, error: '' };
  };


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
        const confirmAt = dn.confirm_at || {};
        const confirmAtKeys = Object.keys(confirmAt).sort();
  
        const dnDetails = {
          noDN: dn.no_dn || '',
          noPO: dn.po_no || '',
          planDelivery: dn.plan_delivery_date || '',
          confirmUpdateAt: dn.confirm_update_at,
          driverName: dn.driver_name || '',
          platNumber: dn.plat_number || '',
        };
  
        confirmAtKeys.forEach((key, index) => {
          (dnDetails as any)[`confirmAt${index + 2}`] = confirmAt[key];
        });
  
        setDNDetails(dnDetails);
  
        const waveNumberSet = new Set<number>();
  
        const details = dn.detail.map((detail: any, index: number) => {
          const outstandings: { [wave: string]: string | number } = {};
  
          if (detail.outstanding && typeof detail.outstanding === 'object') {
            for (const key in detail.outstanding) {
              const qtyArray = detail.outstanding[key]; // e.g., [50]
              if (qtyArray && qtyArray.length > 0) {
                const qty = qtyArray[0]; // Assuming the first element
                outstandings[key] = qty;
  
                // Extract wave number
                const waveMatch = key.match(/wave_(\d+)/);
                if (waveMatch && waveMatch[1]) {
                  const waveNumber = parseInt(waveMatch[1], 10);
                  waveNumberSet.add(waveNumber);
                }
              }
            }
          }
  
          return {
            no: (index + 1).toString(),
            dnDetailNo: detail.dn_detail_no || '',
            partNumber: detail.part_no || '-',
            partName: detail.item_desc_a || '-',
            UoM: detail.dn_unit || '-',
            QTY: detail.dn_qty !== null ? detail.dn_qty : '-',
            qtyLabel: detail.dn_snp || '-',
            qtyPO: detail.po_qty || '-',
            qtyRequested: detail.dn_qty || '-',
            qtyConfirm: dn.confirm_update_at === null ? '-' : detail.qty_confirm, // Handle null case
            qtyDelivered: detail.qty_delivery || '-',
            qtyReceived: detail.receipt_qty || '-',
            qtyMinus: Number(detail.dn_qty || 0) - Number(detail.receipt_qty || 0),
            outstandings,
          };
        });
  
        const waveNumbersArray = Array.from(waveNumberSet).sort((a, b) => a - b);
        setWaveNumbers(waveNumbersArray);
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

  const handleConfirmMode = async () => {
    // Show popup to input driver information
    const { value: formValues } = await Swal.fire({
      title: 'Driver Information',
      html:
        '<div style="text-align: left;">' +
        '<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin-bottom: 15px; border-radius: 4px;">' +
        '<p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.5;">' +
        '<strong>Catatan:</strong> Nama driver yang diisikan harus satu orang dan diisi sesuai dengan yang akan datang. Untuk input nama driver tidak boleh memakai simbol.' +
        '</p>' +
        '</div>' +
        '<label style="display: block; margin-bottom: 5px; font-weight: 600;">Driver Name <span style="color: red;">*</span></label>' +
        '<input id="swal-input-driver-name" class="swal2-input" placeholder="Enter driver name" style="width: 90%; margin: 0 0 5px 0;" value="' + (dnDetails.driverName || '') + '">' +
        '<div id="driver-error-message" style="color: #dc2626; font-size: 12px; margin-bottom: 10px; min-height: 16px;"></div>' +
        '<label style="display: block; margin-bottom: 5px; font-weight: 600;">Plat Number <span style="color: red;">*</span></label>' +
        '<input id="swal-input-plat-number" class="swal2-input" placeholder="B 1234 AB" style="width: 90%; margin: 0 0 5px 0; text-transform: uppercase;" value="' + (dnDetails.platNumber || '') + '" maxlength="14">' +
        '<div id="plat-error-message" style="color: #dc2626; font-size: 12px; margin-bottom: 5px; min-height: 16px;"></div>' +
        '<small style="color: #666; font-size: 12px; display: block; margin-bottom: 5px;">Format: B 1234 AB (kode wilayah + nomor + seri)</small>' +
        '<small style="color: #666; font-size: 11px;">Contoh: B 1234 AB, D 5678 XYZ, AA 999 Z</small>' +
        '</div>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Continue',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#1e3a8a',
      cancelButtonColor: '#dc2626',
      didOpen: () => {
        const driverInput = document.getElementById('swal-input-driver-name') as HTMLInputElement;
        const driverErrorDiv = document.getElementById('driver-error-message') as HTMLDivElement;
        const platInput = document.getElementById('swal-input-plat-number') as HTMLInputElement;
        const platErrorDiv = document.getElementById('plat-error-message') as HTMLDivElement;
        
        // Driver name validation
        driverInput.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          // Remove symbols, only allow letters, numbers, and spaces
          const cleaned = target.value.replace(/[^a-zA-Z0-9\s]/g, '');
          target.value = cleaned;
          
          // Real-time validation
          if (cleaned) {
            if (/^[a-zA-Z0-9\s]+$/.test(cleaned)) {
              target.style.borderColor = '#10b981';
              target.style.backgroundColor = '#f0fdf4';
              driverErrorDiv.textContent = '';
            }
          } else {
            target.style.borderColor = '';
            target.style.backgroundColor = '';
            driverErrorDiv.textContent = '';
          }
        });
        
        // Plat number validation
        platInput.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          // Remove non-alphanumeric, format display with spaces
          const formatted = formatPlatNumberDisplay(target.value);
          target.value = formatted;
          
          // Real-time validation
          if (formatted) {
            const validation = validatePlatNumber(formatted);
            if (validation.isValid) {
              target.style.borderColor = '#10b981';
              target.style.backgroundColor = '#f0fdf4';
              platErrorDiv.textContent = '';
            } else {
              target.style.borderColor = '#ef4444';
              target.style.backgroundColor = '#fef2f2';
              platErrorDiv.textContent = validation.error;
            }
          } else {
            target.style.borderColor = '';
            target.style.backgroundColor = '';
            platErrorDiv.textContent = '';
          }
        });
      },
      preConfirm: () => {
        const driverName = (document.getElementById('swal-input-driver-name') as HTMLInputElement).value.trim();
        const platNumber = (document.getElementById('swal-input-plat-number') as HTMLInputElement).value;
        
        if (!driverName) {
          Swal.showValidationMessage('Driver name is required');
          return false;
        }
        
        // Validate driver name (no symbols)
        if (!/^[a-zA-Z0-9\s]+$/.test(driverName)) {
          Swal.showValidationMessage('Driver name cannot contain symbols');
          return false;
        }
        
        if (!platNumber) {
          Swal.showValidationMessage('Plat number is required');
          return false;
        }
        
        // Validate the plat number format
        const validation = validatePlatNumber(platNumber);
        if (!validation.isValid) {
          Swal.showValidationMessage(validation.error);
          return false;
        }
        
        // Return dengan format tanpa spasi untuk backend
        return { driverName, platNumber: removePlatNumberSpaces(platNumber) };
      }
    });

    if (formValues) {
      // Save driver information to backend
      const token = localStorage.getItem('access_token');
      const payload = {
        no_dn: dnDetails.noDN,
        driver_name: formValues.driverName,
        plat_number: formValues.platNumber,
      };

      try {
        const response = await fetch(`${API_Update_Driver_Info()}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) throw new Error('Failed to update driver info');

        // Update local state
        setDNDetails(prev => ({
          ...prev,
          driverName: formValues.driverName,
          platNumber: formValues.platNumber,
        }));
        
        toast.success('Driver information saved successfully!');

        // Continue with confirm mode
        const updatedData = filteredData.map((detail) => ({
          ...detail,
          qtyConfirm: detail.qtyConfirm === '-' ? detail.qtyRequested : detail.qtyConfirm,
        }));
        setFilteredData(updatedData);
        setConfirmMode(true);
        setIsCheckboxChecked(false);
      } catch (error) {
        console.error('Failed to update driver info:', error);
        toast.error('Failed to save driver information');
        Swal.fire({
          title: 'Error',
          text: 'Failed to save driver information. Please try again.',
          icon: 'error',
          confirmButtonColor: '#1e3a8a'
        });
      }
    }
  };

  const handleAddOutstanding = () => {
    const newWaveNumber = waveNumbers.length > 0 ? Math.max(...waveNumbers) + 1 : 1;
    setWaveNumbers([...waveNumbers, newWaveNumber]);

    setDNDetails(prev => ({
      ...prev,
      [`confirmAt${newWaveNumber + 1}`]: '',
    }));

    const updatedData = filteredData.map(detail => {
      const previousOutstandingQty = waveNumbers.reduce((acc, waveNumber) => {
        const waveKey = `wave_${waveNumber}`;
        return acc + (Number(detail.outstandings[waveKey]) || 0);
      }, 0);
      const outstandingQty = Number(detail.qtyRequested) - Number(detail.qtyConfirm) - previousOutstandingQty;
  
      return {
        ...detail,
        outstandings: {
          ...detail.outstandings,
          [`wave_${newWaveNumber}`]: outstandingQty.toString()
        }
      };
    });
    setFilteredData(updatedData);
    setOutstandingMode(true);
    setIsCheckboxChecked(false);
  };

  const handleCancel = () => {
    setConfirmMode(false);
    setOutstandingMode(false);
    fetchDeliveryNotes();
  };

  const handleQtyChange = (index: number, value: string) => {
    const updatedData = [...filteredData];
    const numValue = Number(value);
    const maxQty = Number(updatedData[index].qtyRequested);
  
    if (numValue < 0) {
      toast.warning('QTY Confirm Cannot be Negative');
      return;
    }
    
    if (numValue > maxQty) {
      toast.warning(`QTY Confirm Cannot Exceed QTY Requested. Max : ${maxQty}`);
      return;
    }
  
    updatedData[index].qtyConfirm = value;
    setFilteredData(updatedData);
  };

  const handleOutstandingQtyChange = (index: number, waveKey: string, value: string) => {
    const updatedData = [...filteredData];
    updatedData[index].outstandings[waveKey] = value;
    setFilteredData(updatedData);
  };

  const handleSubmit = async () => {
    if (confirmMode) {
      const updates = filteredData.map(detail => ({
        dn_detail_no: detail.dnDetailNo,
        qty_confirm: parseInt(detail.qtyConfirm || '0', 10),
      }));

      const allZeroOrNegative = updates.every(update => update.qty_confirm <= 0);
      if (allZeroOrNegative) {
          toast.warning('At least one confirm quantity must be greater than 0');
          return;
      }

      const payload = {
        no_dn: dnDetails.noDN,
        updates: updates,
      };
  
      try {
        const response = await fetch(`${API_Update_DN()}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) throw new Error('Failed to update DN details');
  
        toast.success('Data submitted successfully!');
        Swal.fire({
          title: 'Success',
          text: 'Data submitted successfully!', 
          icon: 'success',
          confirmButtonColor: '#1e3a8a'
        });
        setConfirmMode(false);
        setIsCheckboxChecked(false);
        fetchDeliveryNotes();
      } catch (error) {
        console.error('Failed to update DN details:', error);
        if (error instanceof Error) {
          toast.error(`${error.message}`);
        } else {
          toast.error('Failed to update DN details');
        }
        Swal.fire({
          title: 'Error',
          text: 'Failed to update DN details.',
          icon: 'error',
          confirmButtonColor: '#1e3a8a'
        });
      }
    } else if (outstandingMode) {
      const latestWaveNumber = Math.max(...waveNumbers);
      const updates = filteredData.map(detail => {
        const waveKey = `wave_${latestWaveNumber}`;
        return {
          dn_detail_no: detail.dnDetailNo,
          qty_confirm: parseInt(detail.outstandings[waveKey] as string || '0', 10)
        };
      });

      const allZeroOrNegative = updates.every(update => update.qty_confirm <= 0);
      if (allZeroOrNegative) {
          toast.warning('At least one outstanding quantity must be greater than 0');
          return;
      }

      const payload = {
        no_dn: dnDetails.noDN,
        updates: updates,
      };

      try {
        const response = await fetch(`${API_Update_DN()}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
  
        if (!response.ok) throw new Error('Failed to update DN details');

        Swal.fire({
          title: 'Success',
          text: 'Data submitted successfully!', 
          icon: 'success',
          confirmButtonColor: '#1e3a8a'
        });
        setOutstandingMode(false);
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
    }
  };

  const handleDownloadExcel = () => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // First, create header rows with DN and PO information as array of arrays
    const headerRows = [
      ['Delivered To :  PT Sanoh Indonesia', '', '', '', '', '', '', '', '', ''], // Add empty cells to match column count
      ['No. DN :  ' + dnDetails.noDN, '', '', '', '', '', '', '', '', ''],
      ['No. PO :  ' + dnDetails.noPO, '', '', '', '', '', '', '', '', ''],
      ['Plan Delivery Date :  ' + dnDetails.planDelivery, '', '', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', '', ''],
      ['No', 'Part Number', 'Part Name', 'UoM', 'QTY PO', 'QTY Label', 'QTY Requested', 'QTY Confirm', 'QTY Delivered', 'QTY Received' ,'QTY Minus']
    ];

    // Add wave headers if any
    if (waveNumbers.length > 0) {
      const waveHeaders = waveNumbers.map(num => `QTY Confirm ${num + 1}`);
      headerRows[5] = [...headerRows[5], ...waveHeaders];
    }

    // Add worksheet configuration to merge cells
    const merges = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } },
      { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }
    ];

    // Convert all data to array format (including the actual data rows)
    const dataRows = filteredData.map(row => {
      const baseData = [
        row.no,
        row.partNumber,
        row.partName,
        row.UoM,
        Number(row.QTY) || 0,
        Number(row.qtyLabel) || 0,
        Number(row.qtyRequested) || 0,
        Number(row.qtyConfirm) || 0,
        Number(row.qtyDelivered) || 0,
        Number(row.qtyReceived) || 0,
        Number(row.qtyMinus) || 0
      ];
      const waveData = waveNumbers.map(num => Number(row.outstandings[`wave_${num}`]) || 0);
      return [...baseData, ...waveData];
    });
  
    // Calculate totals
    const totalsBase = dataRows.reduce((acc, row) => {
      return {
        qtyPO: acc.qtyPO + Number(row[4] || 0),
        qtyLabel: acc.qtyLabel + Number(row[5] || 0),
        qtyRequested: acc.qtyRequested + Number(row[6] || 0),
        qtyConfirm: acc.qtyConfirm + Number(row[7] || 0),
        qtyDelivered: acc.qtyDelivered + Number(row[8] || 0),
        qtyReceived: acc.qtyReceived + Number(row[9] || 0),
        qtyMinus: acc.qtyMinus + Number(row[10] || 0)
      };
    }, { qtyPO: 0, qtyLabel: 0, qtyRequested: 0, qtyConfirm: 0, qtyDelivered: 0, qtyReceived: 0, qtyMinus: 0 });

    const totalsWaves = waveNumbers.map((_, idx) => {
      return dataRows.reduce((sum, row) => sum + Number(row[11 + idx] || 0), 0);
    });

    // Add totals row
    const totalsRow = [
      'Totals:',
      '',
      '',
      '',
      totalsBase.qtyPO,
      totalsBase.qtyLabel,
      totalsBase.qtyRequested,
      totalsBase.qtyConfirm,
      totalsBase.qtyDelivered,
      totalsBase.qtyReceived,
      totalsBase.qtyMinus,
      ...totalsWaves
    ];
  
    // Combine all rows
    const allRows = [...headerRows, ...dataRows, totalsRow];
  
    // Create worksheet from all rows
    const ws = XLSX.utils.aoa_to_sheet(allRows);
    ws['!merges'] = merges;
  
    // Set column widths (need to adjust based on dynamic columns)
    const baseColWidths = [
      { wch: 5 },  // No
      { wch: 25 }, // Part Number
      { wch: 40 }, // Part Name
      { wch: 8 },  // UoM
      { wch: 12 }, // QTY PO
      { wch: 12 }, // QTY Label
      { wch: 12 }, // QTY Requested
      { wch: 12 }, // QTY Confirm
      { wch: 12 }, // QTY Delivered
      { wch: 12 }, // QTY Received
      { wch: 15 },  // QTY Outstanding 1
      { wch: 15 },  // QTY Outstanding 2
      { wch: 15 },  // QTY Outstanding 3
      { wch: 15 },  // QTY Outstanding 4
      { wch: 15 },  // QTY Outstanding 5
      { wch: 15 },  // QTY Outstanding 6
    ];
    const waveColWidths = waveNumbers.map(() => ({ wch: 15 }));
    ws['!cols'] = [...baseColWidths, ...waveColWidths];
  
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Delivery Note Detail');
  
    // Write to file
    XLSX.writeFile(wb, `delivery_note_${dnDetails.noDN}.xlsx`);
  };

  const handlePrintDN = (status: string) => {
    window.open(`/#/print/delivery-note?noDN=${noDN}&status=${status}`, '_blank');
  };

  const handlePrintLabel = (status: string) => {
    window.open(`/#/print/label/delivery-note?noDN=${noDN}&status=${status}`, '_blank');
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <Breadcrumb 
        pageName="Delivery Note Detail" 
        isSubMenu={true}
        parentMenu={{
          name: "Delivery Note",
          link: "/delivery-note"
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
              <div className="flex flex-col sm:flex-row gap-2 sm:items-center items-start">
                <div className='flex gap-2 items-center'>
                  <Dropdown 
                    label={
                    <div className="flex items-center gap-2">
                      <FaPrint className="w-4 h-4" />
                      <span>Print DN</span>
                    </div>
                    } 
                    dismissOnClick={false} 
                    style={{backgroundColor: 'rgb(30 58 138)', color: 'white'}}
                  >
                    <Dropdown.Item onClick={() => handlePrintDN('all')}>Print All</Dropdown.Item>
                    {dnDetails.confirmUpdateAt && (
                      <Dropdown.Item onClick={() => handlePrintDN('confirm')}>Print Confirm</Dropdown.Item>
                    )}
                    {waveNumbers.map((waveNumber) => (
                    <Dropdown.Item key={`printOutstanding${waveNumber}`} onClick={() => handlePrintDN(`outstanding_${waveNumber}`)}>
                      {`Print Confirm ${waveNumber + 1}`}
                    </Dropdown.Item>
                    ))}
                  </Dropdown>
                  <Dropdown 
                    label={
                    <div className="flex items-center gap-2">
                      <FaPrint className="w-4 h-4" />
                      <span>Print Label</span>
                    </div>
                    }
                    dismissOnClick={false} 
                    style={{backgroundColor: 'rgb(30 58 138)', color: 'white'}}
                  >
                    <Dropdown.Item onClick={() => handlePrintLabel('all')}>Print All</Dropdown.Item>
                    {dnDetails.confirmUpdateAt && (
                      <Dropdown.Item onClick={() => handlePrintLabel('confirm')}>Print Confirm</Dropdown.Item>
                    )}
                    {waveNumbers.map((waveNumber) => (
                    <Dropdown.Item key={`printLabelOutstanding${waveNumber}`} onClick={() => handlePrintLabel(`outstanding_${waveNumber}`)}>
                      {`Print Confirm ${waveNumber + 1}`}
                    </Dropdown.Item>
                    ))}
                  </Dropdown>
                </div>
                <Button
                  title="Download Excel"
                  icon={FaFileExcel}
                  onClick={handleDownloadExcel}
                />
              </div>
            </div>
          </div>

            {/* Driver Info Section */}
            <div className="flex flex-col space-y-4 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-700">Driver Information</h3>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Driver Name */}
                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2">Driver Name:</label>
                  {loading ? (
                    <div className="h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                  ) : (
                    <span className="bg-white px-4 py-2 rounded-lg text-sm border border-gray-300">
                      {dnDetails.driverName || '-'}
                    </span>
                  )}
                </div>
                {/* Plat Number */}
                <div className="flex flex-col flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2">Plat Number:</label>
                  {loading ? (
                    <div className="h-10 bg-gray-200 animate-pulse rounded-lg"></div>
                  ) : (
                    <span className="bg-white px-4 py-2 rounded-lg text-sm border border-gray-300">
                      {formatPlatNumberDisplay(dnDetails.platNumber) || '-'}
                    </span>
                  )}
                </div>
              </div>
            </div>

          {/* Table */}
          <div className="relative overflow-hidden shadow-md rounded-lg border border-gray-300">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[5%]">No</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[15%]">Part Number</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[24%]">Part Name</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">UoM</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">QTY PO</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">SNP</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">QTY Requested</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">
                      <div>
                        {waveNumbers.length > 0 ? 'QTY Confirm 1' : 'QTY Confirm'}
                        {dnDetails.confirmUpdateAt && (
                          <>
                          <div className="border-t border-gray-300 my-1"></div>
                          <div className="text-xs font-normal normal-case">
                            {dnDetails.confirmUpdateAt}
                          </div>
                          </>
                        )}
                      </div>
                    </th>
                    {Object.keys(dnDetails).filter(key => key.startsWith('confirmAt')).map((key, index) => (
                      <th key={key} className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">
                        <div>
                          {`QTY Confirm ${index + 2}`}
                          {dnDetails[key] && (
                            <>
                              <div className="border-t border-gray-300 my-1"></div>
                              <div className="text-xs font-normal normal-case">
                                {new Date(dnDetails[key]).toLocaleString()}
                              </div>
                            </>
                          )}
                        </div>
                      </th>
                    ))}
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">QTY Delivered</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">QTY Received</th>
                    <th className="px-3 py-3.5 text-sm font-bold text-gray-700 uppercase tracking-wider text-center border-x border-b w-[8%]">QTY Minus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index} className="animate-pulse">
                        {Array.from({ length: 10 + waveNumbers.length }).map((_, idx) => (
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
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.UoM}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.qtyPO}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.qtyLabel}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.qtyRequested}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {confirmMode ? (
                            <input
                              type="number"
                              className="border border-gray-300 rounded text-center"
                              value={detail.qtyConfirm}
                              onChange={(e) => handleQtyChange(index, e.target.value)}
                              min="0"
                              max={detail.qtyRequested}
                            />
                          ) : (
                            detail.qtyConfirm
                          )}
                        </td>
                        {waveNumbers.map((waveNumber) => {
                          const waveKey = `wave_${waveNumber}`;
                          const qtyValue = detail.outstandings[waveKey] ?? '-';
                          return (
                            <td key={`qtyOutstanding${waveNumber}`} className="px-3 py-3 text-center whitespace-nowrap">
                              {outstandingMode && waveNumber === Math.max(...waveNumbers) ? (
                                <input
                                  type="number"
                                  className="border border-gray-300 rounded text-center w-full"
                                  value={qtyValue}
                                  onChange={(e) => handleOutstandingQtyChange(index, waveKey, e.target.value)}
                                />
                              ) : (
                                qtyValue
                              )}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.qtyDelivered}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">{detail.qtyReceived}</td>
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {isNaN(Number(detail.qtyMinus)) ? '-' : detail.qtyMinus}
                        </td>
                        
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10 + waveNumbers.length} className="px-3 py-4 text-center text-gray-500">
                        No data available for this delivery note
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center">
            {!confirmMode && !outstandingMode && (
              <>
                {dnDetails.confirmUpdateAt ? (
                  <Button
                    title="Add Outstanding"
                    onClick={handleAddOutstanding}
                    disabled={allQtyDeliveredMatch}
                    className={allQtyDeliveredMatch ? 'bg-gray-300 cursor-not-allowed text-white' : 'bg-blue-900 text-white'}
                  />
                ) : (
                  <Button
                    title="Confirm Order"
                    onClick={handleConfirmMode}
                  />
                )}
              </>
            )}

            {(confirmMode || outstandingMode) && (
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
            {(confirmMode || outstandingMode) && (
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

export default DeliveryNoteDetailEdit;
