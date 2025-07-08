// Lokasi: /lib/services/brandServices.js (VERSI BARU YANG LEBIH BAIK)

import apiClient from '@/lib/api/apiClient'; // <-- Import apiClient yang baru

/**
 * Mengambil daftar lokasi dengan paginasi dan filter.
 */
export async function getPaginatedBrands({ page = 1, limit = 10, filters = {} }) {
  // Logika filter yang lebih sederhana dan aman
  const cleanedFilters = {};
  for (const key in filters) {
    if (filters[key]) { // Hanya tambahkan filter jika nilainya tidak kosong
      cleanedFilters[key] = filters[key];
    }
  }

  const params = {
    page,
    limit,
    ...cleanedFilters
  };

  // Tidak perlu try...catch atau .data lagi.
  // Axios akan menangani pembuatan query string secara otomatis.
  return apiClient.get('/brands', { params });
}
export async function getAllBrandsForDropdown() {
  const params = {
    "all": true,
  }
   return apiClient.get('/brands', { params });
}
/**
 * Mengirim data untuk membuat lokasi baru.
 */
export async function createBrand(brandData) {
  return apiClient.post('/brands', brandData);
}

// ===================================================================================
// OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID)
// ===================================================================================

/**
 * Mengambil satu data lokasi spesifik berdasarkan ID-nya.
 */
export async function getBrandById(id) {
  return apiClient.get(`/brands/${id}`);
}

/**
 * Mengirim data untuk memperbarui lokasi yang ada.
 */
export async function updateBrand(id, brandData) {
  return apiClient.put(`/brands/${id}`, brandData);
}

/**
 * Menghapus satu lokasi berdasarkan ID-nya.
 */
export async function deleteBrand(id) {
  return apiClient.delete(`/brands/${id}`);
}