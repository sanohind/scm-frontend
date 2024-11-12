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
import { API_Print_PO } from '../../api/api';
import logoSanohAddress from '../../images/logo_sanoh_address.png';
import signatureDeniar from '../../images/Pak_Deniar.png';
import signatureFadli from '../../images/Pak_Fadli.png';
import signatureMisbahul from '../../images/Pak_Misbahul.png';

// Register the Poppins font
Font.register({
  family: 'Poppins',
  fonts: [
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Regular.ttf',
    },
    {
      src: 'https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-Bold.ttf',
      fontWeight: 'bold',
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
  downloadAt: {
    position: 'absolute',
    fontSize: 8,
    fontWeight: 'medium',
  },
  container: {
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  logo: {
    width: 250,
    height: 'auto',
  },
  companyInfo: {
    marginTop: 5,
    textAlign: 'center',
    flexGrow: 1,
    fontSize: 14,
  },
  title: {
    margin: 5,
    textDecoration: 'underline',
    fontWeight: 'bold',
  },
  details: {
    flexDirection: 'row',
    fontSize: 8,
    lineHeight: 1.1,
  },
  detailsLeft: {
    width: '66%',
    lineHeight: 1.4,
  },
  detailsRight: {
    width: '33%',
    textAlign: 'left',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  label: {
    width: 100,
    fontWeight: 'semibold',
  },
  value: {
    flex: 1,
    fontWeight: 'semibold',
    textAlign: 'left',
  },
  table: {
    marginTop: 10,
    border: 1,
    borderColor: '#000',
  },
  
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    textAlign: 'center',
    alignItems: 'stretch',
    minHeight: 24,
    fontWeight: 'bold',
    fontSize: 8,
  },
  tableColNo: {
    width: '5%',
    borderRightWidth: 1,
    borderColor: '#000',
    paddingVertical: 2,
  },
  tableColDescription: {
    width: '35%',
    borderRightWidth: 1,
    borderColor: '#000',
    textAlign: 'center',
    paddingVertical: 2,
    marginLeft: 5,
  },
  tableCol: {
    width: '20%',
    borderRightWidth: 1,
    borderColor: '#000',
    paddingVertical: 2,
  },
  tableColQty: {
    width: '10%',
    borderRightWidth: 1,
    borderColor: '#000',
    paddingVertical: 2,
  },
  tableRowQTY: {
    width: '10%',
    borderRightWidth: 1,
    borderColor: '#000',
    paddingHorizontal: 5,
    paddingVertical: 2,
    textAlign: 'right',
  },
  tableColPrice: {
    width: '12%',
    paddingVertical: 2,
    borderRightWidth: 1,
    borderColor: '#000',
  },
  tableColAmount: {
    width: '15%',
    paddingVertical: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#000',
    textAlign: 'center',
    alignItems: 'stretch',
    minHeight: 24,
    fontSize: 6,
  },
  tableRowDescription: {
    width: '35%',
    borderRightWidth: 1,
    borderColor: '#000',
    textAlign: 'left',
    paddingVertical: 2,
    marginLeft: 5,
  },
  tableRowAmount: {
    width: '15%',
    paddingVertical: 2,
    textAlign: 'right',
    paddingHorizontal: 5,
  },
  tableRowPrice: {
    width: '12%',
    paddingVertical: 2,
    borderRightWidth: 1,
    borderColor: '#000',
    textAlign: 'right',
    paddingHorizontal: 5,
  },
  terms: {
    marginTop: 20,
    fontSize: 8,
  },
  signatureSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  signatureBox: {
    width: '33%',
    textAlign: 'center',
  },
  signatureImage: {
    width: 70,
    height: 70,
    margin: 5,
    justifyContent: 'center', 
    alignItems: 'center',
  },
});

interface PurchaseOrderData {
  header: {
    po_number: string;
    po_date: string;
    po_type: string;
    pr_no: string;
    delivery_term: string;
    currency: string;
    note: string;
    supplier_name: string;
    supplier_code: string;
    planned_receipt_date: string;
    total_amount: string;
    supplier_address: string;
    phone_number: string;
    fax_number: string;
    accepted_confirmed_by: string;
    terms: string;
    attn: string;
    printed_date: string;
    ppn: string;
    total: string;
    delivery: string;
  };
  details: {
    purchase_order_detail_id: string;
    po_number: string;
    line_no: string;
    seq_no: string;
    part_number: string;
    part_name: string;
    delivery_date: string;
    quantity: string;
    unit: string;
    unit_price: string;
    amount: string;
  }[];
}

const calculateTotalQuantity = (details: { quantity: string }[]) => {
  return details.reduce((total, item) => total + parseFloat(item.quantity || '0'), 0);
};

const PurchaseOrderDocument = ({ data }: { data: PurchaseOrderData }) => (
  <Document>
    <Page style={styles.page} size="A4">
      {/* Page number section */}
      <View style={styles.pageInfo} fixed>
        <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
      </View>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Image src={logoSanohAddress} style={styles.logo} />
        </View>
        <View style={styles.companyInfo}>
          <Text style={styles.title}>Purchase Order</Text>
        </View>

        {/* Details */}
        <View style={styles.details}>
          <View style={styles.detailsLeft}>
            <Text>
              <Text style={{ fontWeight: 'semibold' }}>To</Text> :  {' '}
              <Text style={{ fontWeight: 'semibold' }}>{data.header.supplier_name}</Text>
            </Text>
            <View style={{ paddingLeft: 20 }}>
              <Text style={{ fontWeight: 'semibold' }}>{data.header.supplier_code}</Text>
              <Text style={{ fontWeight: 'semibold' }}>{data.header.supplier_address}</Text>
              <Text> </Text>
              <Text>Phone Number :   {data.header.phone_number}</Text>
              <Text>Fax Number :   {data.header.fax_number}</Text>
              <Text> </Text>
            </View>
            <Text>
              <Text>Attn</Text> :    {data.header.attn}
            </Text>
            <Text> </Text>
            <Text style={{ fontSize: 6 }}>Please supply the following</Text>
          </View>
          <View style={styles.detailsRight}>
            <View style={styles.row}>
              <Text style={styles.label}>P/O NO </Text>
              <Text style={styles.value}>:   {data.header.po_number}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Date</Text>
              <Text style={styles.value}>:   {data.header.po_date}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>P/O Type</Text>
              <Text style={styles.value}>:   {data.header.po_type}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>PR</Text>
              <Text style={styles.value}>:   {data.header.pr_no}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Planned Receipt</Text>
              <Text style={styles.value}>:   {data.header.planned_receipt_date}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Currency</Text>
              <Text style={styles.value}>:   {data.header.currency}</Text>
            </View>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableColNo}>No</Text>
            <View style={styles.tableColDescription}>
              <Text>Description</Text>
              <Text>Part No.</Text>
            </View>
            <Text style={styles.tableCol}>Delivery Date</Text>
            <Text style={styles.tableColQty}>Qty</Text>
            <Text style={styles.tableColQty}>Unit</Text>
            <Text style={styles.tableColPrice}>Unit Price</Text>
            <Text style={styles.tableColAmount}>Amount</Text>
          </View>
          {/* Table Rows */}
          {data.details.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableColNo}>{index + 1}</Text>
              <View style={styles.tableRowDescription}>
                <Text>{item.part_name}</Text>
                <Text>{item.part_number}</Text>
              </View>
              <Text style={styles.tableCol}>{item.delivery_date}</Text>
              <Text style={styles.tableRowQTY}>{item.quantity}</Text>
              <Text style={[styles.tableRowQTY, {textAlign: 'center'}]}>{item.unit}</Text>
              <Text style={styles.tableRowPrice}>{item.unit_price}</Text>
              <Text style={styles.tableRowAmount}>{item.amount}</Text>
            </View>
          ))}
          {/* Totals */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableColNo, { borderRightWidth: 0 }]}></Text>
            <Text
              style={[
                styles.tableColDescription,
                { borderRightWidth: 0, textAlign: 'right', fontWeight: 'bold' },
              ]}
            >
            </Text>
            <Text style={[styles.tableCol, { fontSize: 7, textAlign: 'center', fontWeight: 'bold'}]}>Subtotal</Text>
            <Text style={[styles.tableRowQTY, {fontSize: 7, textAlign: 'right', fontWeight: 'bold' }]}>{calculateTotalQuantity(data.details)}</Text>
            <Text style={[styles.tableRowQTY]}></Text>
            <Text style={[styles.tableRowPrice]}></Text>
            <Text style={[styles.tableRowAmount, { fontSize: 7, fontWeight: 'bold' }]}>{data.header.total_amount}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableColNo, { borderRightWidth: 0 }]}></Text>
            <Text
              style={[
                styles.tableColDescription,
                { borderRightWidth: 0, textAlign: 'right', fontWeight: 'bold' },
              ]}
            >
            </Text>
            <Text style={[styles.tableCol, { fontSize: 7, textAlign: 'center', fontWeight: 'bold'}]}>PPN 11%</Text>
            <Text style={[styles.tableRowQTY]}></Text>
            <Text style={[styles.tableRowQTY]}></Text>
            <Text style={[styles.tableRowPrice]}></Text>
            <Text style={[styles.tableRowAmount, { fontSize: 7, fontWeight: 'bold' }]}>{data.header.ppn}</Text>
          </View>
          <View style={[styles.tableRow, { borderBottomWidth: 0} ]}>
            <Text style={[styles.tableColNo, { borderRightWidth: 0 }]}></Text>
            <Text
              style={[
                styles.tableColDescription,
                { borderRightWidth: 0, textAlign: 'right', fontWeight: 'bold' },
              ]}
            >
            </Text>
            <Text style={[styles.tableCol, { fontSize: 7, textAlign: 'center', fontWeight: 'bold'}]}>Total</Text>
            <Text style={[styles.tableRowQTY]}></Text>
            <Text style={[styles.tableRowQTY]}></Text>
            <Text style={[styles.tableRowPrice]}></Text>
            <Text style={[styles.tableRowAmount, { borderBottomWidth: 0, fontSize: 7, fontWeight: 'bold' }]}>{data.header.total}</Text>
          </View>
        </View>

        {/* Terms */}
        <View style={styles.terms}>
          <View style={styles.row}>
            <Text style={styles.label}>Note</Text>
            <Text style={styles.value}>:   {data.header.note || ''}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery</Text>
            <Text style={styles.value}>:   {data.header.delivery_term || ''}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Terms</Text>
            <Text style={styles.value}>:   {data.header.terms || ''}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Delivery Place</Text>
            <View style={styles.value}>
              <Text>:   PT. SANOH INDONESIA</Text>
                <Text style={{ marginLeft: 4 }}>  JL. INTI II BLOK C4 NO. 10 KAWASAN INDUSTRI HYUNDAI,</Text>
                <Text style={{ marginLeft: 4 }}>  LEMAH ABANG - BEKASI 17750</Text>
                <Text style={{ marginLeft: 4 }}>  {data.header.phone_number} {data.header.fax_number}</Text>
            </View>
          </View>
        </View>

        {/* Signature Section */}
        <View style={styles.signatureSection}>
          <View style={{ width: '40%', textAlign: 'center', fontSize: 8 }}>
            <Text>Accepted & Confirmed</Text>
            <Text>{data.header.supplier_name || ''}</Text>
            <Text style={{ marginTop: 90 }}>_____________________</Text>
          </View>
          <View style={{ width: '50%' }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={[styles.signatureBox, { borderWidth: 1, borderColor: '#000' }]}>
                <Text style={{ borderBottomWidth: 1, borderColor: '#7e7e7e'}}>Prepared</Text>
                <Image src={signatureDeniar} style={styles.signatureImage} />
                <Text style={{ borderBottomWidth: 1, borderTopWidth: 1, borderColor: '#7e7e7e'}}>DENIAR F</Text>
                <Text>Purchasing</Text>
              </View>
              <View style={[styles.signatureBox, { borderTopWidth: 1, borderBottomWidth: 1, borderRightWidth: 1, borderColor: '#000' }]}>
                <Text style={{ borderBottomWidth: 1, borderColor: '#7e7e7e'}}>Checked</Text>
                <Image src={signatureFadli} style={styles.signatureImage} />
                <Text style={{ borderBottomWidth: 1, borderTopWidth: 1, borderColor: '#7e7e7e'}}>FADLI YUSRAL</Text>
                <Text>Dept. Manager</Text>
              </View>
              <View style={[styles.signatureBox, { borderTopWidth: 1, borderBottomWidth: 1, borderRightWidth: 1, borderColor: '#000' }]}>
                <Text style={{ borderBottomWidth: 1, borderColor: '#7e7e7e'}}>Approved</Text>
                <Image src={signatureMisbahul} style={styles.signatureImage} />
                <Text style={{ borderBottomWidth: 1, borderTopWidth: 1, borderColor: '#7e7e7e'}}>MISBAHUL MUNIR</Text>
                <Text>Purchasing</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
      {/* Page download at section */}
      <View style={[styles.downloadAt, { bottom: 10, left: 10 }]} fixed>
        <Text>Downloaded at: {new Date().toLocaleString()}</Text>
      </View>
    </Page>
  </Document>
);

