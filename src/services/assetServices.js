// Lokasi: /services/api/assetApi.js

import apiClient from '@/lib/api/apiClient'; // Pastikan path ini benar

/**
 * Frontend Service: Mengambil daftar aset individual dengan paginasi dan filter.
 * @param {object} params - Berisi parameter untuk query.
 * @param {number} params.page - Halaman saat ini.
 * @param {number} params.limit - Jumlah item per halaman.
 * @param {object} params.filters - Objek berisi filter (product, location, status, q).
 * @returns {Promise<object>} - Objek respons dari API.
 */
export async function getPaginatedAssets({ page = 1, limit = 10, filters = {} }) {

  const cleanedFilters = {};
  for (const key in filters) {
    if (filters[key]) { // Hanya tambahkan filter jika nilainya tidak kosong
      cleanedFilters[key] = filters[key];
    }
  }
  // Gabungkan semua parameter menjadi satu objek untuk dikirim ke axios
  const params = {
    page,
    limit,
    ...cleanedFilters, // Spread operator untuk menggabungkan semua filter ke level atas
  };

  // Panggil endpoint dengan parameter yang sudah digabung
  // apiClient akan secara otomatis mengubahnya menjadi query string:
  // /api/assets?page=1&limit=10&status=Tersedia&q=laptop
  return apiClient.get('/assets', { params });
}

export async function createAssets(assetsData) {
  return apiClient.post('/assets', assetsData);
}

export async function getAssetById(id) {
  return apiClient.get(`/assets/${id}`);
}

export async function updateAsset(id, assetData) {
  return apiClient.put(`/assets/${id}`, assetData);
}

export async function deleteAsset(id) {
  return apiClient.delete(`/assets/${id}`);
}