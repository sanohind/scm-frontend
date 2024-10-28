const API = 'https://api.edutrashgo.com/api';
const userRole = localStorage.getItem('role');

let rolePath = userRole ? `/${userRole}` : '';

// login API endpoint
export const APIlogin = API + '/login';

// logout API endpoint is now a function
export const APIlogout = () => {
    const userRole = localStorage.getItem('role');
    const rolePath = userRole ? `/${userRole}` : '';
    return API + rolePath + '/logout';
};

// API Test No Auth
export const APIreadfile = API + '/listingreporttest/file/';

// API Global
export const API_poView = API + `/pohview/`;
export const API_dnView = API + `/dnhview/`;
export const API_labelView = API + `/lbview/`;

// supper admin 
export const APIpartner4 = API + '/partner4';
export const APIcreateuser = API + '/create4';
export const APIedit4 = API + '/edit4/';
export const APIupdate4 = API + '/update4/';
export const APIlistuser = API + '/index4';
export const APIupdatestatus = API + `/updatestatus/`;


// purchasing
export const API_readPerformanceReportPurchasing = API + `/listingreport3/file/`;
export const APIpartner3 = API + `/partner3`;
export const APIindexlistingreport = API + `/indexlistingreport3`;
export const APIuploadlisting = API + `/createlistingreport3`;
export const APIindexpoheader3 = API + `/indexpoheader3`;
export const APIpohistory3 = API + `/pohistory3`;
export const APIpoViewPurchasing3 = API + `/pohview3/`
export const API_SyncPurchasing = API + `/syncPurchasing`;


// warehouse
export const APIpartner2 = API + `/partner2`;
export const APIindexdnheader2 = API + `/indexdnheader2`;
export const APIindexdndetail2 = API + '/indexdndetail2/';
export const APIdnhistory2 = API + `/dnhistory2`;
export const APIdnViewWarehouse2 = API + `/dnhview2/`;
export const API_SyncWarehouse = API + `/syncWarehouse`;


// supplier
export const API_dashboardSupplier = API + `/dashboard`;
export const API_indexPOSupplier = API + `/indexpoheader1/`;
export const API_updatePOSupplier = API + `/updatepoheader1/`;
export const API_indexPerformanceReportSupplier = API + `/indexlistingreport1`;
export const API_indexDNSupplier = API + `/indexdnheader1`;
export const API_indexPOHistorySupplier = API + `/pohistory1/`;
export const API_indexDNHistorySupplier = API + `/dnhistory1/`;
export const API_readPerformanceReportSupplier = API + `/listingreport1/file/`;
export const API_indexPODetailSupplier = API + `/indexpodetail1/`;
export const API_indexDNDetailUpdateSupplier = API + `/updatedndetail1`;
export const API_poViewSupplier = API + `/pohview1/`;
export const API_dnViewSupplier = API + `/dnhview1/`;
export const API_labelViewSupplier = API + `/lbview1/`;
export const API_IndexForecastSupplier = API + `/supplier/forecast/index`;
export const API_GetForecastFileSupplier = API + `/supplier/forecast/get/file/`;
