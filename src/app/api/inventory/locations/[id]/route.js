/**
 * @file Mendefinisikan endpoint API untuk operasi pada satu lokasi spesifik (/api/locations/[id]).
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth"; // Pastikan path ini benar
import { authorizeRole } from "@/lib/services/roleValidation"; // Ganti nama validateAdmin menjadi authorizeRole untuk konsistensi

import {
  getLocationById,
  updateLocationById,
  deleteLocationById,
} from "@/lib/services/locationServices"; // Gunakan alias
import connectToDatabase from "@/database/database"; // Pastikan path ini benar

// --- GET (Mengambil detail satu lokasi) ---
export async function GET(request, { params }) {
  // PERBAIKAN 1: Hapus 'await'
  const { id } = await params;

  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    authorizeRole(session); // Cukup cek sesi, tidak perlu admin untuk GET

    const location = await getLocationById(id);
    return NextResponse.json({ success: true, data: location });
  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }
    // Tangkap error otorisasi
    if (error.status) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }
    console.error(`Error in GET /api/locations/${id}:`, error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// --- PUT (Memperbarui satu lokasi) ---
export async function PUT(request, { params }) {
  const { id } = await params;

  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const validationResponse = authorizeRole(session);
    if (!validationResponse.success) {
      return NextResponse.json(
        { message: validationResponse.messages },
        { status: validationResponse.status }
      );
    }

    const data = await request.json();
    const updatedLocation = await updateLocationById(id, data);
    return NextResponse.json({ success: true, data: updatedLocation });
  } catch (error) {
    // Semua penanganan error sekarang terpusat di sini
    if (error.isNotFound) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }
    if (error.isValidationError) {
      return NextResponse.json(
        { success: false, message: "Input tidak valid", errors: error.errors },
        { status: 400 }
      );
    }
    if (error.isDuplicate) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    if (error.status) {
      // Untuk error dari authorizeRole
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }
    console.error(`Error in PUT /api/locations/${id}:`, error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

// --- DELETE (Menghapus satu lokasi) ---
export async function DELETE(request, { params }) {
  const { id } = await params;

  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const validationResponse = authorizeRole(session);
    if (!validationResponse.success) {
      return NextResponse.json(
        { message: validationResponse.messages },
        { status: validationResponse.status }
      );
    }

    await deleteLocationById(id);
    return NextResponse.json({
      success: true,
      message: "Lokasi berhasil dihapus.",
    });
  } catch (error) {
    if (error.isNotFound) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 404 }
      );
    }
    if (error.isConflict) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }
    if (error.status) {
      // Untuk error dari authorizeRole
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }
    console.error(`Error in DELETE /api/locations/${id}:`, error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
