/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Lokasi.
 */

import { z } from 'zod';
import Location from '@/models/Location';
import Asset from '@/models/Asset';

// --- Skema Validasi Zod ---
const locationSchema = z.object({
  name: z.string({ required_error: "Nama lokasi wajib diisi." }).trim().min(1, { message: 'Nama lokasi tidak boleh kosong.' }),
  building: z.string({ required_error: "Nama gedung wajib diisi." }).trim().min(1, { message: 'Nama gedung tidak boleh kosong.' }),
  floor: z.string({ required_error: "Lantai wajib diisi." }).trim().min(1, { message: 'Lantai tidak boleh kosong.' }),
  description: z.string().trim().optional(),
});

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Lokasi)
// ===================================================================================
/**
 * BE Service: Mengambil lokasi dengan paginasi, filter, dan sorting.
 * @param {object} options - Opsi query
 * @returns {Promise<object>} - Hasil yang siap dikirim ke API Route.
 */
export async function getPaginatedLocations({
  page = 1,
  limit = 10,
  sortBy = 'building',
  order = 'asc',
  filters = {},
}) {
  const skip = (page - 1) * limit;
  const sortOptions = { [sortBy]: order === 'desc' ? -1 : 1, floor: 1, name: 1 };

  // --- PERBAIKAN 1: Logika Filter yang Canggih ---
  const query = {};
  const andConditions = [];

  // Pisahkan parameter 'q' dari filter kolom lainnya
  const { q, ...columnFilters } = filters;

  // Terapkan filter per kolom
  for (const field in columnFilters) {
    if (columnFilters[field]) {
      andConditions.push({ [field]: { $regex: columnFilters[field], $options: 'i' } });
    }
  }

  // Terapkan filter pencarian cepat ('q') jika ada
  if (q) {
    andConditions.push({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { building: { $regex: q, $options: 'i' } },
        { floor: { $regex: q, $options: 'i' } },
      ],
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }
  // --- Akhir Logika Filter ---


  const [data, totalItems] = await Promise.all([
    // Gunakan 'query' yang sudah dibangun, bukan 'filters'
    Location.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
    Location.countDocuments(query),
  ]);

  // --- PERBAIKAN 2: Struktur Return yang Benar ---
  return {
    data,
    pagination: {
      totalItems,
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      limit: Number(limit)
    },
  };
}

export async function getAllLocationsForDropdown() {
  const locations = await Location.find({}).sort({ building: 1, floor: 1, name: 1 }).lean();
  return locations;
}

/**
 * Membuat lokasi baru setelah validasi.
 * @param {object} data - Data untuk lokasi baru.
 * @returns {Promise<object>} Dokumen lokasi yang baru dibuat.
 */
export async function createLocation(data) {
  const validation = locationSchema.safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }
  try {
    const newLocation = await Location.create(validation.data);
    return newLocation;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error('Kombinasi Nama, Gedung, dan Lantai untuk lokasi sudah ada.');
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

// ===================================================================================
//  OPERASI PADA DOKUMEN TUNGGAL (Berdasarkan ID)
// ===================================================================================

/**
 * Mengambil satu lokasi berdasarkan ID.
 * @param {string} id - ID dari lokasi.
 * @returns {Promise<object>} Dokumen lokasi yang ditemukan.
 */
export async function getLocationById(id) {
  const location = await Location.findById(id).lean();

  if (!location) {
    const notFoundError = new Error('Lokasi tidak ditemukan.');
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
  return location;
}

/**
 * Memperbarui satu lokasi berdasarkan ID.
 * @param {string} id - ID dari lokasi yang akan diperbarui.
 * @param {object} data - Data baru untuk lokasi.
 * @returns {Promise<object>} Dokumen lokasi yang sudah diperbarui.
 */
export async function updateLocationById(id, data) {
  const validation = locationSchema.partial().safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  try {
    const updatedLocation = await Location.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true
    }).lean();

    if (!updatedLocation) {
      const notFoundError = new Error('Lokasi tidak ditemukan untuk diperbarui.');
      notFoundError.isNotFound = true;
      throw notFoundError;
    }
    return updatedLocation;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error('Kombinasi Nama, Gedung, dan Lantai sudah ada.');
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

/**
 * Menghapus satu lokasi berdasarkan ID.
 * @param {string} id - ID lokasi yang akan dihapus.
 * @returns {Promise<void>}
 */
export async function deleteLocationById(id) {

  const assetCount = await Asset.countDocuments({ location: id });
  if (assetCount > 0) {
    const conflictError = new Error(`Lokasi tidak dapat dihapus karena masih menjadi tempat bagi ${assetCount} aset.`);
    conflictError.isConflict = true;
    throw conflictError;
  }

  const deletedLocation = await Location.findByIdAndDelete(id);

  if (!deletedLocation) {
    const notFoundError = new Error('Lokasi tidak ditemukan untuk dihapus.');
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
}
