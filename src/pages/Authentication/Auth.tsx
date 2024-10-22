// Komponen penyedia konteks
// export const login = async (username: string, password: string) => {
//   try {
//     const response = await fetch(APIlogin, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ username, password }),
//     });

//     if (response.ok) {
//       const data = await response.json();
//       const expiryDate = new Date();
//       expiryDate.setHours(expiryDate.getHours() + 1);

//       let userRoleName = '';
//       switch (data.role) {
//         case '1':
//         case 1:
//           userRoleName = 'supplier';
//           break;
//         case '2':
//         case 2:
//           userRoleName = 'warehouse';
//           break;
//         case '3':
//         case 3:
//           userRoleName = 'purchasing';
//           break;
//         case '4':
//         case 4:
//           userRoleName = 'admin';
//           break;
//         case '5':
//         case 5:
//           userRoleName = 'subcontract';
//           break;
//         default:
//           userRoleName = 'unknown';
//       }

//       // Simpan data ke localStorage
//       localStorage.setItem('accessToken', data.access_token);
//       localStorage.setItem('tokenExpiry', expiryDate.toISOString());
//       localStorage.setItem('name', data.name);
//       localStorage.setItem('bpCode', data.bp_code);
//       localStorage.setItem('userRole', userRoleName);
//       localStorage.setItem('isAuthenticated', 'true');
//       // Jika Anda memiliki fungsi saveLogout, panggil di sini
//       saveLogout();
      
//     } else {
//       let errorMessage = 'Invalid Username and Password';
//       try {
//         const errorData = await response.json();
//         if (errorData && errorData.message) {
//           errorMessage = errorData.message;
//         }
//       } catch (e) {
//         // Use default error message
//       }
//       throw new Error(errorMessage);
//     }
//   } catch (error) {
//     console.error('Error logging in:', error);
//     throw error;
//   }
// };

// Fungsi untuk logout

export default async function logout() {
  function clearLocalStorage() {
    // Hapus semua item yang terkait dengan sesi pengguna
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('name');
    localStorage.removeItem('bpCode');
    localStorage.removeItem('userRole');
    localStorage.removeItem('APIlogout');
    localStorage.removeItem('lastUrl');
    localStorage.removeItem('lastRole');
    localStorage.removeItem('editUserId');
    localStorage.removeItem('selectedSupplierId');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('sidebar-expanded');
  }

  const APIlogout = localStorage.getItem('APIlogout'); // Ambil URL API logout dari localStorage
  const token = localStorage.getItem('accessToken'); // Ambil token dari localStorage

  if (!token) {
    // Jika tidak ada token, anggap sudah logout dan hapus sesi
    // displayNotification('No active session found.', 'error');
    clearLocalStorage(); // Hapus semua data sesi dari localStorage
    window.location.href = '/auth/signin'; // Redirect ke halaman login
    return;
  }

  try {
    // Kirim permintaan POST ke API untuk logout
    const response = await fetch(APIlogout || '', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ access_token: token }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      // Jika logout berhasil, tampilkan notifikasi dan hapus sesi
      // showNotification('Logout successful.', 'success');
      clearLocalStorage(); // Hapus data sesi
      window.location.href = '/auth/signin'; // Redirect ke halaman login
    } else {
      // Jika API logout gagal, tampilkan pesan error
      // showNotification('Logout failed: ' + (result.message || 'Unknown error'), 'error');
      // clearLocalStorage(); // Tetap hapus data sesi
      // window.location.href = '/auth/signin'; // Redirect ke halaman login
    }
  } catch (error) {
    // Tangani error jika terjadi masalah saat logout
    console.error('Error during logout:', error);
    // showNotification('Logout failed: Server error.', 'error');
    // clearLocalStorage(); // Tetap hapus data sesi
    // window.location.href = '/auth/signin'; // Redirect ke halaman login
  }
};

