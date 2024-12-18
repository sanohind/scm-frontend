import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  BlobProvider,
  Font,
} from '@react-pdf/renderer';
import Swal from 'sweetalert2';
import { API_Print_DN, API_Print_DN_Confirm, API_Print_DN_Outstanding } from '../../api/api';
import logoSanoh from '../../images/logo-sanoh.png';
import { toast, ToastContainer } from 'react-toastify';

// Register the Poppins font
Font.register({
    family: 'Poppins',
    fonts: [
        {
        src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf',
        fontWeight: 'normal',
        fontStyle: 'normal'
        },
        {
        src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Italic.ttf',
        fontWeight: 'normal',
        fontStyle: 'italic'
        },
        {
        src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Medium.ttf', 
        fontWeight: 'medium',
        fontStyle: 'normal'
        },        
        {
        src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-SemiBold.ttf',
        fontWeight: 'semibold',
        fontStyle: 'normal'
        },
        {
        src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-SemiBoldItalic.ttf',
        fontWeight: 'semibold',
        fontStyle: 'italic'
        },
        {
        src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf',
        fontWeight: 'bold',
        fontStyle: 'normal'
        },
        {
        src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-BoldItalic.ttf',
        fontWeight: 'bold',
        fontStyle: 'italic'
        },
    ],
});

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 8,
        fontFamily: 'Poppins',
    },
    pageInfo: {
        position: 'absolute',
        top: 10,
        right: 10,
        fontSize: 8,
        fontWeight: 'medium',
    },
    container: {
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
        border: 1,
        borderColor: '#000',
        paddingVertical: 15,
        paddingHorizontal: 7,
    },
    logo: {
        width: 80,
        height: 'auto',
    },
    companyInfo: {        
        marginLeft: 10,
        textAlign: 'center',
        flexGrow: 1,
        fontSize: 7,
    },
    deliveryNote: {
        fontSize: 10,
        fontWeight: 'semibold',
        
    },
    details: {
        flexDirection: 'row',
        fontSize: 8,
        lineHeight: 1.1,
        marginTop: 12,
    },
    detailsLeft: {
        width: '60%',
        textAlign: 'left',
    },
    detailsRight: {
        width: '40%',
        textAlign: 'left',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 3,
    },
    label: {
        width: 100,
        fontWeight: 'semibold',
    },
    value: {
        flex: 1,
        fontWeight: 'medium',
        textAlign: 'left',
    },
    table: {
        marginTop: 10,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderTopWidth: 1,
        borderColor: '#000',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
        textAlign: 'center',
        alignItems: 'stretch',
        height: 30,
        fontWeight: 'semibold',
        fontSize: 7,
    },
    tableColNo: {
        width: '5%',
        borderRightWidth: 1,
        borderColor: '#000',
        paddingVertical: 2,
        paddingTop: 10,
    },
    tableColDescription: {
        width: '25%',
        borderRightWidth: 1,
        borderColor: '#000',
        textAlign: 'center',
    },
    tableColName: {
        width: '25%',
        borderRightWidth: 1,
        borderColor: '#000',
        textAlign: 'center',
        paddingVertical: 2,
        paddingTop: 10,
    },
    tableCol: {
        width: '8%',
        borderRightWidth: 1,
        borderColor: '#000',
        paddingVertical: 2,
        paddingTop: 10,
    },
    tableColEnd: {
        width: '8%',
        borderColor: '#000',
        paddingVertical: 2,
        paddingTop: 10,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#000',
        textAlign: 'center',
        alignItems: 'stretch',
        minHeight: 24,
        fontSize: 7,
    },
    tableRowNo: {
        width: '5%',
        borderRightWidth: 1,
        borderColor: '#000',
        paddingTop: 7,
    },
    tableRowDescription: {
        width: '25%',
        borderRightWidth: 1,
        borderColor: '#000',
        textAlign: 'left',
        paddingHorizontal: 5,
        paddingTop: 2,
    },
    tableRowName: {
        width: '25%',
        borderRightWidth: 1,
        borderColor: '#000',
        textAlign: 'left',
        paddingTop: 7,
        paddingHorizontal: 5,
    },
    tableRowNormal: {
        width: '8%',
        borderRightWidth: 1,
        borderColor: '#000',
        paddingVertical: 2,
        paddingTop: 7,
    },
    tableRowEnd: {
        width: '8%',
        paddingTop: 7,
    },
    terms: {
        marginTop: 20,
        fontSize: 8,
        fontStyle: 'italic',   
        color: '#1F2937',
    },
    signatureSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
        fontWeight: 'semibold',
    },

    signatureLeftTitle: {
        textAlign: 'center',
        borderBottomWidth: 1,
    },

    signatureLeftBox: {
        height: 60,
        borderBottomWidth: 1,
    },

    signatureLeftName: {
        padding: 2,
        borderBottomWidth: 1,
    },

    signatureLeftDate: {
        padding: 2,
    },

    signatureBox: {
        flexDirection: 'row', 
        borderWidth: 1, 
        marginTop: 10
    },
    
    downloadAt: {
        position: 'absolute',
        fontSize: 8,
        fontWeight: 'medium',
    },
});

