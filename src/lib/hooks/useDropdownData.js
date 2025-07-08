// Lokasi: /lib/hooks/useDropdownData.js

import { useState, useEffect } from 'react';

/**
 * Custom Hook untuk mengambil dan memformat data untuk komponen dropdown.
 * @param {Function} fetchFunction - Fungsi service yang akan dipanggil.
 * @param {Function} [formatter] - (Opsional) Fungsi untuk memformat setiap item data.
 * @returns {{options: Array, loading: boolean, error: object|null}}
 */
export function useDropdownData(fetchFunction, formatter) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchFunction();
        const data = response.data || [];

        // --- PERUBAHAN KUNCI DI SINI ---
        // Jika ada fungsi formatter, gunakan itu. Jika tidak, gunakan format default.
        const formattedOptions = formatter 
          ? data.map(formatter) 
          : data.map((item) => ({
              value: item._id,
              label: item.name,
              // Sertakan seluruh item asli untuk data tambahan jika perlu
              ...item 
            }));

        setOptions(formattedOptions);
      } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFunction, formatter]); // Tambahkan formatter sebagai dependency

  return { options, loading, error };
}
