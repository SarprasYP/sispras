/**
 * @file Mendefinisikan endpoint API untuk resource barang (/api/products).
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { authorizeRole } from "@/lib/services/roleValidation";

// Impor fungsi-fungsi dari service layer yang baru
import {
  getPaginatedProducts,
  getAllProductsForDropdown,
  createProduct,
} from "@/lib/services/productServices";
import connectToDatabase from "@/database/database";

export async function GET(request) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    authorizeRole(session); // Cukup cek apakah ada sesi yang valid

    const { searchParams } = new URL(request.url);

    if (searchParams.get("all") === "true") {
      const allLocations = await getAllProductsForDropdown();
      return NextResponse.json({ success: true, data: allLocations });
    } else {
      const filters = {
        name: searchParams.get("name"),
        product_code: searchParams.get("product_code"),
        brand: searchParams.get("brand"),
        measurement_unit: searchParams.get("measurement_unit"),
        q: searchParams.get("q"), // Tambahkan untuk quick search
      };

      const result = await getPaginatedProducts({
        page: searchParams.get("page"),
        limit: searchParams.get("limit"),
        filters,
      });

      return NextResponse.json({ success: true, ...result });
    }
  } catch (error) {
    // Tangkap error dari authorizeRole atau service
    const status = error.status || 500;
    const message = error.message || "Terjadi kesalahan pada server.";
    return NextResponse.json({ success: false, message }, { status });
  }
}

/**
 * Menangani permintaan POST untuk membuat lokasi baru.
 */
export async function POST(request) {
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
    const newProduct = await createProduct(data);

    return NextResponse.json(
      { success: true, data: newProduct },
      { status: 201 }
    );
  } catch (error) {
    if (error.isValidationError) {
      return NextResponse.json(
        { success: false, message: error.message, errors: error.errors },
        { status: 400 }
      );
    }
    if (error.isDuplicate) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }

    console.error("Error in POST /api/products:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
