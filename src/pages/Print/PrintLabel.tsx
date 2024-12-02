import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  BlobProvider,
  Font, Image,
} from '@react-pdf/renderer';
import Swal from 'sweetalert2';
import { API_Print_Label } from '../../api/api';
import QRCode from 'qrcode';
import { toast, ToastContainer } from 'react-toastify';

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
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-SemiBold.ttf',
      fontWeight: 'semibold',
      fontStyle: 'normal',
    },
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-SemiBoldItalic.ttf',
      fontWeight: 'semibold',
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

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 8,
    fontFamily: 'Poppins',
    width: '100%',
    height: '100%',
  },
  pageInfo: {
    position: 'absolute',
    flexDirection: 'column',
    top: 5,
    right: 5,
    fontSize: 8,
    fontWeight: 'medium',
},
  label: {
    width: '50%',
    height: '185',
    padding: 2,
    borderRight: '1px dashed #000',
    borderBottom: '1px dashed #000',
  },
  table: {
    width: '100%',
    height: '100%',
  },
});

interface LabelDataItem {
  dn_label_no: string;
  lot_number: string;
  qr_number: string;
  po_number: string;
  dn_number: string;
  model: string;
  customer_name: string;
  supplier_name: string;
  part_number: string;
  part_name: string;
  quantity: string;
  delivery_date: string;
  printed_date: string;
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
                <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
            </View>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', borderLeft: '1px dashed #000', borderTop: '1px dashed #000',}}>
                {data.map((item, index) => (
                    <View key={index} style={styles.label}>
                        <View style={styles.table}>
                            {/* Row 1 */}
                            <View style={{flexDirection: 'row', border: '1px', height: '70%' }}>
                                <View style={{ borderRight: '1px', width: '13%', justifyContent: 'center', marginLeft: 3 }}>
                                    <Text style={{ fontSize: 6 }}>
                                    MODEL
                                    </Text>
                                </View>
                                <View style={{borderRight: '1px', width: '57%', justifyContent: 'center'}}>
                                    <Text style={{ marginLeft: 3, fontSize: 6}}>PART NO</Text>
                                    <Text style={{ marginTop: 1, alignSelf: 'center', fontSize: 10, fontWeight: 'semibold'}}>{item.part_number || 'N/A'}</Text>
                                </View>
                                <View style={{width: '30%', justifyContent: 'center'}}>
                                    <Text style={{marginLeft: 3, fontSize: 6}}>LOT NO</Text>
                                    <Text style={{ marginTop: 1, alignSelf: 'center', fontSize: 9, fontWeight: 'semibold'}}>{item.lot_number || 'N/A'}</Text>
                                </View>
                            </View>

                            {/* Row 2 */}
                            <View style={{flexDirection: 'row', borderBottom: 1, borderLeft: 1, borderRight: 1, height: '70%' }}>
                                <View style={{borderRight: '1px', width: '13%', justifyContent: 'center', marginLeft: 3 }}>
                                    <Text style={{ fontSize: 6}}>CUSTOMER</Text>
                                </View>
                                <View style={{borderRight: '1px', width: '57%', justifyContent: 'center'}}>
                                    <Text style={{marginLeft: 3, fontSize: 6}}>PART NAME</Text>
                                    <Text style={{marginTop: 1, alignSelf: 'center', fontSize: 10, fontWeight: 'semibold'}}>{item.part_name || 'N/A'}</Text>
                                </View>
                                <View style={{width: '30%', justifyContent: 'center'}}>
                                    <Text style={{marginLeft: 3, fontSize: 6}}>QUANTITY</Text>
                                    <Text style={{marginTop: 1, alignSelf: 'center', fontSize: 9, fontWeight: 'semibold'}}>{item.quantity || 'N/A'}</Text>
                                </View>
                            </View>

                            {/* Row 3 */}
                            <View style={{flexDirection: 'row', borderBottom: 1, borderLeft: 1, borderRight: 1, height: '70%' }}>
                                <View style={{borderRight: '1px', width: '45%', justifyContent: 'center', marginLeft: 3 }}>
                                    <Text style={{ marginTop: 1, alignSelf: 'center', fontSize: 10, fontWeight: 'semibold' }}>{item.customer_name || 'N/A'}</Text>
                                </View>
                                <View style={{borderRight: '1px', width: '25%', justifyContent: 'center'}}>
                                    <Text style={{marginTop: 1, alignSelf: 'center', fontSize: 10, fontWeight: 'semibold'}}>{item.po_number || 'N/A'}</Text>
                                </View>
                                <View style={{width: '30%', justifyContent: 'center'}}>
                                    <Text style={{marginLeft: 3, fontSize: 6}}>DATE DELIVERY</Text>
                                    <Text style={{marginTop: 1, alignSelf: 'center', fontSize: 9, fontWeight: 'semibold'}}>{item.delivery_date || 'N/A'}</Text>
                                </View>
                            </View>

                            {/* Row 4 */}
                            <View style={{flexDirection: 'row', borderBottom: 1, borderLeft: 1, borderRight: 1, height: '70%'}}>
                                <View style={{borderRight: '1px', width: '13%', paddingTop: 3, marginLeft: 3 }}>
                                    <Text style={{fontSize: 6}}>QUALITY</Text>
                                </View>
                                <View style={{borderRight: '1px', width: '32%', paddingTop: 3, paddingLeft: 3 }}>
                                    <Text style={{fontSize: 6}}>INSPECTION</Text>
                                </View>
                                <View style={{borderRight: '1px', width: '25%', justifyContent: 'center'}}>
                                    <Text style={{marginLeft: 3, fontSize: 6}}>PRINTED DATE</Text>
                                    <Text style={{ marginLeft: 3, fontSize: 6}}>{item.printed_date || 'N/A'}</Text>
                                </View>
                                <View style={{width: '30%', justifyContent: 'center'}}>
                                  <Text style={{marginLeft: 3, fontSize: 6}}> </Text>
                                </View>

                            </View>

                            {/* Row 5 */}
                            <View style={{flexDirection: 'row', borderBottom: 1, borderLeft: 1, borderRight: 1, justifyContent: 'space-between', height: '100%'}}>
                                {item.qr_number && (
                                    <View style={{flexDirection: 'row' , alignItems: 'center'}}>
                                    <Image
                                        src={generateQRCode(item.qr_number)}
                                        style={{}}
                                    />
                                    <Text style={{fontSize: 6, marginTop: 5}}>{item.qr_number}</Text>
                                    </View>
                                )}
                                {item.po_number && (
                                    <View>
                                        <Image
                                            src={generateQRCode(item.po_number)}
                                            style={{}}
                                        />
                                        <Text style={{fontSize: 6, margin: 2}}>{item.po_number}</Text>
                                    </View>
                                )}
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
            const fetchPromise = fetchLabelData(noDN)
                .then((data) => {
                if (data) {
                    setLabelData(data);
                    return 'Data loaded successfully';
                }
                throw new Error('Failed to load data');
                });
        
            toast.promise(fetchPromise, {
                pending: 'Fetching data from server...',
                error: 'Error loading data'
            });
        }
    }, [noDN]);

