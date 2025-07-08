/**
 * @file Layanan terpusat untuk mengelola semua logika bisnis terkait Aset.
 */

import mongoose, { Types } from "mongoose";
import { z } from "zod";
import Asset from "@/models/Asset";
import { generateSerialNumber } from "@/lib/services/generateSerialNumber";
import Product from "@/models/Product";

// Skema untuk form pendaftaran BANYAK aset
const assetBulkSchema = z.object({
  product: z.string().min(1, "Produk harus dipilih."),
  location: z.string().min(1, "Lokasi harus dipilih."),
  purchased_year: z.string().optional(),
  quantity: z.number().int().min(1, "Jumlah harus minimal 1."),
  estimated_price: z.number().min(0, "Harga harus angka positif.").optional(),
  condition: z.enum(["Baik", "Rusak", "Kurang Baik"]).default("Baik"),
  attributes: z.record(z.any()).optional(),
});

// Skema untuk memperbarui aset. Hanya field yang boleh diubah.
const assetUpdateSchema = z.object({
  condition: z.enum(["Baik", "Rusak", "Kurang Baik"]).optional(),
  purchase_date: z.coerce.date().optional(),
  estimated_price: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z.number().min(0).optional()
  ),
  attributes: z.record(z.any()).optional(),
});

/**
 * BE Service: Mengambil daftar aset individual dengan paginasi, filter, dan sorting.
 * Menggunakan Aggregation Pipeline untuk memungkinkan pencarian pada data ter-populate.
 * @param {object} options - Opsi query
 * @returns {Promise<object>} - Hasil yang siap dikirim ke API Route.
 */
