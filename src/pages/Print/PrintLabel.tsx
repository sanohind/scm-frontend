import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  BlobProvider,
  Font,
  Image,
} from '@react-pdf/renderer';
import Swal from 'sweetalert2';
import {
  API_Print_Label,
  API_Print_Label_Confirm,
  API_Print_Label_Outstanding,
} from '../../api/api';
import QRCode from 'qrcode';
import { toast, ToastContainer } from 'react-toastify';
import sanohLogo from '../../images/Sanoh-Mono-06.png';

// Register the Poppins font
Font.register({
  family: 'Poppins',
  fonts: [
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf',
      fontWeight: 'normal',
      fontStyle: 'normal',
    },
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Italic.ttf',
      fontWeight: 'normal',
      fontStyle: 'italic',
    },
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Medium.ttf',
      fontWeight: 'medium',
      fontStyle: 'normal',
    },
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-bold.ttf',
      fontWeight: 'bold',
      fontStyle: 'normal',
    },
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-boldItalic.ttf',
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf',
      fontWeight: 'bold',
      fontStyle: 'normal',
    },
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-BoldItalic.ttf',
      fontWeight: 'bold',
      fontStyle: 'italic',
    },
  ],
});

// PDF styles - must use StyleSheet from @react-pdf/renderer
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 7,
    fontFamily: 'Poppins',
    width: '100%',
    height: '100%',
  },
  pageInfo: {
    position: 'absolute',
    flexDirection: 'column',
    top: 5,
    right: 5,
    fontSize: 7,
    fontWeight: 'medium',
  },
  label: {
    width: '33.33%',
    height: '138.5',
    padding: 2,
    borderRight: '1px dashed #000',
    borderBottom: '1px dashed #000',
  },
  table: {
    width: '100%',
    height: '100%',
  },
  downloadAt: {
    position: 'absolute',
    fontSize: 7,
    fontWeight: 'medium',
  },
});

interface LabelDataItem {
  dn_label_no: string;
  lot_number: string;
  qr_number: string;
  qr_number_image: string;
  po_number: string;
  po_number_image: string;
  dn_number: string;
  model: string;
  customer_name: string;
  supplier_name: string;
  part_number: string;
  part_name: string;
  quantity: string;
  delivery_date: string;
  printed_date: string;
  supplier_item_no: string;
  dn_qty: string;
}

const generateQRCode = async (text: string) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text);
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};