interface DeliveryNoteData {
    header: {
        dn_number: string;
        po_number: string;
        supplier_name: string;
        supplier_code: string;
        planned_receipt_date: string;
        total_box: string;
    };
    details: {
        supplier_part_number: string;
        internal_part_number: string;
        part_name: string;
        pcs_per_kamban: string;
        qty_confirm: string;
        no_of_kamban: string;
        total_quantity: string;
        box_quantity: string;
    }[];
}

const calculateTotalBoxes = (details: { box_quantity: string }[]) => {
    return details.reduce((total, item) => total + parseFloat(item.box_quantity || '0'), 0);
};

const DeliveryNoteDocument = ({ data }: { data: DeliveryNoteData }) => (
    <Document>
        <Page style={styles.page} size="A4">
        {/* Page number section */}
            <View style={styles.pageInfo} fixed>
                <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
            </View>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Image src={logoSanoh} style={styles.logo} />
                    <View style={styles.companyInfo}>
                        <Text style={{ fontWeight: 'semibold' }}>PT. SANOH INDONESIA</Text>
                        <Text>Jl. Inti II, Blok C-4 No.10, Kawasan Industri Hyundai, Cikarang, Bekasi</Text>
                        <Text>Phone +62 21 89907963</Text>
                    </View>
                    <View style={[styles.deliveryNote, { alignSelf: 'flex-end' }]}>
                        <Text style={{ textAlign: 'right' }}>DELIVERY NOTE</Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                            <Text style={{ textAlign: 'right' }}>{data.header.dn_number}</Text>
                        </View>
                    </View>
                </View>

                {/* Details */}
                <View style={styles.details}>
                    <View style={styles.detailsLeft}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Supplier Code</Text>
                            <Text style={styles.value}>:  {data.header.supplier_code}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Supplier Name</Text>
                            <Text style={styles.value}>:  {data.header.supplier_name}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>DN Number</Text>
                            <Text style={styles.value}>:  {data.header.dn_number}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>PO Number</Text>
                            <Text style={styles.value}>:  {data.header.po_number}</Text>
                        </View>
                    </View>
                    <View style={styles.detailsRight}>
                        <View style={styles.row}>
                            <Text style={styles.label}>Planned Receipt Date</Text>
                            <Text style={styles.value}>:  {data.header.planned_receipt_date}</Text>
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Actual Receipt Date</Text>
                            <Text style={styles.value}>:  _______________</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end'}}>
                    <Text style={{ fontWeight: 'semibold' }}>Total Box</Text>
                    <Text style={{ fontWeight: 'bold', fontSize: 10, marginLeft: 8 }}>{calculateTotalBoxes(data.details)}</Text>
                </View>

                {/* Table Header */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.tableColNo}>No</Text>
                        <View style={styles.tableColDescription}> 
                            <Text style={{padding: 1, borderBottomWidth: 1}}>Supplier Part No.</Text>
                            <Text style={{paddingTop: 2 }}>Internal Part No.</Text>
                        </View>
                        <Text style={styles.tableColName}>Part Name</Text>
                        <Text style={styles.tableCol}>Pcs/Kbn</Text>
                        <Text style={styles.tableCol}>No of Kbn</Text>
                        <Text style={styles.tableCol}>Total Qty</Text>
                        <View style={{ borderRightWidth: 1, alignItems: 'stretch', width: '14%', justifyContent: 'center'}}> 
                            <Text style={{ borderBottomWidth: 1, alignItems: 'stretch', textAlign: 'center', paddingBottom: 1}}>Confirmation</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'stretch', textAlign: 'center' }}>
                                <Text style={{ flex: 1, textAlign: 'center', paddingTop: 2}}>Supp.</Text>
                                <Text style={{ paddingTop: 2, paddingBottom: 1, borderLeftWidth: 1,  flex: 1, alignItems: 'stretch', textAlign: 'center' }}>Sanoh.</Text>
                            </View>
                        </View>
                        <Text style={styles.tableColEnd}>Box Qty</Text>
                    </View>
                    {data.details.map((item, index) => (
                        <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableRowNo}>{index + 1}</Text>
                            <View style={styles.tableRowDescription}>
                                <Text style={{fontWeight: 'semibold'}}>{item.supplier_part_number}</Text>
                                <Text>{item.internal_part_number}</Text>
                            </View>
                            <Text style={styles.tableRowName}>{item.part_name}</Text>
                            <Text style={styles.tableRowNormal}>{item.pcs_per_kamban}</Text>
                            <Text style={styles.tableRowNormal}>{item.no_of_kamban}</Text>
                            <Text style={styles.tableRowNormal}>{item.total_quantity}</Text>
                            <Text style={[styles.tableRowNormal, {width: '7%'}]}>{item.qty_confirm}</Text>
                            <Text style={[styles.tableRowNormal, {width: '7%'}]}></Text>
                            <Text style={styles.tableRowEnd}>{item.box_quantity}</Text>
                        </View>
                    ))}
                </View>

                {/* Terms */}
                <View style={styles.terms}>
                    <Text style={{fontWeight: 'semibold' }}>NOTE :</Text>
                    <Text>1. Untuk penggunaan PO Number pada Surat Jalan Supplier, harap mengikuti PO Number di atas</Text>
                    <Text>2. Saat Delivery ke Sanoh membawa form ini sebagai bukti delivery</Text>
                    <Text>3. Form ini juga sebagai Checksheet Receiving Supplier</Text>
                    <Text>4. Confirmation Supplier wajib diisi</Text>
                </View>

                {/* Signature Section */}
                <View style={styles.signatureSection} break>
                    <View style={{ width: '55%' }}>
                        <Text>SUPPLIER</Text>
                        <View style={ styles.signatureBox}>
                            <View style={{borderRightWidth: 1, width: '33%'}}>
                                <Text style={ styles.signatureLeftTitle }>Logistic</Text>
                                <Text style={ styles.signatureLeftBox }></Text>
                                <Text style={ styles.signatureLeftName}>Name :</Text>
                                <Text style={ styles.signatureLeftDate }>Date :</Text>
                            </View>
                            <View style={{borderRightWidth: 1, width: '33%'}}>
                                <Text style={ styles.signatureLeftTitle }>Controller</Text>
                                <Text style={ styles.signatureLeftBox }></Text>
                                <Text style={ styles.signatureLeftName}>Name :</Text>
                                <Text style={ styles.signatureLeftDate }>Date :</Text>
                            </View>
                            <View style={{ width: '34%'}}>
                                <Text style={ styles.signatureLeftTitle }>Driver</Text>
                                <Text style={ styles.signatureLeftBox}></Text>
                                <Text style={ styles.signatureLeftName}>Name :</Text>
                                <Text style={ styles.signatureLeftDate}>Date :</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ width: '40%' }}>
                        <Text>PT. SANOH INDONESIA</Text>
                        <View style={ styles.signatureBox}>
                            <View style={{borderRightWidth: 1, width: '50%'}}>
                                <Text style={ styles.signatureLeftTitle }>Receiver</Text>
                                <Text style={ styles.signatureLeftBox}></Text>
                                <Text style={ styles.signatureLeftName}>Name :</Text>
                                <Text style={ styles.signatureLeftDate}>Date :</Text>
                            </View>
                            <View style={{width: '50%'}}>
                                <Text style={ styles.signatureLeftTitle }>Controller</Text>
                                <Text style={ styles.signatureLeftBox}></Text>
                                <Text style={ styles.signatureLeftName}>Name :</Text>
                                <Text style={ styles.signatureLeftDate}>Date :</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
            {/* Page download at section */}
            <View style={[styles.downloadAt, { bottom: 10, left: 10 }]} fixed>
                <Text>Downloaded at: {new Date().toLocaleString('en-GB', { 
                    year: 'numeric',
                    month: '2-digit', 
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false
                    }).replace(/(\d{2})\/(\d{2})\/(\d{4}),/, '$3-$2-$1')}
                </Text>
            </View>
        </Page>
    </Document>
);