    const fetchLabelData = async (noDN: string) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
        Swal.fire('Error', 'Access token is missing. Please log in again.', 'error');
        return [];
        }

        try {
        const response = await fetch(`${API_Print_Label()}${noDN}`, {
            method: 'GET',
            headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            },
        });

        const labelData = await response.json();

        if (labelData.success && labelData.data && labelData.data.length > 0) {
            return labelData.data.map((item: any) => ({
            dn_label_no: item.dn_label_no || 'N/A',
            lot_number: item.lot_number || 'N/A',
            qr_number: item.qr_number || 'N/A',
            po_number: item.po_number || 'N/A',
            dn_number: item.dn_number || 'N/A',
            model: item.model || 'N/A',
            customer_name: item.customer_name || 'N/A',
            supplier_name: item.supplier_name || 'N/A',
            part_number: item.part_number || 'N/A',
            part_name: item.part_name || 'N/A',
            quantity: item.quantity || 'N/A',
            delivery_date: item.delivery_date || 'N/A',
            printed_date: item.printed_date || 'N/A',
            }));
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
            <div className="flex flex-col items-center justify-center h-screen text-lg font-medium">
            {labelData.length > 0 ? (
                <BlobProvider document={<LabelDocument data={labelData} />}>
                {({ url, loading, error }) => {
                    if (loading) {
                    const id = toast.loading("Rendering PDF, please wait...");
                    toast.update(id, { 
                        render: "PDF Ready", 
                        type: "success", 
                        isLoading: false,
                        autoClose: 1500 
                    });
                    return <p>Rendering PDF Please Wait...</p>;
                    }
                    if (error) {
                    return <p>Error Rendering PDF: {error.message}. Please Try Again Later</p>;
                    }
                    return (
                    <div>
                        <iframe
                        src={url || ''}
                        style={{ width: '100vw', height: '100vh' }}
                        frameBorder="0"
                        title={`Label_${noDN}.pdf`}
                        />
                    </div>
                    );
                }}
                </BlobProvider>
            ) : (
                <p>Loading Data From Server...</p>
            )}
            </div>
        </>
    );
};

export default PrintLabel;