"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

// --- PERBAIKAN: Import Snackbar, Alert, dan CircularProgress dari MUI ---
import { Box, CircularProgress, Snackbar, Alert } from "@mui/material";
import FormComponent from "@/components/dashboard/FormComponent";

// Service untuk mengambil dan memperbarui data
import { getLocationById, updateLocation } from "@/services/locationServices";

/**
 * Halaman untuk mengedit data lokasi berdasarkan ID.
 */
export default function EditLocationPage() {
  const router = useRouter();
  const params = useParams();
  const locationId = params.id;

  // --- STATE MANAGEMENT ---
  const [formData, setFormData] = useState({ name: "", building: "", floor: "", description: "" });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  
  // --- BARU: STATE UNTUK SNACKBAR ---
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // --- MENGAMBIL DATA AWAL ---
  useEffect(() => {
    if (!locationId) return;

    const fetchLocationData = async () => {
      setIsLoadingData(true);
      try {
        const response = await getLocationById(locationId);
        setFormData({
          name: response.data.name,
          building: response.data.building,
          floor: response.data.floor,
          description: response.data.description || "",
        });
      } catch (error) {
        // --- DIUBAH: Gunakan setSnackbar untuk error ---
        setSnackbar({ open: true, message: "Gagal memuat data lokasi. Mungkin tidak ditemukan.", severity: 'error' });
        router.push("/dashboard/inventaris-tetap/ruangan");
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchLocationData();
  }, [locationId, router]);

  // --- KONFIGURASI FORM ---
  const formConfig = [
    { name: "name", label: "Nama Ruang", type: "text", required: true },
    { name: "building", label: "Gedung", type: "text", required: true, halfWidth: true },
    { name: "floor", label: "Lantai", type: "text", required: true, halfWidth: true },
    { name: "description", label: "Deskripsi (Opsional)", type: "textarea", rows: 4 },
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
      await updateLocation(locationId, formData);
      
      // --- DIUBAH: Gunakan setSnackbar untuk sukses ---
      setSnackbar({ open: true, message: 'Lokasi berhasil diperbarui!', severity: 'success' });
      
      setTimeout(() => {
        router.push("/dashboard/inventaris-tetap/ruangan");
      }, 1500);

    } catch (err) {
      const errorMessage = err.message || "Gagal memperbarui data.";
      
      // --- DIUBAH: Gunakan setSnackbar untuk error ---
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });

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
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Tampilkan loading spinner saat data awal sedang diambil
  if (isLoadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <FormComponent
        title="Edit Lokasi"
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}