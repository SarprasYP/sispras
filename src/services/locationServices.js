// Lokasi: /lib/services/locationService.js (VERSI BARU YANG LEBIH BAIK)

import apiClient from '@/lib/api/apiClient'; // <-- Import apiClient yang baru

/**
 * Mengambil daftar lokasi dengan paginasi dan filter.
 */
export async function getPaginatedLocations({ page = 1, limit = 10, filters = {} }) {
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
  return apiClient.get('/locations', { params });
}
export async function getAllLocationsForDropdown() {
  const params = {
    "all": true,
  }
   return apiClient.get('/locations', { params });
}

/**
 * Mengirim data untuk membuat lokasi baru.
 */
export async function createLocation(locationData) {
  return apiClient.post('/locations', locationData);
}

// ===================================================================================
// OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID)
// ===================================================================================

/**
 * Mengambil satu data lokasi spesifik berdasarkan ID-nya.
 */
export async function getLocationById(id) {
  return apiClient.get(`/locations/${id}`);
}

/**
 * Mengirim data untuk memperbarui lokasi yang ada.
 */
export async function updateLocation(id, locationData) {
  return apiClient.put(`/locations/${id}`, locationData);
}

/**
 * Menghapus satu lokasi berdasarkan ID-nya.
 */
export async function deleteLocation(id) {
  return apiClient.delete(`/locations/${id}`);
}