const PrintPO = () => {
  interface POData {
    header: {
      po_number: string;
      po_date: string;
      po_type: string;
      pr_no: string;
      delivery_term: string;
      currency: string;
      note: string;
      supplier_name: string;
      supplier_code: string;
      planned_receipt_date: string;
      total_amount: string;
      supplier_address: string;
      phone_number: string;
      fax_number: string;
      accepted_confirmed_by: string;
      terms: string;
      attn: string;
      printed_date: string;
      ppn: string;
      total: string;
      delivery: string;
    };
    details: {
      purchase_order_detail_id: string;
      po_number: string;
      line_no: string;
      seq_no: string;
      part_number: string;
      part_name: string;
      delivery_date: string;
      quantity: string;
      unit: string;
      unit_price: string;
      amount: string;
    }[];
  }
  
  const [poData, setPOData] = useState<POData | null>(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const noPO = queryParams.get('noPO');

  useEffect(() => {
    if (noPO) {
      fetchPurchaseOrderData(noPO).then((data) => {
        if (data) {
          setPOData(data);
        }
      });
    }
  }, [noPO]);

  const fetchPurchaseOrderData = async (noPO: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      Swal.fire('Error', 'Access token is missing. Please log in again.', 'error');
      return null;
    }

    try {
      const response = await fetch(`${API_Print_PO()}${noPO}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const poData = await response.json();
      if (poData.success && poData.data && poData.data.length > 0) {
        const header = {
          po_number: poData.data[0].po_number,
          po_date: poData.data[0].po_date,
          po_type: poData.data[0].po_type,
          pr_no: poData.data[0].pr_no,
          delivery_term: calculateDeliveryTerm(
            poData.data[0].po_date,
            poData.data[0].planned_receipt_date
          ),
          currency: poData.data[0].currency,
          note: poData.data[0].note,
          supplier_name: poData.data[0].supplier_name,
          supplier_code: poData.data[0].supplier_code,
          planned_receipt_date: poData.data[0].planned_receipt_date,
          total_amount: poData.data[0].total_amount,
          supplier_address: concatAddress(poData.data[0].supplier_address),
          phone_number: poData.data[0].phone_number,
          fax_number: poData.data[0].fax_number,
          accepted_confirmed_by: poData.data[0].accepted_confirmed_by,
          terms: poData.data[0].terms,
          attn: poData.data[0].attn,
          printed_date: poData.data[0].printed_date,
          ppn: poData.data[0].ppn,
          total: poData.data[0].total,
          delivery: poData.data[0].delivery,
        };

        const details = poData.data[0].detail
          ? poData.data[0].detail.map((item: any) => ({
              purchase_order_detail_id: item.purchase_order_detail_id,
              po_number: item.po_number,
              line_no: item.line_no,
              seq_no: item.seq_no,
              part_number: item.part_number,
              part_name: item.part_name,
              delivery_date: item.delivery_date,
              quantity: item.quantity,
              unit: item.unit,
              unit_price: item.unit_price,
              amount: item.amount,
            }))
          : [];

        return { header, details };
      } else {
        console.error('No data available:', poData.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching PO data:', error);
      return null;
    }
  };

  const calculateDeliveryTerm = (po_date: string, planned_receipt_date: string) => {
    const date1 = new Date(po_date);
    const date2 = new Date(planned_receipt_date);
    const diffTime = date2.getTime() - date1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} Days`;
  };

  const concatAddress = (address: string) => address || 'N/A';

  return (
    <div className="flex flex-col items-center justify-center h-screen text-lg font-medium">
      {poData ? (
        <BlobProvider document={<PurchaseOrderDocument data={poData} />}>
          {({ url, loading, error }) => {
            if (loading) {
              return <p>Rendering PDF Please Wait... (5 seconds)</p>;
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
                  title={`PurchaseOrder_${poData.header.po_number}.pdf`}
                />
              </div>
            );
          }}
        </BlobProvider>
      ) : (
        <p>Loading Data From Server...</p>
      )}
    </div>
  );
};

export default PrintPO;
