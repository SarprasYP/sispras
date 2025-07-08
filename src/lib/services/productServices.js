/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Produk.
 */

import { z } from "zod";
import mongoose, { Types } from "mongoose";
import Product from "@/models/Product";
import Brand from "@/models/Brand";
import Asset from "@/models/Asset"; // Diperlukan untuk validasi penghapusan

// Skema Zod untuk validasi (tidak ada perubahan)
const productSchema = z.object({
  product_code: z
    .string({ required_error: "Kode produk wajib diisi." })
    .trim()
    .min(1, { message: "Kode produk tidak boleh kosong." }),
  name: z
    .string({ required_error: "Nama produk wajib diisi." })
    .trim()
    .min(1, { message: "Nama produk tidak boleh kosong." }),
  brand: z
    .string({ required_error: "Brand wajib diisi." })
    .refine((val) => Types.ObjectId.isValid(val), {
      message: "ID Brand tidak valid.",
    }),
  measurement_unit: z.enum(["Pcs", "Meter", "Susun", "Set"], {
    required_error: "Satuan pengukuran wajib diisi.",
  }),
});

// ===================================================================================
//  OPERASI PADA KOLEKSI (Banyak Produk)
// ===================================================================================
/**
 * BE Service: Mengambil produk dengan paginasi, filter, dan sorting.
 * Versi final dengan logika filter gabungan untuk pencarian global (q) dan per kolom.
 * @param {object} options - Opsi query
 * @returns {Promise<object>} - Hasil yang siap dikirim ke API Route.
 */
export async function getPaginatedProducts({
  page = 1,
  limit = 10,
  sortBy = "name",
  order = "asc",
  filters = {},
}) {
  // Pastikan page dan limit adalah angka untuk operasi matematis
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  const sortOptions = { [sortBy]: order === "desc" ? -1 : 1 };

  // --- Mulai Aggregation Pipeline ---
  const pipeline = [];

  // --- Tahap 1: Populasi Data Brand (Menggunakan $lookup) ---
  pipeline.push(
    {
      $lookup: {
        from: "brands", // Nama koleksi brand di database
        localField: "brand",
        foreignField: "_id",
        as: "brand",
      },
    },
    {
      $unwind: {
        path: "$brand",
        preserveNullAndEmptyArrays: true, // Jaga produk meski tidak punya brand
      },
    }
  );

  // --- Tahap 2: Logika Filter Dinamis (Menggunakan $match) ---
  const matchConditions = [];
  const { q, ...columnFilters } = filters;

  // --- BAGIAN A: Filter pencarian cepat ('q') untuk PENCARIAN GLOBAL ---
  if (q) {
    matchConditions.push({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { product_code: { $regex: q, $options: "i" } },
        { "brand.name": { $regex: q, $options: "i" } },
        { measurement_unit: { $regex: q, $options: "i" } },
      ],
    });
  }

  // --- BAGIAN B: Filter untuk PENCARIAN PER KOLOM SPESIFIK ---
  // Loop ini akan memproses filter seperti ?brand=panaso atau ?measurement_unit=pcs
  for (const key in columnFilters) {
    if (columnFilters[key]) {
      const filterValue = columnFilters[key];
      // Petakan 'key' dari URL ke field yang benar di database setelah di-lookup.
      // Jika key adalah 'brand', cari di 'brand.name'. Jika tidak, gunakan key itu sendiri.
      const fieldPath = key === 'brand' ? 'brand.name' : key;
      
      matchConditions.push({ [fieldPath]: { $regex: filterValue, $options: "i" } });
    }
  }

  // Jika ada kondisi filter (baik dari 'q' maupun 'columnFilters'), 
  // gabungkan semuanya dengan $and dan tambahkan tahap $match ke pipeline.
  if (matchConditions.length > 0) {
    pipeline.push({ $match: { $and: matchConditions } });
  }

  // --- Tahap 3: Paginasi dan Penghitungan Total (Menggunakan $facet) ---
  pipeline.push({
    $facet: {
      data: [
        { $sort: sortOptions },
        { $skip: skip },
        { $limit: limitNum },
      ],
      metadata: [{ $count: "totalItems" }],
    },
  });

  // --- Eksekusi Pipeline ---
  const result = await Product.aggregate(pipeline);

  const data = result[0]?.data || [];
  const totalItems = result[0]?.metadata[0]?.totalItems || 0;

  // --- Struktur Respons Akhir ---
  return {
    data,
    pagination: {
      totalItems,
      currentPage: pageNum,
      totalPages: Math.ceil(totalItems / limitNum),
      limit: limitNum,
    },
  };
}


// ===================================================================================
//  FUNGSI LAINNYA (TIDAK ADA PERUBAHAN)
// ===================================================================================

export async function getAllProductsForDropdown() {
  const products = await Product.find({})
    .select('name brand measurement_unit')
    .populate({
      path: 'brand',
      select: 'name'
    })
    .sort({ name: 1 })
    .lean();
    
  return products;
}

export async function createProduct(data) {
  const validation = productSchema.safeParse(data);
  if (!validation.success) {
    const validationError = new Error("Input tidak valid.");
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }
  try {
    const newProduct = await Product.create(validation.data);
    return newProduct;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error("Produk sudah ada.");
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

export async function getProductById(id) {
  const product = await Product.findById(id)
    .populate({ path: "brand", model: Brand, select: "name" })
    .lean();

  if (!product) {
    const notFoundError = new Error("Produk tidak ditemukan.");
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
  return product;
}

export async function updateProductById(id, data) {
  const validation = productSchema.partial().safeParse(data);
  if (!validation.success) {
    const validationError = new Error("Input tidak valid.");
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      validation.data,
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!updatedProduct) {
      const notFoundError = new Error(
        "Produk tidak ditemukan untuk diperbarui."
      );
      notFoundError.isNotFound = true;
      throw notFoundError;
    }
    return updatedProduct;
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error("Produk sudah ada.");
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

export async function deleteProductById(id) {
  const assetCount = await Asset.countDocuments({ product: id });
  if (assetCount > 0) {
    const conflictError = new Error(`Produk tidak dapat dihapus karena masih terhubung dengan ${assetCount} aset.`);
    conflictError.isConflict = true;
    throw conflictError;
  }

  const deletedProduct = await Product.findByIdAndDelete(id);

  if (!deletedProduct) {
    const notFoundError = new Error("Produk tidak ditemukan untuk dihapus.");
    notFoundError.isNotFound = true;
    throw notFoundError;
  }
}