const PrintDN = () => {
    const [dnData, setDNData] = useState<DeliveryNoteData | null>(null);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const noDN = queryParams.get('noDN');

    useEffect(() => {
        if (noDN) {
            // Create loading toast for data fetching
            const fetchPromise = fetchDeliveryNoteData(noDN)
                .then((data) => {
                if (data) {
                    setDNData(data);
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

    const fetchDeliveryNoteData = async (noDN: string) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            Swal.fire('Error', 'Access token is missing. Please log in again.', 'error');
            return null;
        }

        try {
            const status = queryParams.get('status');
            let apiUrl = API_Print_DN();

            if (status === 'confirm') {
                apiUrl = API_Print_DN_Confirm();
            } else if (status && status.startsWith('outstanding')) {
                const outstandingNumber = status.split('_')[1];
                apiUrl = `${API_Print_DN_Outstanding()}${outstandingNumber}/`;
            }

            const response = await fetch(`${apiUrl}${noDN}`, {
                method: 'GET',
                headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const dnData = await response.json();
            if (dnData.success && dnData.data && dnData.data.length > 0) {
                const header = {
                    dn_number: dnData.data[0].dn_number,
                    po_number: dnData.data[0].po_number,
                    supplier_name: dnData.data[0].supplier_name,
                    supplier_code: dnData.data[0].supplier_code,
                    planned_receipt_date: dnData.data[0].planned_receipt_date,
                    total_box: dnData.data[0].total_box,
                };

                const details = dnData.data[0].detail.map((item: any) => ({
                    supplier_part_number: item.supplier_part_number,
                    internal_part_number: item.internal_part_number,
                    part_name: item.part_name,
                    pcs_per_kamban: item.pcs_per_kamban,
                    qty_confirm: item.qty_confirm,
                    no_of_kamban: item.no_of_kamban,
                    total_quantity: item.total_quantity,
                    box_quantity: item.box_quantity,
                }));

                return { header, details };
            } else {
                console.error('No data available:', dnData.message);
                return null;
            }
        } catch (error) {
            console.error('Error fetching DN data:', error);
            return null;
        }
    };

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="flex flex-col items-center justify-center h-screen text-lg font-medium">
            {dnData ? (
                <BlobProvider document={<DeliveryNoteDocument data={dnData} />}>
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
                        title={`DeliveryNote_${dnData.header.dn_number}.pdf`}
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

export default PrintDN;
