const API = 'https://apiv2.edutrashgo.com/api';

const getRolePath = () => {
    const userRole = localStorage.getItem('role');
    // console.log(userRole);
    return userRole ? `/${userRole}` : '';
};

// login API endpoint
export const API_Login = () => API + '/login';

// // logout API endpoint is now a function
export const API_Logout = () => API + getRolePath() + `/logout`;

// API Test No Auth
export const API_Tes_Download_Performance_Report_Supplier = () => API + getRolePath() + `/listingreporttest/file/`;
export const API_Tes_Download_Forecast_Report_Supplier = () => API + getRolePath() + `/forecasttest/file/`;
export const API_Tes_Print_PO = () => API + `/pohview/`;
export const API_Tes_Print_DN = () => API + `/dnhview/`;
export const API_Tes_Print_Label = () => API + `/lbview/`;


// supper admin 
export const API_List_Partner_Admin = () => API + getRolePath() + `/partner/index`;

export const API_Create_User = () => API + getRolePath() + '/create';
export const API_Edit_User = () => API + getRolePath() + '/edit/';
export const API_Update_User = () => API + getRolePath() + '/update/';
export const API_List_User = () => API + getRolePath() + '/index';
export const API_Update_Status = () => API + getRolePath() + `/update/status/`;


// purchasing
export const API_Sync = () => API + getRolePath() + `/sync`;

export const API_List_Partner_Purchasing = () => API + getRolePath() + `/partner/index`;

export const API_PO_Purchasing = () => API + getRolePath() + `/po/index/`;
export const API_PO_Detail_Purchasing = () => API + getRolePath() + `/po/detail/`;
export const API_PO_History = () => API + getRolePath() + `/po/history/`;

export const API_Print_PO_Purchasing = () => API + getRolePath() + `/pohview3/`;

export const API_Performance_Report_Purchasing = () => API + getRolePath() + `/performance-report/index/`;
export const API_Download_Performance_Report_Purchasing = () => API + getRolePath() + `/performance-report/file/`;
export const API_Create_Performance_Report_Purchasing = () => API + `/createlistingreport3`;

export const API_Forecast_Report_Purchasing = () => API + getRolePath() + `/forecast/index/`;
export const API_Download_Forecast_Report_Purchasing = () => API + getRolePath() + `/forecast/file/`;
export const API_Create_Forecast_Report_Purchasing = () => API + getRolePath() + `/forecast/store`;
export const API_Delete_Forecast_Report_Purchasing = () => API + getRolePath() + `/forecast/delete/`;


// warehouse
export const API_Sync_Warehouse = () => API + getRolePath() + `/sync`;

export const API_List_Partner = () => API + getRolePath() + `/partner/index`;

export const API_DN_Warehouse = () => API + getRolePath() + `/dn/index/`;
export const API_DN_Detail_Warehouse = () => API + getRolePath() + `/dn/detail/`;
export const API_DN_History_Warehouse = () => API + getRolePath() + `/dn/history/`;

export const API_Print_DN_Warehouse = () => API + getRolePath() + `/dn/print/`;


// supplier
export const API_Dashboard = () => API + getRolePath() + `/dashboard`;

export const API_PO_Supplier = () => API + getRolePath() + `/po/index/`;
export const API_PO_Detail = () => API + getRolePath() + `/po/detail/`;
export const API_Update_PO_Supplier = () => API + getRolePath() + `/po/update/`;
export const API_PO_History_Supplier = () => API + getRolePath() + `/po/history/`;

export const API_DN_Supplier = () => API + getRolePath() + `/dn/index`;
export const API_DN_Detail = () => API + getRolePath() + `/dn/detail/`;
export const API_DN_Edit_Supplier = () => API + getRolePath() + `/dn/edit/`;
export const API_Update_DN_Supplier = () => API + getRolePath() + `/dn/update`;
export const API_DN_History_Supplier = () => API + getRolePath() + `/dn/history/`;

export const API_Print_PO_Supplier = () => API + getRolePath() + `/po/print/`;
export const API_Print_DN_Supplier = () => API + getRolePath() + `/dn/print/`;
export const API_Print_Label_Supplier = () => API + getRolePath() + `/label/print/`;

export const API_Performance_Report_Supplier = () => API + getRolePath() + `/performance-report/index/`;
export const API_Download_Performance_Report= () => API + getRolePath() + `/performance-report/file/`;

export const API_Forecast_Report_Supplier = () => API + getRolePath() + `/forecast/index`;
export const API_Download_Forecast_Report = () => API + getRolePath() + `/forecast/file/`;


// Subcont
export const API_Dashboard_Subcont = () => API + getRolePath() + `/dashboard`;

export const API_PO_Subcont = () => API + getRolePath() + `/po/index/`;
export const API_PO_Detail_Subcont = () => API + getRolePath() + `/po/detail/`;
export const API_Update_PO_Subcont = () => API + getRolePath() + `/po/update/`;
export const API_PO_History_Subcont = () => API + getRolePath() + `/po/history/`;

export const API_DN_Subcont = () => API + getRolePath() + `/dn/index`;
export const API_DN_Detail_Subcont = () => API + getRolePath() + `/dn/detail/`;
export const API_DN_Edit_Subcont = () => API + getRolePath() + `/dn/edit/`;
export const API_Update_DN_Subcont = () => API + getRolePath() + `/dn/update`;
export const API_DN_History_Subcont = () => API + getRolePath() + `/dn/history/`;

export const API_Print_PO_Subcont = () => API + getRolePath() + `/po/print/`;
export const API_Print_DN_Subcont = () => API + getRolePath() + `/dn/print/`;
export const API_Print_Label_Subcont = () => API + getRolePath() + `/label/print/`;

export const API_Item_Subcont = () => API + getRolePath() + `/item/index`;
export const API_Create_Item_Subcont = () => API + getRolePath() + `/item/store`;
export const API_Transaction_Subcont = () => API + getRolePath() + `/trasaction/index`;
export const API_Transaction_Item_Subcont = () => API + getRolePath() + `/transaction/store`;

export const API_Performance_Report_Subcont = () => API + getRolePath() + `/performance-report/index/`;
export const API_Download_Performance_Report_Subcont = () => API + getRolePath() + `/performance-report/file/`;

export const API_Forecast_Report_Subcont = () => API + getRolePath() + `/forecast/index`;
export const API_Download_Forecast_Report_Subcont = () => API + getRolePath() + `/forecast/file/`;
