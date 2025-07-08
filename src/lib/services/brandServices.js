/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Merk.
 */

import { z } from 'zod';
import Brand from '@/models/Brand';
import Product from '@/models/Product';

// --- Skema Validasi Zod ---
const brandSchema = z.object({
  name: z.string({ required_error: "Nama brand wajib diisi." }).trim().min(1, { message: 'Nama brand tidak boleh kosong.' }),
  description: z.string().trim().optional(),
});

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Merk)
// ===================================================================================
/**
 * BE Service: Mengambil merk dengan paginasi, filter, dan sorting.
 * @param {object} options - Opsi query
 * @returns {Promise<object>} - Hasil yang siap dikirim ke API Route.
 */
export async function getPaginatedBrands({
  page = 1,
  limit = 10,
  sortBy = 'name',
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
        { description: { $regex: q, $options: 'i' } },
      ],
    });
  }

  if (andConditions.length > 0) {
    query.$and = andConditions;
  }
  // --- Akhir Logika Filter ---


  const [data, totalItems] = await Promise.all([
    // Gunakan 'query' yang sudah dibangun, bukan 'filters'
    Brand.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
    Brand.countDocuments(query),
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

export async function getAllBrandsForDropdown() {
  const brands = await Brand.find({}).sort({ name: 1 }).lean();
  return brands;
}

/**
 * Membuat merk baru setelah validasi.
 * @param {object} data - Data untuk merk baru.
 * @returns {Promise<object>} Dokumen merk yang baru dibuat.
 */
export async function createBrand(data) {
  const validation = brandSchema.safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }
  try {
    const newBrand = await Brand.create(validation.data);
    return newBrand;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error('Nama merk sudah ada.');
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
 * Mengambil satu merk berdasarkan ID.
 * @param {string} id - ID dari merk.
 * @returns {Promise<object>} Dokumen merk yang ditemukan.
 */
export async function getBrandById(id) {
  const brand = await Brand.findById(id).lean();

  if (!brand) {
    const notFoundError = new Error('Merk tidak ditemukan.');
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
  return brand;
}

/**
 * Memperbarui satu merk berdasarkan ID.
 * @param {string} id - ID dari merk yang akan diperbarui.
 * @param {object} data - Data baru untuk merk.
 * @returns {Promise<object>} Dokumen merk yang sudah diperbarui.
 */
export async function updateBrandById(id, data) {
  const validation = brandSchema.partial().safeParse(data);
  if (!validation.success) {
    const validationError = new Error('Input tidak valid.');
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  try {
    const updatedBrand = await Brand.findByIdAndUpdate(id, validation.data, {
      new: true,
      runValidators: true
    }).lean();

    if (!updatedBrand) {
      const notFoundError = new Error('Merk tidak ditemukan untuk diperbarui.');
      notFoundError.isNotFound = true;
      throw notFoundError;
    }
    return updatedBrand;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error('Nama merk sudah ada.');
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

/**
 * Menghapus satu Merk berdasarkan ID.
 * @param {string} id - ID Merk yang akan dihapus.
 * @returns {Promise<void>}
 */
export async function deleteBrandById(id) {

  const productCount = await Product.countDocuments({ brand: id });
  if (productCount > 0) {
    const conflictError = new Error(`Merk tidak dapat dihapus karena masih digunakan oleh ${productCount} produk.`);
    conflictError.isConflict = true;
    throw conflictError;
  }

  const deletedBrand = await Brand.findByIdAndDelete(id);

  if (!deletedBrand) {
    const notFoundError = new Error('Merk tidak ditemukan untuk dihapus.');
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
}
