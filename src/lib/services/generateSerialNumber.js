// Lokasi: /lib/api/generateSerialNumber.js

import Product from '@/models/Product';
import Location from '@/models/Location'; // Impor model Location

/**
 * Membuat serial number yang unik PER LOKASI dan berurutan.
 * Format: 'G{gedung}/L{lantai}/R{ruang}/{kode_produk}{urutan_3_digit}'
 * Contoh: "GA/L3/R12/KUR001"
 * @param {string} productId - ID dari produk yang akan dibuatkan asetnya.
 * @param {string} locationId - ID dari lokasi tempat aset akan ditempatkan.
 * @returns {Promise<string>} - String serial number yang dihasilkan.
 * @throws {Error} - Melemparkan error jika produk atau lokasi tidak ditemukan.
 */
export async function generateSerialNumber(productId, locationId, sequence) {
    // Ambil data yang diperlukan dari DB dalam satu panggilan Promise.all untuk efisiensi
    const [product, location] = await Promise.all([
        Product.findById(productId).select('product_code').lean(),
        Location.findById(locationId).select('building floor name').lean()
    ]);

    // Validasi ketat untuk memastikan data ada
    if (!product || !product.product_code) {
      throw new Error(`Produk dengan ID ${productId} tidak ditemukan atau tidak memiliki product_code.`);
    }
    if (!location) {
      throw new Error(`Lokasi dengan ID ${locationId} tidak ditemukan.`);
    }

    // Ekstrak hanya angka dari nama ruangan untuk konsistensi.
    // Contoh: "101 (Kelas A)" -> "101"
    const roomNameMatch = location.name.match(/^\d+/);
    const roomNumber = roomNameMatch ? roomNameMatch[0] : 'NA'; // 'NA' jika tidak ada angka di depan

    // Format urutan dengan padding nol di depan (e.g., 1 -> 001, 12 -> 012)
    const paddedSequence = String(sequence).padStart(3, '0');

    // Gabungkan semua bagian menjadi format akhir
    return `G${location.building}/L${location.floor}/R${roomNumber}/${product.product_code}-${paddedSequence}`;
}