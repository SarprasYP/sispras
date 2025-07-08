"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// --- PERBAIKAN: Import Snackbar, Alert, dan CircularProgress dari MUI ---
import { Box, CircularProgress, Snackbar, Alert } from "@mui/material";
import FormComponent from "@/components/dashboard/FormComponent";

// Service untuk mengambil dan memperbarui data
import { getProductById, updateProduct } from "@/services/productServices";
import { useDropdownData } from "@/lib/hooks/useDropdownData";
import { getAllBrandsForDropdown } from "@/services/brandServices";

/**
 * Halaman untuk mengedit data lokasi berdasarkan ID.
 */
export default function EditBrandPage() {
  const router = useRouter();
  const params = useParams();
  const { options: brandOptions, loading: isLoading } = useDropdownData(
    getAllBrandsForDropdown
  );

  const productId = params.id;

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({
    product_code: "",
    name: "",
    brand: "",
    measurement_unit: "",
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // --- BARU: STATE UNTUK SNACKBAR ---
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // --- MENGAMBIL DATA AWAL ---
  useEffect(() => {
    if (!productId) return;

    const fethProductData = async () => {
      setIsLoadingData(true);
      try {
        const response = await getProductById(productId);
        setFormData({
          product_code: response.data.product_code,
          name: response.data.name,
          brand: response.data.brand?._id,
          measurement_unit: response.data.measurement_unit,
        });
      } catch (error) {
        // --- DIUBAH: Gunakan setSnackbar untuk error ---
        setSnackbar({
          open: true,
          message: "Gagal memuat data produk. Mungkin tidak ditemukan.",
          severity: "error",
        });
        router.push("/dashboard/inventaris-tetap/produk");
      } finally {
        setIsLoadingData(false);
      }
    };

    fethProductData();
  }, [productId, router]);

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
      await updateProduct(productId, formData);

      // --- DIUBAH: Gunakan setSnackbar untuk sukses ---
      setSnackbar({
        open: true,
        message: "Produk berhasil diperbarui!",
        severity: "success",
      });

      setTimeout(() => {
        router.push("/dashboard/inventaris-tetap/produk");
      }, 1500);
    } catch (err) {
      const errorMessage = err.message || "Gagal memperbarui data.";

      // --- DIUBAH: Gunakan setSnackbar untuk error ---
      setSnackbar({ open: true, message: errorMessage, severity: "error" });

      if (err.errors) {
        setFieldErrors(err.errors);
      } else {
        setSubmitError(errorMessage);
      }
      setIsSubmitting(false);
    }
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

  // Tampilkan loading spinner saat data awal sedang diambil
  if (isLoadingData) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <FormComponent
        title="Edit Produk"
        formConfig={formConfig}
        formData={formData}
        fieldErrors={fieldErrors}
        submitError={submitError}
        onFormChange={handleFormChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        submitButtonText="Simpan Perubahan"
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
