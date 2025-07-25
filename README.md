# SMS PT SANOH INDONESIA - Supply Chain Management System

<div align="center">
  <img src="./src/images/logo-sanoh.png" alt="PT Sanoh Indonesia Logo" width="200">
  
  ![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
  ![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
  ![Vite](https://img.shields.io/badge/Vite-4.4.7-646CFF.svg)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38B2AC.svg)
</div>

## 📋 Daftar Isi

- [Tentang Aplikasi](#tentang-aplikasi)
- [Fitur Utama](#fitur-utama)
- [Role dan Akses](#role-dan-akses)
- [Persyaratan Sistem](#persyaratan-sistem)
- [Instalasi](#instalasi)
- [Cara Penggunaan](#cara-penggunaan)
- [Struktur Proyek](#struktur-proyek)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [API dan Backend](#api-dan-backend)
- [Deployment](#deployment)
- [FAQ dan Troubleshooting](#faq-dan-troubleshooting)
- [Business Logic](#business-logic)
- [Print System](#print-system)
- [Kontribusi](#kontribusi)
- [Lisensi](#lisensi)

## 🏢 Tentang Aplikasi

**SMS PT SANOH INDONESIA** adalah sistem manajemen rantai pasok (Supply Chain Management) yang dikembangkan khusus untuk PT Sanoh Indonesia. Aplikasi web ini dirancang untuk mengelola dan mengoptimalkan proses operasional supply chain, mulai dari purchase order, delivery note, hingga manajemen subkontraktor.

### Kegunaan Utama
- **Manajemen Purchase Order (PO)**: Mengelola pesanan pembelian dari supplier
- **Manajemen Delivery Note (DN)**: Tracking dan monitoring pengiriman barang
- **Subcontracting Management**: Mengelola proses subkontraktor dan inventory
- **Performance Reporting**: Analisis performa supplier dan operational
- **Forecast Management**: Perencanaan dan prediksi kebutuhan
- **User Management**: Sistem manajemen pengguna multi-role
- **Print Management**: Sistem cetak dokumen PO, DN, dan label

## 🚀 Fitur Utama

### 📊 Dashboard
- Overview statistik real-time
- Grafik performa PO dan DN
- Calendar events dan reminder
- Quick access ke modul utama

### 📋 Purchase Order Management
- **Create & Edit PO**: Pembuatan dan editing purchase order
- **PO History**: Riwayat dan tracking status PO
- **PO Detail View**: Detail lengkap informasi PO
- **Print PO**: Cetak dokumen PO dalam format PDF

### 📦 Delivery Note Management
- **DN Creation**: Pembuatan delivery note
- **DN Tracking**: Pelacakan status pengiriman
- **DN History**: Riwayat delivery note
- **Print DN & Labels**: Cetak DN dan label pengiriman
- **Quantity Confirmation**: Konfirmasi jumlah barang

### 🏭 Subcontracting Management
- **Stock Items**: Manajemen stok barang subkon
- **Add Items**: Penambahan item baru
- **Manage Items**: Pengelolaan master data item
- **Transactions**: Transaksi masuk/keluar barang
- **Transaction Review**: Review dan approval transaksi
- **Transaction Reports**: Laporan transaksi subkon

### 📈 Reporting & Analytics
- **Performance Report**: Laporan performa supplier
- **Forecast Report**: Laporan prediksi kebutuhan
- **Transaction Report**: Laporan transaksi detail

### 👥 User Management
- **Manage Users**: CRUD pengguna sistem
- **Role Management**: Pengelolaan role dan permission
- **Organization Management**: Manajemen struktur organisasi
- **Profile Settings**: Pengaturan profil pengguna

### 🔒 Authentication & Security
- **Multi-role Authentication**: Login berbasis role
- **Protected Routes**: Route protection berdasarkan role
- **Session Management**: Manajemen sesi pengguna
- **Password Change**: Fitur ganti password

## 👥 Role dan Akses

Sistem menggunakan 9 level role dengan akses yang berbeda:

| Role ID | Role Name | Deskripsi | Akses Utama |
|---------|-----------|-----------|-------------|
| 1 | Super Admin | Administrator tertinggi | Full access ke semua modul |
| 2 | Admin Purchasing | Admin departemen purchasing | PO Management, Reports |
| 3 | Admin Warehouse | Admin gudang | DN Management, Stock Control |
| 4 | Admin Subcont | Admin subcontracting | Subcon Management, Items |
| 5 | Supplier Marketing | Marketing supplier | PO View, DN Input |
| 6 | Supplier Subcont Marketing | Marketing supplier subkon | Subcon Transactions |
| 7 | Supplier Warehouse | Warehouse supplier | DN Management |
| 8 | Supplier Subcont | Supplier subkontraktor | Subcon Operations |
| 9 | Super User | Power user | Extended access multiple modules |

### Contoh Akses Role:
```typescript
// Contoh implementasi role access
allowedRoles={['1','2','3','4','5','6','7','8','9']} // Dashboard - All roles
allowedRoles={['1','2']} // Admin only access
allowedRoles={['1','2','3','4']} // Internal users only
allowedRoles={['5','6','7','8']} // Supplier users only
```

## 💻 Persyaratan Sistem

### Minimum Requirements
- **Node.js**: versi 16.0.0 atau lebih tinggi
- **npm**: versi 7.0.0 atau lebih tinggi (atau yarn)
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Memory**: 4GB RAM minimum
- **Storage**: 500MB ruang kosong

### Recommended Requirements
- **Node.js**: versi 18.0.0 atau lebih tinggi
- **npm**: versi 8.0.0 atau lebih tinggi
- **Browser**: Latest version
- **Memory**: 8GB RAM
- **Storage**: 1GB ruang kosong

## 🛠 Instalasi

### 1. Clone Repository
```bash
# Clone repository
git clone https://github.com/mygads/react-scm-sanoh-new.git

# Masuk ke direktori project
cd react-scm-sanoh-new
```

### 2. Install Dependencies
```bash
# Install menggunakan npm
npm install

# Atau menggunakan yarn
yarn install
```

### 3. Environment Setup
```bash
# Copy environment file (jika ada)
cp .env.example .env

# Edit konfigurasi API di src/api/api.tsx
# Ubah URL API sesuai dengan environment Anda
```

### 4. Development Server
```bash
# Jalankan development server
npm run dev

# Atau menggunakan yarn
yarn dev
```

Aplikasi akan berjalan di `http://localhost:5173`

### 5. Build Production
```bash
# Build untuk production
npm run build

# Preview build
npm run preview
```

## 📖 Cara Penggunaan

### Login Sistem
1. Buka aplikasi di browser
2. Masukkan username dan password
3. Sistem akan redirect sesuai role pengguna

### Navigasi Utama
- **Dashboard**: Halaman utama dengan overview data
- **Purchase Order**: Menu PO management
- **Delivery Note**: Menu DN management  
- **Subcon**: Menu subcontracting
- **Reports**: Menu laporan dan analytics
- **User Management**: Menu pengelolaan user (admin only)

### Workflow Umum

#### Purchase Order Flow:
1. **Create PO** → Input data PO baru
2. **Review PO** → Validasi dan approval
3. **Print PO** → Cetak dokumen PO
4. **Track Status** → Monitor progress PO

#### Delivery Note Flow:
1. **Create DN** → Buat DN dari PO
2. **Input Quantity** → Input jumlah kirim
3. **Confirm DN** → Konfirmasi pengiriman
4. **Print Label** → Cetak label pengiriman

#### Subcon Flow:
1. **Add Items** → Tambah master item
2. **Stock Transaction** → Input transaksi stock
3. **Review Transaction** → Review dan approval
4. **Generate Report** → Buat laporan

### Tips Penggunaan
- Gunakan **Ctrl+S** untuk quick save form
- Gunakan fitur **Search** untuk pencarian cepat
- Manfaatkan **Filter** untuk sorting data
- Check **Notification** untuk update terbaru

## 📁 Struktur Proyek

```
react-scm-sanoh-new/
├── public/                          # Static assets
│   ├── data.json                   # Data konfigurasi
│   ├── icon_sanoh.png             # Icon aplikasi
│   └── assets/                     # Asset tambahan
├── src/                            # Source code utama
│   ├── api/                        # API configuration
│   │   └── api.tsx                # API endpoints & base URL
│   ├── components/                 # Reusable components
│   │   ├── Breadcrumbs/           # Breadcrumb navigation
│   │   ├── Charts/                # Chart components
│   │   ├── Forms/                 # Form components
│   │   ├── Sidebar/               # Sidebar navigation
│   │   ├── Table/                 # Table components
│   │   ├── Calendar.tsx           # Calendar component
│   │   ├── CardDataStats.tsx      # Statistics cards
│   │   ├── ModalSettings.tsx      # Settings modal
│   │   ├── Notification.tsx       # Notification component
│   │   └── UserOnline.tsx         # Online user indicator
│   ├── hooks/                     # Custom React hooks
│   │   ├── fireToast.tsx         # Toast notification hook
│   │   ├── useColorMode.tsx      # Color mode hook
│   │   └── useLocalStorage.tsx   # Local storage hook
│   ├── layout/                    # Layout components
│   │   └── DefaultLayout.tsx     # Main application layout
│   ├── pages/                     # Page components
│   │   ├── Authentication/        # Auth related pages
│   │   │   ├── AuthContext.tsx   # Auth context provider
│   │   │   ├── ProtectedRoute.tsx # Route protection
│   │   │   ├── Role.tsx          # Role definitions
│   │   │   └── Pages/            # Auth pages
│   │   ├── Dashboard/            # Dashboard pages
│   │   ├── PurchaseOrder/        # PO management pages
│   │   │   ├── IndexPurchaseOrder.tsx
│   │   │   ├── IndexHistoryPurchaseOrder.tsx
│   │   │   └── Pages/            # PO detail pages
│   │   ├── DeliveryNote/         # DN management pages
│   │   │   ├── IndexDeliveryNote.tsx
│   │   │   ├── IndexHistoryDeliveryNote.tsx
│   │   │   └── Pages/            # DN detail pages
│   │   ├── Subcon/               # Subcontracting pages
│   │   │   ├── StockItems/       # Stock management
│   │   │   ├── AddItems/         # Add items
│   │   │   ├── ManageItems/      # Manage items
│   │   │   ├── Transactions/     # Transactions
│   │   │   ├── TransactionsReview/ # Transaction review
│   │   │   └── TransactionsReport/ # Transaction reports
│   │   ├── ManageUser/           # User management
│   │   │   └── Pages/            # User CRUD pages
│   │   ├── PerformanceReport/    # Performance reports
│   │   ├── ForecastReport/       # Forecast reports
│   │   ├── Print/                # Print pages
│   │   │   ├── PrintPO.tsx       # Print PO
│   │   │   ├── PrintDN.tsx       # Print DN
│   │   │   └── PrintLabel.tsx    # Print labels
│   │   └── ProfileSetting.tsx    # Profile settings
│   ├── types/                     # TypeScript type definitions
│   ├── css/                       # CSS stylesheets
│   │   ├── style.css             # Main styles
│   │   ├── satoshi.css           # Satoshi font
│   │   ├── notification.css      # Notification styles
│   │   └── performance.css       # Performance styles
│   ├── fonts/                     # Font files
│   ├── images/                    # Image assets
│   │   ├── logo-sanoh.png        # Company logo
│   │   ├── logo_sanoh_address.png # Logo with address
│   │   ├── cover/                # Cover images
│   │   ├── icon/                 # Icons
│   │   └── logo/                 # Logo variants
│   ├── js/                        # JavaScript utilities
│   ├── App.tsx                    # Main App component
│   ├── main.tsx                   # Application entry point
│   ├── jsvectormap.d.ts          # Vector map types
│   ├── lib.d.ts                  # Library definitions
│   └── react-app-env.d.ts        # React environment types
├── index.html                     # HTML template
├── package.json                   # Project dependencies
├── vite.config.js                # Vite configuration
├── tailwind.config.cjs           # Tailwind CSS config
├── postcss.config.cjs            # PostCSS configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation
```

### Key Directories Explanation:

#### `/src/api/`
Berisi konfigurasi API dan endpoint definitions:
```typescript
// api.tsx - Base API configuration
const API = 'https://apiv2.profileporto.site/api';

// Role-based API paths
const getRolePath = () => {
    const userRole = localStorage.getItem('role');
    return userRole ? `/${userRole}` : '';
};

// API endpoints
export const API_Login = () => API + '/login';
export const API_Dashboard = () => API + getRolePath() + `/dashboard`;
```

#### `/src/components/`
Komponen reusable untuk UI:
- **Forms/**: Form input components
- **Charts/**: Chart dan visualization components
- **Table/**: Data table components
- **Sidebar/**: Navigation sidebar

#### `/src/pages/`
Halaman utama aplikasi:
- **Authentication/**: Login, logout, role management
- **Dashboard/**: Dashboard utama
- **PurchaseOrder/**: PO management
- **DeliveryNote/**: DN management
- **Subcon/**: Subcontracting modules

#### `/src/hooks/`
Custom React hooks:
```typescript
// useLocalStorage.tsx
export const useLocalStorage = (key: string, initialValue: any) => {
  // Implementation
};

// fireToast.tsx
export const fireToast = (message: string, type: 'success' | 'error') => {
  // Toast notification implementation
};
```

## 🛠 Teknologi yang Digunakan

### Frontend Framework
- **React 18.3.1**: Library utama untuk UI
- **TypeScript**: Type-safe JavaScript
- **Vite 4.4.7**: Build tool dan dev server
- **React Router DOM 6.14.2**: Client-side routing

### UI & Styling
- **TailwindCSS 3.4.1**: Utility-first CSS framework
- **CoreUI 5.2.0**: UI component library
- **Material-UI 6.1.6**: Google Material Design components
- **Flowbite React**: Additional UI components
- **React Icons 4.10.1**: Icon library

### Data Visualization
- **ApexCharts 3.41.0**: Chart library
- **React ApexCharts 1.4.1**: React wrapper for ApexCharts
- **JSVectorMap 1.5.3**: Interactive maps

### Date & Time
- **Date-fns 4.1.0**: Date utility library
- **Moment.js 2.30.1**: Date parsing dan formatting
- **React DatePicker 7.5.0**: Date picker component
- **React Big Calendar 1.16.3**: Calendar component

### Forms & Input
- **React Hook Form**: Form management
- **React Select 5.8.2**: Enhanced select component
- **React Modal 3.16.1**: Modal dialogs

### File Handling
- **XLSX 0.18.5**: Excel file handling
- **File-saver 2.0.5**: File download utility
- **React PDF 4.0.0**: PDF generation
- **jsPDF 2.5.2**: PDF creation library
- **html2pdf.js 0.10.2**: HTML to PDF conversion

### HTTP Client
- **Axios 1.7.7**: HTTP client for API calls

### Notifications
- **React Hot Toast 2.4.1**: Toast notifications
- **React Toastify 9.1.3**: Alternative toast library
- **SweetAlert2 11.14.3**: Beautiful alert dialogs

### Development Tools
- **Prettier 3.0.0**: Code formatter
- **Autoprefixer 10.4.14**: CSS vendor prefixes
- **PostCSS 8.4.27**: CSS processing tool

## 🔗 API dan Backend

### Base API Configuration
```typescript
// Current API endpoints
const API = 'https://apiv2.profileporto.site/api';
// const API = 'http://127.0.0.1:8000/api'; // Development
// const API = 'https://be-sss-dev.sanohindonesia.co.id:8443/api'; // Staging
```

### API Structure
Aplikasi menggunakan role-based API endpoints:

#### Authentication APIs
- `POST /login` - User login
- `POST /{role}/logout` - User logout
- `POST /{role}/change-password` - Change password

#### Dashboard APIs
- `GET /{role}/dashboard` - Dashboard data
- `GET /{role}/yearData` - Year-based PO/DN data
- `GET /{role}/event` - Calendar events

#### Purchase Order APIs
- `GET /{role}/po` - List purchase orders
- `GET /{role}/po/{id}` - PO details
- `POST /{role}/po` - Create new PO
- `PUT /{role}/po/{id}` - Update PO
- `GET /{role}/po/print/{id}` - Print PO

#### Delivery Note APIs
- `GET /{role}/dn` - List delivery notes
- `GET /{role}/dn/{id}` - DN details
- `POST /{role}/dn` - Create new DN
- `PUT /{role}/dn/{id}` - Update DN
- `GET /{role}/dn/print/{id}` - Print DN

### Menambah API Baru

#### 1. Definisi Endpoint di `api.tsx`
```typescript
// Tambahkan endpoint baru
export const API_New_Feature = () => API + getRolePath() + `/new-feature`;
export const API_New_Feature_Detail = (id: string) => API + getRolePath() + `/new-feature/${id}`;
```

#### 2. Implementasi Service Function
```typescript
// services/newFeatureService.ts
import axios from 'axios';
import { API_New_Feature, API_New_Feature_Detail } from '../api/api';

export const getNewFeatureList = async () => {
  try {
    const response = await axios.get(API_New_Feature(), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getNewFeatureDetail = async (id: string) => {
  try {
    const response = await axios.get(API_New_Feature_Detail(id), {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

#### 3. Implementasi Component
```typescript
// pages/NewFeature/IndexNewFeature.tsx
import { useEffect, useState } from 'react';
import { getNewFeatureList } from '../../services/newFeatureService';

const IndexNewFeature = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await getNewFeatureList();
      setData(result.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Component implementation */}
    </div>
  );
};

export default IndexNewFeature;
```

#### 4. Tambahkan Route di `App.tsx`
```typescript
// App.tsx
<Route
  path="/new-feature"
  element={
    <ProtectedRoute allowedRoles={['1','2','3']}>
      <PageTitle title="New Feature | PT SANOH INDONESIA" />
      <IndexNewFeature />
    </ProtectedRoute>
  }
/>
```

### HTTP Client Configuration
```typescript
// utils/httpClient.ts
import axios from 'axios';

const httpClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
httpClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('access_token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default httpClient;
```

## 🚀 Development dan Deployment

### Development Environment

#### 1. Setup Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access aplikasi
http://localhost:5173
```

#### 2. Development Scripts
```json
{
  "scripts": {
    "dev": "vite",                    // Development server (port 5173)
    "build": "vite build",            // Production build
    "preview": "vite preview"         // Preview production build
  }
}
```

#### 3. Environment Variables
```typescript
// vite-env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}

// .env files
VITE_API_URL=https://apiv2.profileporto.site/api
VITE_APP_TITLE=SMS PT SANOH INDONESIA
```

### Build Configuration

#### Vite Configuration (`vite.config.js`)
```javascript
export default defineConfig({
  base: './',                         // Base path untuk deployment
  plugins: [react()],                 // React plugin
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'], // Vendor chunk splitting
        },
      },
    },
    chunkSizeWarningLimit: 5000,      // Chunk size limit
  },
});
```

### Production Deployment

#### 1. Build untuk Production
```bash
# Build production files
npm run build

# Output akan ada di folder 'dist/'
```

#### 2. Deployment ke Server
```bash
# Upload folder 'dist/' ke web server
# Configure web server untuk serve static files

# Nginx configuration example:
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### 3. Deployment ke Hosting Platform

##### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

##### Netlify Deployment
```bash
# Build command: npm run build
# Publish directory: dist
# Redirects: /*    /index.html   200
```

### Environment-Specific Configurations

#### Development
- **Port**: 5173 (default Vite)
- **API**: Local development server
- **Hot reload**: Enabled
- **Source maps**: Enabled

#### Staging
- **API**: Staging server endpoint
- **Build**: Optimized but with source maps
- **Environment**: `staging`

#### Production
- **API**: Production server endpoint
- **Build**: Fully optimized
- **Source maps**: Disabled
- **Compression**: Enabled

## 📝 Panduan Edit File

### 1. Mengedit Komponen UI

#### Contoh: Mengedit Sidebar Navigation
```typescript
// src/components/Sidebar/index.tsx
const menuItems = [
  {
    label: 'Dashboard',
    route: '/dashboard',
    icon: 'dashboard-icon',
    roles: ['1','2','3','4','5','6','7','8','9']
  },
  {
    label: 'New Menu Item',        // Tambahkan menu baru
    route: '/new-feature',
    icon: 'new-icon',
    roles: ['1','2','3']           // Tentukan role access
  }
];
```

#### Contoh: Mengedit Styling
```css
/* src/css/style.css */
.new-feature-container {
  @apply bg-white dark:bg-boxdark p-6 rounded-lg shadow-lg;
}

.new-feature-button {
  @apply bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark;
}
```

### 2. Menambah Halaman Baru

#### Step 1: Buat Component Page
```typescript
// src/pages/NewFeature/IndexNewFeature.tsx
import { useState, useEffect } from 'react';
import PageTitle from '../../components/PageTitle';

const IndexNewFeature = () => {
  const [data, setData] = useState([]);

  return (
    <>
      <PageTitle title="New Feature" />
      <div className="new-feature-container">
        {/* Content */}
      </div>
    </>
  );
};

export default IndexNewFeature;
```

#### Step 2: Tambahkan Route
```typescript
// src/App.tsx - Tambahkan di dalam Routes
<Route
  path="/new-feature"
  element={
    <ProtectedRoute allowedRoles={['1','2','3']}>
      <PageTitle title="New Feature | PT SANOH INDONESIA" />
      <IndexNewFeature />
    </ProtectedRoute>
  }
/>
```

### 3. Mengedit API Configuration

#### Menambah Endpoint Baru
```typescript
// src/api/api.tsx
export const API_New_Feature = () => API + getRolePath() + `/new-feature`;
export const API_New_Feature_Create = () => API + getRolePath() + `/new-feature/create`;
export const API_New_Feature_Update = (id: string) => API + getRolePath() + `/new-feature/${id}`;
export const API_New_Feature_Delete = (id: string) => API + getRolePath() + `/new-feature/${id}`;
```

### 4. Best Practices untuk Edit

#### Code Style Guidelines
```typescript
// ✅ Good - Consistent naming
const NewFeatureComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  
  return <div>Content</div>;
};

// ❌ Bad - Inconsistent naming
const newfeature = () => {
  const [loading, setload] = useState(false);
  const [data, setdata] = useState(null);
  
  return <div>Content</div>;
};
```

#### TypeScript Types
```typescript
// types/newFeature.ts
export interface NewFeatureItem {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface NewFeatureCreateRequest {
  name: string;
  description?: string;
}
```

#### Error Handling
```typescript
const handleApiCall = async () => {
  try {
    setIsLoading(true);
    const response = await apiService.getData();
    setData(response.data);
  } catch (error) {
    console.error('Error:', error);
    toast.error('Failed to fetch data');
  } finally {
    setIsLoading(false);
  }
};
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Error: Port 5173 is already in use
# Solution: Kill process or use different port
npx kill-port 5173
# or
npm run dev -- --port 3000
```

#### 2. Module Not Found
```bash
# Error: Cannot resolve module
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 3. Build Errors
```bash
# TypeScript errors
# Solution: Check type definitions
npm run build 2>&1 | grep error
```

#### 4. API Connection Issues
```typescript
// Check API configuration
console.log('API Base URL:', API);
console.log('User Role:', localStorage.getItem('role'));
console.log('Access Token:', localStorage.getItem('access_token'));
```

### Performance Optimization

#### 1. Code Splitting
```typescript
// Lazy load components
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Use Suspense
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

#### 2. Memoization
```typescript
// Memo for expensive computations
const expensiveValue = useMemo(() => {
  return heavyComputation(data);
}, [data]);

// Callback memoization
const handleClick = useCallback(() => {
  // Handler logic
}, [dependency]);
```

## 📚 Resources dan Dokumentasi

### Official Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Component Libraries
- [CoreUI React Documentation](https://coreui.io/react/docs/)
- [Material-UI Documentation](https://mui.com/)
- [Flowbite React Documentation](https://flowbite-react.com/)

### Tools dan Utilities
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Router Documentation](https://reactrouter.com/)
- [ApexCharts Documentation](https://apexcharts.com/docs/)

## ❓ FAQ dan Troubleshooting

### Frequently Asked Questions

#### Q: Bagaimana cara mengakses sistem SMS PT Sanoh Indonesia?
**A:** Gunakan kredensial yang diberikan oleh IT admin. Sistem memiliki 9 level role yang berbeda, pastikan Anda login dengan role yang sesuai.

#### Q: Mengapa saya tidak bisa melihat menu tertentu?
**A:** Sistem menggunakan role-based access control. Setiap menu memiliki pembatasan role yang berbeda:
- **Super Admin (1)**: Full access
- **Admin Purchasing (2)**: PO Management, Reports
- **Admin Warehouse (3)**: DN Management, Stock Control
- **Supplier roles (5-8)**: Akses terbatas sesuai fungsi

#### Q: Bagaimana cara mencetak Purchase Order atau Delivery Note?
**A:** 
1. Navigasi ke halaman PO/DN detail
2. Klik tombol "Print"
3. Sistem akan membuka halaman print dalam tab baru
4. Gunakan Ctrl+P atau Print dari browser

#### Q: Data tidak ter-update setelah input, kenapa?
**A:** 
1. Refresh halaman dengan F5
2. Pastikan koneksi internet stabil
3. Check apakah ada notifikasi error
4. Coba logout dan login kembali

#### Q: Bagaimana cara mengakses dashboard yang berbeda sesuai role?
**A:** Sistem memiliki 8 jenis dashboard berbeda:
- **Super Admin**: `DashboardSuperAdmin` - Full system overview
- **Super User**: `DashboardSuperUser` - Extended access dashboard  
- **Admin Purchasing/Warehouse**: `DashboardAdminPurchasingWarehouse` - PO & DN focus
- **Admin Subcont**: `DashboardAdminSubcont` - Subcontracting focus
- **Supplier Marketing**: `DashboardSupplierMarketing` - Supplier view
- **Supplier Subcont Marketing**: `DashboardSupplierSubcontMarketing` - Subcon marketing
- **Supplier Warehouse**: `DashboardSupplierWarehouse` - Warehouse operations
- **Supplier Subcont**: `DashboardSupplierSubcont` - Subcon operations

#### Q: Mengapa muncul pesan "No dashboard available for your role"?
**A:** 
1. Role Anda belum terdefinisi dengan benar
2. Clear browser cache dan login ulang
3. Contact admin untuk verifikasi role assignment
4. Pastikan role tersimpan di localStorage dengan benar

#### Q: Bagaimana cara menggunakan fitur notification?
**A:** Sistem memiliki 3 jenis notifikasi:
- **Success** (hijau): Operasi berhasil
- **Error** (merah): Ada kesalahan
- **Warning** (kuning): Peringatan
- Notifikasi akan hilang otomatis setelah 3 detik

#### Q: Apa itu Modal Settings dan bagaimana menggunakannya?
**A:** Modal Settings digunakan untuk konfigurasi data dengan validasi form:
- Pastikan field `id` dan `value` terisi
- Parameter `para` default: "price"
- Type dan criterion memiliki nilai default "0"
- Form akan menampilkan error jika ada field yang kosong

#### Q: Bagaimana cara mengganti password?
**A:** 
1. Login ke sistem
2. Navigasi ke Profile Settings
3. Gunakan endpoint API: `/{role}/change-password`
4. Masukkan password lama dan password baru
5. Sistem akan memvalidasi dan mengupdate password

#### Q: Mengapa aplikasi running di port 5173?
**A:** Aplikasi menggunakan Vite sebagai build tool yang default menggunakan port 5173. Jika port terpakai, gunakan:
```bash
npm run dev -- --port 3000
```

#### Q: Bagaimana cara mengecek status API connection?
**A:** 
1. Buka Developer Tools (F12)
2. Check Console untuk error messages
3. Lihat Network tab untuk API calls
4. Pastikan API endpoints mengembalikan response yang benar

#### Q: File apa saja yang bisa di-print dari sistem?
**A:** Sistem mendukung print untuk:
- **Purchase Order**: Format professional dengan letterhead
- **Delivery Note**: 3 format (Normal, Confirmation, Outstanding)
- **Labels**: Format untuk label printer dengan QR code
- Semua menggunakan endpoint API terpisah dengan role-based access

#### Q: Bagaimana cara menggunakan fitur Export Excel?
**A:** Sistem menggunakan library XLSX untuk export:
1. Pilih data yang ingin di-export
2. Klik tombol Export
3. File akan didownload dalam format .xlsx
4. Gunakan file-saver untuk save otomatis

#### Q: Apa itu Unauthorized page dan kapan muncul?
**A:** Halaman Unauthorized muncul ketika:
- User mencoba akses halaman tanpa permission
- Role tidak memiliki akses ke route tertentu
- Token authentication expired
- Session tidak valid

#### Q: Bagaimana cara menggunakan date picker di sistem?
**A:** Sistem menggunakan multiple date libraries:
- **React DatePicker**: Untuk input tanggal tunggal
- **React Big Calendar**: Untuk calendar view
- **Date-fns**: Untuk formatting tanggal
- **Moment.js**: Untuk manipulasi tanggal kompleks

#### Q: Bagaimana cara mengupload file di sistem?
**A:** Sistem mendukung:
- File validation sebelum upload
- Multiple file types (PDF, Excel, images)
- File size limitation
- Drag & drop interface (jika tersedia)

### Common Issues & Solutions

#### Issue: "Port 5173 is already in use"
**Solution:** 
```bash
# Kill existing process
npx kill-port 5173
# Or use different port
npm run dev -- --port 3000
```

#### Issue: Login gagal atau token expired
**Solution:**
1. Clear browser cache dan cookies
2. Pastikan username/password benar
3. Check dengan IT admin jika masih error
4. Pastikan API server berjalan normal

#### Issue: Print tidak berfungsi
**Solution:**
1. Pastikan browser mengizinkan popup
2. Check printer connection
3. Pastikan role memiliki akses print
4. Coba gunakan browser Chrome untuk hasil terbaik

#### Issue: Data PO/DN tidak muncul
**Solution:**
1. Check filter tanggal yang digunakan
2. Pastikan role memiliki akses view data
3. Refresh halaman
4. Contact admin jika data seharusnya ada

#### Issue: Dashboard tidak loading atau kosong
**Solution:**
1. Check console untuk JavaScript errors
2. Pastikan role tersimpan di localStorage:
   ```javascript
   console.log(localStorage.getItem('role'));
   ```
3. Verify role mapping di `Dashboard.tsx`
4. Clear browser cache dan hard refresh (Ctrl+Shift+R)

#### Issue: Notification tidak muncul
**Solution:**
1. Check apakah ToastContainer sudah di-import
2. Pastikan notification component ter-render
3. Verify timeout setting (default 3 detik)
4. Check CSS styling untuk notification

#### Issue: Modal Settings form validation error
**Solution:**
1. Pastikan field `id` dan `value` tidak kosong
2. Check format data yang di-input
3. Verify parameter sesuai dengan `data.json` structure
4. Debug dengan console.log untuk melihat formState

#### Issue: API calls returning 401 Unauthorized
**Solution:**
1. Check access token di localStorage:
   ```javascript
   console.log(localStorage.getItem('access_token'));
   ```
2. Verify token expiration
3. Re-login untuk mendapat token baru
4. Check API endpoint configuration

#### Issue: Charts tidak muncul (ApexCharts)
**Solution:**
1. Pastikan data format sesuai dengan ApexCharts requirement
2. Check console untuk chart rendering errors
3. Verify chart container DOM element
4. Ensure chart library sudah ter-load

#### Issue: Calendar events tidak tampil
**Solution:**
1. Check API endpoint: `/{role}/event`
2. Verify date format untuk events
3. Pastikan calendar component ter-render
4. Check event data structure

#### Issue: File export Excel gagal
**Solution:**
1. Pastikan data tidak kosong
2. Check file permissions di browser
3. Verify XLSX library configuration
4. Test dengan data sample

#### Issue: Subcon transaction tidak ter-update
**Solution:**
1. Check role access untuk subcon modules
2. Verify transaction review process
3. Ensure stock levels calculation correct
4. Check transaction status workflow

#### Issue: Password input tidak berfungsi
**Solution:**
1. Check PasswordInput component implementation
2. Verify form submission handler
3. Ensure password validation rules
4. Check API endpoint untuk change password

#### Issue: Vector maps tidak loading
**Solution:**
1. Pastikan JSVectorMap library ter-load
2. Check map data file
3. Verify container dimensions
4. Check console untuk map rendering errors

#### Issue: Dark mode toggle tidak berfungsi
**Solution:**
1. Check useColorMode hook implementation
2. Verify CSS classes untuk dark theme
3. Ensure localStorage menyimpan theme preference
4. Check TailwindCSS dark mode configuration

#### Issue: Role-based routing tidak bekerja
**Solution:**
1. Verify ProtectedRoute implementation
2. Check allowedRoles array untuk setiap route
3. Ensure AuthContext providing correct role
4. Debug dengan console.log di route components

#### Issue: Performance lambat saat load data besar
**Solution:**
1. Implement pagination untuk data tables
2. Use React.memo untuk expensive components
3. Implement code splitting dengan lazy loading
4. Optimize API calls dengan debouncing

#### Issue: Mobile responsive tidak optimal
**Solution:**
1. Check TailwindCSS responsive classes
2. Test di berbagai screen sizes
3. Verify touch interactions
4. Ensure proper viewport meta tag

### Development Issues

#### Issue: TypeScript compilation errors
**Solution:**
1. Check type definitions di `src/types/`
2. Verify import statements
3. Update TypeScript configuration
4. Run `npm run build` untuk check errors

#### Issue: Vite build gagal
**Solution:**
1. Check `vite.config.js` configuration
2. Verify all imports valid
3. Clear node_modules dan reinstall
4. Check chunk size limits

#### Issue: Hot reload tidak berfungsi
**Solution:**
1. Restart development server
2. Check file changes di watched directories
3. Verify Vite HMR configuration
4. Clear browser cache

#### Issue: ESLint/Prettier conflicts
**Solution:**
1. Check `.eslintrc` dan `prettier.config`
2. Run format commands:
   ```bash
   npm run format
   npm run lint:fix
   ```
3. Resolve conflicts manually
4. Update configuration files

### API Troubleshooting

#### Issue: API endpoint not found (404)
**Solution:**
1. Check API base URL configuration
2. Verify role-based path generation
3. Ensure backend routes exist
4. Check API documentation

#### Issue: CORS errors
**Solution:**
1. Configure backend CORS settings
2. Ensure proper headers di axios
3. Check allowed origins
4. Verify API server configuration

#### Issue: Token refresh mechanism
**Solution:**
1. Implement token refresh logic
2. Handle 401 responses properly
3. Redirect to login when needed
4. Store refresh token securely

## 🏢 Business Logic

### Purchase Order Workflow
```
1. Supplier Marketing (Role 5) → Create PO Request
2. Admin Purchasing (Role 2) → Review & Approve PO
3. System generates PO Number
4. PO sent to supplier
5. Supplier confirms PO
6. PO status updated to "Confirmed"
```

### Delivery Note Workflow
```
1. Supplier creates DN based on confirmed PO
2. Input actual delivery quantities
3. Admin Warehouse (Role 3) → Confirm receipt
4. System updates stock levels
5. DN status updated to "Completed"
6. Generate delivery labels if needed
```

### Subcontracting Process
```
1. Admin Subcont (Role 4) → Manage item master data
2. Supplier Subcont (Role 8) → Create transactions
3. Transaction Review by Admin Subcont
4. Stock level updates automatically
5. Generate transaction reports
```

### Role-based Business Rules

#### Internal Users (Roles 1-4)
- **Super Admin**: Full system access, user management
- **Admin Purchasing**: PO creation, approval, vendor management
- **Admin Warehouse**: DN processing, stock control, receiving
- **Admin Subcont**: Subcontractor management, item master data

#### Supplier Users (Roles 5-8)
- **Supplier Marketing**: PO viewing, basic DN input
- **Supplier Subcont Marketing**: Subcon transaction marketing functions
- **Supplier Warehouse**: DN creation and management
- **Supplier Subcont**: Subcon operations, stock transactions

### Data Validation Rules

#### Purchase Order
- PO Number: Auto-generated, format `PO-YYYY-MM-NNNN`
- Supplier: Must be registered in system
- Items: Minimum 1 item required
- Quantities: Must be positive numbers
- Delivery Date: Cannot be in the past

#### Delivery Note
- DN Number: Auto-generated, format `DN-YYYY-MM-NNNN`
- Reference PO: Must exist and be confirmed
- Delivery Qty: Cannot exceed PO quantity
- Delivery Date: Must be realistic date

## �️ Print System

### Print Capabilities
Aplikasi SMS PT Sanoh Indonesia memiliki sistem print yang comprehensive:

#### 1. Print Purchase Order
**Endpoint:** `GET /{role}/po/print/{id}`
**Features:**
- Professional PO document format
- Company letterhead dengan logo Sanoh
- Complete PO details (items, quantities, prices)
- Terms and conditions
- Digital signature placeholder

#### 2. Print Delivery Note
**Endpoint:** `GET /{role}/dn/print/{id}`
**Features:**
- Standard DN format untuk shipping
- Barcode untuk tracking
- Item details dengan quantities
- Delivery address information
- Multiple print options:
  - Normal DN print
  - Quantity confirmation format
  - Outstanding items format

#### 3. Print Labels
**Endpoint:** `GET /{role}/dn-label/print/{id}`
**Features:**
- Shipping label format
- QR Code untuk tracking
- Compact design untuk label printer
- Multiple label per sheet
- Barcode integration

### Print Implementation
```typescript
// Print PO Example
const handlePrintPO = (poId: string) => {
  const printUrl = API_Print_PO() + poId;
  const printWindow = window.open(printUrl, '_blank');
  if (printWindow) {
    printWindow.focus();
  }
};

// Print DN with options
const handlePrintDN = (dnId: string, type: 'normal' | 'confirm' | 'outstanding') => {
  let printUrl;
  switch(type) {
    case 'confirm':
      printUrl = API_Print_DN_Confirm() + dnId;
      break;
    case 'outstanding':
      printUrl = API_Print_DN_Outstanding() + dnId;
      break;
    default:
      printUrl = API_Print_DN() + dnId;
  }
  window.open(printUrl, '_blank');
};
```

### Print Access Control
```typescript
// Print PO - Role access
allowedRoles={['2','5','6','9']} // Admin Purchasing, Supplier Marketing, etc.

// Print DN - Role access  
allowedRoles={['2','3','4','5','6','7','8','9']} // Almost all roles

// Print Labels - Role access
allowedRoles={['2','3','4','5','6','7','8','9']} // Almost all roles
```

### Print Best Practices
1. **Browser Compatibility**: Gunakan Chrome untuk hasil print terbaik
2. **Popup Blocker**: Pastikan popup tidak diblokir browser
3. **Print Settings**: Set margins ke "Minimum" untuk hasil optimal
4. **Paper Size**: Gunakan A4 untuk dokumen, label printer untuk labels
5. **Print Preview**: Selalu check print preview sebelum print final

## 📚 Resources dan Dokumentasi

### Official Documentation

**PT Sanoh Indonesia - IT Development Team**

- **Email**: sanoh@sanohindonesia.co.id
- **Website**: https://sanohindonesia.co.id/
- **Version**: 2.0.0

## 📄 Lisensi

Copyright © 2024 PT Sanoh Indonesia. All rights reserved.

Aplikasi ini dikembangkan khusus untuk PT Sanoh Indonesia dan tunduk pada kebijakan internal perusahaan.

---

<div align="center">
  <p><strong>SMS PT SANOH INDONESIA v2.0.0</strong></p>
  <p>Supply Chain Management System</p>
  <p>Made with ❤️ by PT Sanoh Indonesia IT Team</p>
</div>

## System Requirements

- Node.js >=v14.16+ (Recommended)
- NPM (comes with Node.js)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/mygads/react-scm-sanoh-new.git
cd react-scm-sanoh-new
```

2. Install dependencies:
```bash
npm install
