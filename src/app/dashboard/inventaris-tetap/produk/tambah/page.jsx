"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

// --- PERBAIKAN: Import Snackbar dan Alert dari MUI ---
import { Snackbar, Alert } from "@mui/material";

// Komponen
import FormComponent from "@/components/dashboard/FormComponent";

// Service
import { getAllBrandsForDropdown } from "@/services/brandServices";
import { useDropdownData } from "@/lib/hooks/useDropdownData";
import { createProduct } from "@/services/productServices";

/**
 * Halaman untuk menambahkan data lokasi baru.
 */
export default function TambahProdukPage() {
  const router = useRouter();
  const { options: brandOptions, loading: isLoading } = useDropdownData(getAllBrandsForDropdown);

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    product_code: "",
    name: "",
    brand: "",
    measurement_unit: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // --- BARU: STATE UNTUK SNACKBAR ---
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // --- KONFIGURASI FORM ---
  const formConfig = [
    {
      name: "product_code",
      label: "Kode Produk",
      type: "text",
      required: true,
    },
    { name: "name", label: "Nama Produk", type: "text", required: true },
    {
      name: "brand",
      label: "Merk",
      type: "autocomplete",
      options: brandOptions,
      loading: isLoading,
      required: true,
    },
    {
      name: "measurement_unit",
      label: "Satuan Pengukuran",
      type: "select",
      options: [
        { value: "Pcs", label: "Pcs" },
        { value: "Meter", label: "Meter" },
        { value: "Susun", label: "Susun" },
        { value: "Set", label: "Set" },
      ],
      required: true,
    },
  ];

  const handleFormChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // --- HANDLER UNTUK SUBMIT FORM ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setFieldErrors({});

    try {
      await createProduct(formData);

      // --- DIUBAH: Gunakan setSnackbar, bukan toast ---
      setSnackbar({
        open: true,
        message: "Produk baru berhasil ditambahkan!",
        severity: "success",
      });

      // Redirect setelah jeda singkat agar snackbar sempat terlihat
      setTimeout(() => {
        router.push("/dashboard/inventaris-tetap/produk");
      }, 1500);
    } catch (err) {
      const errorMessage =
        err.message || "Terjadi kesalahan yang tidak diketahui.";

      // --- DIUBAH: Gunakan setSnackbar, bukan toast ---
      setSnackbar({ open: true, message: errorMessage, severity: "error" });

      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        setSubmitError(errorMessage);
      }
      setIsSubmitting(false); // Hentikan submit hanya jika ada error
    }
    // `finally` dihapus agar loading tidak berhenti sebelum redirect
  };

  const handleCancel = () => {
    router.back();
  };

  // --- BARU: HANDLER UNTUK MENUTUP SNACKBAR ---
  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    // Gunakan React.Fragment (<>...</>) untuk membungkus beberapa komponen
    <>
      <FormComponent
        title="Tambah Produk Baru"
        formConfig={formConfig}
        formData={formData}
        fieldErrors={fieldErrors}
        submitError={submitError}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />

      {/* --- BARU: KOMPONEN SNACKBAR --- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
