// Lokasi: /lib/api/apiClient.js

import axios from 'axios';

// Buat instance axios dengan konfigurasi dasar
const apiClient = axios.create({
  baseURL: '/api/inventory', // Semua request akan diawali dengan /api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Gunakan "Interceptor" untuk menangani SEMUA respons di satu tempat
apiClient.interceptors.response.use(
  // 1. Jika respons SUKSES (status 2xx)
  (response) => {
    // Langsung kembalikan data dari respons, jadi kita tidak perlu menulis .data lagi
    return response.data;
  },
  // 2. Jika respons GAGAL (status 4xx atau 5xx)
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    
    // Lempar error agar bisa ditangkap oleh komponen yang memanggil
    // Ini akan meneruskan pesan error dari backend jika ada
    return Promise.reject(error.response?.data || { message: 'Terjadi kesalahan tidak diketahui.' });
  }
);

export default apiClient;