const LabelDocument = ({ data }: { data: LabelDataItem[] }) => (
  <Document>
    <Page style={styles.page} size="A4" orientation="landscape">
      <View style={styles.pageInfo} fixed>
        <Text
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} / ${totalPages}`
          }
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          borderLeft: '1px dashed #000',
          borderTop: '1px dashed #000',
        }}
      >
        {data.map((item, index) => (
          <View key={index} style={styles.label}>
            <View style={styles.table}>
              {/* Row 1 */}
              <View
                style={{
                  flexDirection: 'row',
                  border: '1px',
                  borderBottom: 1,
                  height: '11.11%',
                }}
              >
                {/* Row 1 Col 1 */}
                <View
                  style={{
                    borderRight: '1px',
                    width: '25%',
                    justifyContent: 'center',
                    marginLeft: 3,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: 'bold',
                      textAlign: 'left',
                    }}
                  >
                    ERP CODE 
                  </Text>
                </View>
                {/* Row 1 Col 2 */}
                <View
                  style={{
                    width: '50%',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 8,
                      fontWeight: 'bold',
                      textAlign: 'left',
                      paddingLeft: 3,
                    }}
                  >
                    {item.part_number || 'N/A'}
                  </Text>
                </View>
                {/* Row 1 Col 3 - SANOH LOGO (tidak merge) */}
                <View
                  style={{
                    width: '25%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderLeft: 1,
                  }}
                >
                  <Image src={sanohLogo} style={{ width: 30, height: 10 }} />
                </View>
              </View>

              {/* Row 2-4: Col 3 merged untuk QR PO_NUMBER */}
              <View style={{ flexDirection: 'row', height: '33.33%' }}>
                {/* Left side (Row 2-4) */}
                <View style={{ width: '75%' }}>
                  {/* Row 2 */}
                  <View
                    style={{
                      flexDirection: 'row',
                      borderBottom: 1,
                      borderLeft: 1,
                      height: '33.33%',
                    }}
                  >
                    <View
                      style={{
                        borderRight: '1px',
                        width: '33.33%',
                        justifyContent: 'center',
                        marginLeft: 3,
                      }}
                    >
                      <Text style={{ fontSize: 8, fontWeight: 'bold' }}>
                        SUP. PART NO
                      </Text>
                    </View>
                    <View
                      style={{
                        width: '66.67%',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 8,
                          textAlign: 'left',
                          paddingLeft: 3,
                          fontWeight: 'bold',
                        }}
                      >
                        {/* Add ... if char length > 30 */}
                        {item.supplier_item_no.length > 30
                          ? item.supplier_item_no.substring(0, 30) + '...'
                          : item.supplier_item_no || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Row 3 */}
                  <View
                    style={{
                      flexDirection: 'row',
                      borderBottom: 1,
                      borderLeft: 1,
                      height: '33.33%',
                    }}
                  >
                    <View
                      style={{
                        borderRight: '1px',
                        width: '33.33%',
                        justifyContent: 'center',
                        marginLeft: 3,
                      }}
                    >
                      <Text style={{ fontSize: 8, fontWeight: 'bold' }}>PART NAME</Text>
                    </View>
                    <View
                      style={{
                        width: '66.67%',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 8,
                          textAlign: 'left',
                          fontWeight: 'bold',
                          paddingLeft: 3,
                        }}
                      >
                        {item.part_name || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Row 4 */}
                  <View
                    style={{
                      flexDirection: 'row',
                      borderBottom: 1,
                      borderLeft: 1,
                      height: '33.34%',
                    }}
                  >
                    <View
                      style={{
                        borderRight: '1px',
                        width: '33.33%',
                        paddingTop: 2,
                        marginLeft: 3,
                      }}
                    >
                      <Text style={{ fontSize: 7 }}>QTY SNP / T. QTY</Text>
                    </View>
                    <View
                      style={{
                        width: '66.67%',
                        paddingTop: 2,
                        paddingLeft: 3,
                      }}
                    >
                      {item.lot_number && (
                        <Text style={{ fontSize: 7 }}>{item.quantity} / {item.dn_qty}</Text>
                      )}
                    </View>
                  </View>
                </View>

                {/* Right side merged column (QR CODE PO_NUMBER) - Row 2-4 Col 3 */}
                <View
                  style={{
                    width: '25%',
                    borderLeft: 1,
                    borderBottom: 1,
                    borderRight: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    paddingVertical: 2,
                  }}
                >
                  <Image
                    src={item.po_number_image}
                    style={{ width: 45, height: 45 }}
                  />
                </View>
              </View>

              {/* Row 5 */}
              <View
                style={{
                  flexDirection: 'row',
                  borderBottom: 1,
                  borderLeft: 1,
                  borderRight: 1,
                  height: '11.11%',
                }}
              >
                {/* Row 5 Col 1 */}
                <View
                  style={{
                    borderRight: '1px',
                    width: '25%',
                    justifyContent: 'center',
                    marginLeft: 3,
                  }}
                >
                  <Text style={{ fontSize: 7 }}>
                    LOT NO
                  </Text>
                </View>
                {/* Row 5 Col 2 */}
                <View
                  style={{
                    width: '50%',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 7,
                      textAlign: 'left',
                      paddingLeft: 3,
                    }}
                  >
                    {/* Add ... if char length > 25 */}
                    {item.lot_number.length > 25
                      ? item.lot_number.substring(0, 25) + '...'
                      : item.lot_number || 'N/A'}
                  </Text>
                </View>
                {/* Row 5 Col 3 - PO_NUMBER text (tidak merge) */}
                <View
                  style={{
                    width: '25%',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderLeft: 1,
                  }}
                >
                  <Text style={{ fontSize: 8 }}>{item.po_number}</Text>
                </View>
              </View>

              {/* Row 6-9: Col 3 merged untuk QR QR_NUMBER */}
              <View style={{ flexDirection: 'row', height: '44.45%' }}>
                {/* Left side (Row 6-9) */}
                <View style={{ width: '75%' }}>
                  {/* Row 6 */}
                  <View
                    style={{
                      flexDirection: 'row',
                      borderBottom: 1,
                      borderLeft: 1,
                      height: '25%',
                    }}
                  >
                    <View
                      style={{
                        borderRight: '1px',
                        width: '33.33%',
                        justifyContent: 'center',
                        marginLeft: 3,
                      }}
                    >
                      <Text style={{ fontSize: 8, fontWeight: 'bold' }}>SUPPLIER</Text>
                    </View>
                    <View
                      style={{
                        width: '66.67%',
                        justifyContent: 'center',
                        paddingLeft: 3,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 8,
                          fontWeight: 'bold',
                          textAlign: 'left',
                        }}
                      >
                        {item.supplier_name || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Row 7 */}
                  <View
                    style={{
                      flexDirection: 'row',
                      borderBottom: 1,
                      borderLeft: 1,
                      height: '25%',
                    }}
                  >
                    <View
                      style={{
                        borderRight: '1px',
                        width: '33.33%',
                        justifyContent: 'center',
                        marginLeft: 3,
                      }}
                    >
                      <Text style={{ fontSize: 7, alignSelf: 'center' }}>
                        QUALITY
                      </Text>
                    </View>
                    <View
                      style={{
                        borderRight: '1px',
                        width: '33.33%',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 7, alignSelf: 'center' }}>
                        INSPECTION
                      </Text>
                    </View>
                    <View
                      style={{
                        width: '33.34%',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 7, alignSelf: 'center' }}>
                        DELIVERY DATE
                      </Text>
                    </View>
                  </View>

                  {/* Row 8 */}
                  <View
                    style={{
                      flexDirection: 'row',
                      borderLeft: 1,
                      height: '25%',
                    }}
                  >
                    <View
                      style={{
                        borderRight: '1px',
                        width: '33.33%',
                        justifyContent: 'center',
                        marginLeft: 3,
                      }}
                    ></View>
                    <View
                      style={{
                        borderRight: '1px',
                        width: '33.33%',
                        justifyContent: 'center',
                      }}
                    ></View>
                    <View
                      style={{
                        width: '33.34%',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          alignSelf: 'center',
                          fontSize: 7,
                        }}
                      >
                        {item.delivery_date || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  {/* Row 9 */}
                  <View
                    style={{
                      flexDirection: 'row',
                      borderBottom: 1,
                      borderLeft: 1,
                      height: '25%',
                    }}
                  >
                    <View
                      style={{
                        borderRight: '1px',
                        width: '33.33%',
                        justifyContent: 'center',
                        marginLeft: 3,
                      }}
                    ></View>
                    <View
                      style={{
                        borderRight: '1px',
                        width: '33.33%',
                        justifyContent: 'center',
                      }}
                    ></View>
                    <View
                      style={{
                        width: '33.34%',
                        justifyContent: 'center',
                      }}
                    ></View>
                  </View>
                </View>

                {/* Right side merged column (QR CODE QR_NUMBER) - Row 7-9 Col 3 */}
                <View
                  style={{
                    width: '25%',
                    borderLeft: 1,
                    borderBottom: 1,
                    borderRight: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Image
                    src={item.qr_number_image}
                    style={{ width: 48, height: 48 }}
                  />
                  <View
                    style={{
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'white',
                      borderTop: 1,
                      width: '100%',
                    }}
                  >
                    <Text style={{ fontSize: 7 }}>{item.printed_date}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

const PrintLabel = () => {
  const [labelData, setLabelData] = useState<LabelDataItem[]>([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const noDN = queryParams.get('noDN');

  useEffect(() => {
    if (noDN) {
      // Create loading toast for data fetching
      const fetchPromise = fetchLabelData(noDN).then((data) => {
        if (data) {
          setLabelData(data);
          return 'Data loaded successfully';
        }
        throw new Error('Failed to load data');
      });

      toast.promise(fetchPromise, {
        pending: 'Fetching data from server...',
        error: 'Error loading data',
      });
    }
  }, [noDN]);

  const fetchLabelData = async (noDN: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      Swal.fire(
        'Error',
        'Access token is missing. Please log in again.',
        'error',
      );
      return [];
    }

    try {
      const status = queryParams.get('status');
      let apiUrl = API_Print_Label();

      if (status === 'confirm') {
        apiUrl = API_Print_Label_Confirm();
      } else if (status && status.startsWith('outstanding')) {
        const outstandingNumber = status.split('_')[1];
        apiUrl = `${API_Print_Label_Outstanding()}${outstandingNumber}/`;
      }

      const response = await fetch(`${apiUrl}${noDN}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const labelData = await response.json();

      if (labelData.success && labelData.data && labelData.data.length > 0) {
        // Generate QR codes untuk semua item
        const processedData = await Promise.all(
          labelData.data.map(async (item: any) => {
            const qrNumberImage = await generateQRCode(item.qr_number || 'N/A');
            const poNumberImage = await generateQRCode(item.po_number || 'N/A');

            return {
              dn_label_no: item.dn_label_no || 'N/A',
              lot_number: item.lot_number || 'N/A',
              qr_number: item.qr_number || 'N/A',
              qr_number_image: qrNumberImage,
              po_number: item.po_number || 'N/A',
              po_number_image: poNumberImage,
              dn_number: item.dn_number || 'N/A',
              model: item.model || 'N/A',
              customer_name: item.customer_name || 'N/A',
              supplier_name: item.supplier_name || 'N/A',
              part_number: item.part_number || 'N/A',
              part_name: item.part_name || 'N/A',
              quantity: item.quantity || 'N/A',
              delivery_date: item.delivery_date || 'N/A',
              supplier_item_no: item.supplier_item_no || 'N/A',
              dn_qty: item.dn_qty || 'N/A',
              printed_date: item.printed_date
                ? item.printed_date.replace(
                    /(\d{2})(\d{2})(\d{2}) (\d{2}:\d{2})/,
                    '$1/$2/$3 $4',
                  )
                : 'N/A',
            };
          }),
        );

        return processedData;
      } else {
        console.error('Failed to fetch label data:', labelData.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching label data:', error);
      return [];
    }
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        {labelData.length > 0 ? (
          <BlobProvider document={<LabelDocument data={labelData} />}>
            {({ url, loading, error }) => {
              if (loading) {
                const id = toast.loading('Rendering PDF, please wait...');
                toast.update(id, {
                  render: 'PDF Ready',
                  type: 'success',
                  isLoading: false,
                  autoClose: 1500,
                });
                return (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-3"></div>
                    <p className="text-lg font-medium text-gray-700">
                      Rendering PDF Please Wait...
                    </p>
                  </div>
                );
              }
              if (error) {
                return (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                    <p className="text-red-800 font-medium">
                      Error Rendering PDF: {error.message}
                    </p>
                    <p className="text-red-600 text-sm mt-2">
                      Please Try Again Later
                    </p>
                  </div>
                );
              }
              return (
                <div className="w-screen h-screen">
                  <iframe
                    src={url || ''}
                    className="w-full h-full border-0"
                    title={`Label_${noDN}.pdf`}
                  />
                </div>
              );
            }}
          </BlobProvider>
        ) : (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-lg font-medium text-gray-700">
              Loading Data From Server...
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default PrintLabel;