export async function getPaginatedAssets({
  page = 1,
  limit = 10,
  sortBy = "createdAt",
  order = "desc",
  filters = {},
}) {
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  const sortOptions = { [sortBy]: order === "desc" ? -1 : 1 };

  // --- Mulai Aggregation Pipeline ---
  const pipeline = [];

  // --- Tahap 1: Populasi Data (Menggunakan $lookup) ---
  // Menggabungkan data dari koleksi lain
  pipeline.push(
    {
      $lookup: {
        from: "products",
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "locations",
        localField: "location",
        foreignField: "_id",
        as: "location",
      },
    },
    { $unwind: { path: "$location", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "brands",
        localField: "product.brand",
        foreignField: "_id",
        as: "product.brand",
      },
    },
    { $unwind: { path: "$product.brand", preserveNullAndEmptyArrays: true } }
  );

  // --- Tahap 2: Logika Filter Dinamis (Menggunakan $match) ---
  const matchConditions = [];
  const { q, ...columnFilters } = filters;

  // --- BAGIAN A: Filter pencarian cepat ('q') untuk PENCARIAN GLOBAL ---
  if (q) {
    matchConditions.push({
      $or: [
        { serialNumber: { $regex: q, $options: "i" } },
        { "product.name": { $regex: q, $options: "i" } },
        { "location.name": { $regex: q, $options: "i" } },
        { "product.brand.name": { $regex: q, $options: "i" } },
        { condition: { $regex: q, $options: "i" } },
        { status: { $regex: q, $options: "i" } },
      ],
    });
  }

  // --- BAGIAN B: Filter untuk PENCARIAN PER KOLOM SPESIFIK ---
  for (const key in columnFilters) {
    if (columnFilters[key]) {
      const filterValue = columnFilters[key];
      let fieldPath = key;

      // Petakan 'key' dari URL ke field path yang benar di dalam agregasi
      switch (key) {
        case "product":
          fieldPath = "product.name";
          break;
        case "location":
          fieldPath = "location.name";
          break;
        case "brand":
          fieldPath = "product.brand.name";
          break;
        // untuk key lain seperti 'status', 'condition', 'serialNumber', fieldPath sudah benar
      }

      matchConditions.push({
        [fieldPath]: { $regex: filterValue, $options: "i" },
      });
    }
  }

  // Jika ada kondisi filter, gabungkan dengan $and dan tambahkan tahap $match
  if (matchConditions.length > 0) {
    pipeline.push({ $match: { $and: matchConditions } });
  }

  // --- Tahap 3: Paginasi dan Penghitungan Total (Menggunakan $facet) ---
  pipeline.push({
    $facet: {
      data: [{ $sort: sortOptions }, { $skip: skip }, { $limit: limitNum }],
      metadata: [{ $count: "totalItems" }],
    },
  });

  // --- Eksekusi Pipeline ---
  const result = await Asset.aggregate(pipeline);

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

export async function createAssets(data) {
  const validation = assetBulkSchema.safeParse(data);
  if (!validation.success) {
    const validationError = new Error("Input tidak valid.");
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  const {
    quantity,
    product: productId,
    location: locationId,
    ...commonData
  } = validation.data;

  const selectedProduct = await Product.findById(productId).select('product_code').lean();
  if (!selectedProduct) {
    throw new Error(`Produk dengan ID ${productId} tidak ditemukan.`);
  }
  const targetProductCode = selectedProduct.product_code;

  // 2. Buat pipeline agregasi untuk menghitung aset
  const aggregationResult = await Asset.aggregate([
    // Tahap 1: Gabungkan (lookup) dengan koleksi 'products'
    {
      $lookup: {
        from: 'products',
        localField: 'product',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    // Tahap 2: Filter hasil gabungan
    {
      $match: {
        'location': new mongoose.Types.ObjectId(locationId),
        'productDetails.product_code': targetProductCode
      }
    },
    // Tahap 3: Hitung dokumen yang cocok
    {
      $count: 'total'
    }
  ]);

  // Hasil agregasi adalah array, misal: [{ total: 5 }]. Jika kosong, berarti 0.
  const assetCountInLocation = aggregationResult[0]?.total || 0;
  
  
  const assetsToCreate = [];

  // Persiapkan setiap dokumen aset baru dalam satu array
  for (let i = 0; i < quantity; i++) {
    const nextSequence = assetCountInLocation + i + 1;
    
    // Generate nomor seri unik untuk setiap aset
    const newSerialNumber = await generateSerialNumber(productId, locationId, nextSequence);

    assetsToCreate.push({
      ...commonData,
      product: productId,
      location: locationId,
      serial_number: newSerialNumber,
    });
  }

  try {
    // Masukkan semua aset baru ke database dalam satu operasi
    const createdAssets = await Asset.insertMany(assetsToCreate, { ordered: true });
    return createdAssets;
  } catch (error) {
    if (error.code === 11000) {
      // Error ini terjadi jika ada duplikasi nomor seri
      const duplicateError = new Error(`Gagal membuat aset. Nomor Seri yang digenerate sudah ada.`);
      duplicateError.isDuplicate = true;
      throw duplicateError;
    }
    throw error;
  }
}

export async function getAssetById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const notFoundError = new Error("ID Aset tidak valid.");
    notFoundError.isNotFound = true;
    throw notFoundError;
  }

  const asset = await Asset.findById(id)
    .populate({
      path: "product",
      select: "name brand",
      populate: { path: "brand", select: "name" },
    })
    .populate({ path: "location", select: "name floor building" })
    .lean();

  if (!asset) {
    const notFoundError = new Error("Aset tidak ditemukan.");
    notFoundError.isNotFound = true;
    throw notFoundError;
  }

  return asset;
}

/**
 * BE Service: Memperbarui satu aset berdasarkan ID.
 */
export async function updateAssetById(id, data) {
  // Validasi data yang masuk menggunakan Zod
  const validation = assetSchema.partial().safeParse(data);
  if (!validation.success) {
    const validationError = new Error("Input tidak valid.");
    validationError.isValidationError = true;
    validationError.errors = validation.error.flatten().fieldErrors;
    throw validationError;
  }

  const updatedAsset = await Asset.findByIdAndUpdate(id, validation.data, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updatedAsset) {
    const notFoundError = new Error("Aset tidak ditemukan untuk diperbarui.");
    notFoundError.isNotFound = true;
    throw notFoundError;
  }

  return updatedAsset;
}

/**
 * BE Service: Menghapus satu aset berdasarkan ID.
 */
export async function deleteAssetById(id) {
  const deletedAsset = await Asset.findByIdAndDelete(id);

  if (!deletedAsset) {
    const notFoundError = new Error("Aset tidak ditemukan untuk dihapus.");
    notFoundError.isNotFound = true;
    throw notFoundError;
  }

  // Tidak ada yang perlu dikembalikan jika sukses
}
