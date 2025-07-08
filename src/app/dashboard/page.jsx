"use client";
import { useRouter } from "next/navigation";

import { Stack } from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import SummaryCard from "@/components/dashboard/SummaryCard";
import CustomToolbar from "@/components/dashboard/CustomToolbar";
import theme from "@/theme/theme";

const columns = [
  { field: "id", headerName: "ID", width: 90 },
  {
    field: "firstName",
    headerName: "First name",
    width: 150,
    editable: true,
  },
  {
    field: "lastName",
    headerName: "Last name",
    width: 150,
    editable: true,
  },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    width: 110,
    editable: true,
  },
  {
    field: "fullName",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 160,
    valueGetter: (value, row) => `${row.firstName || ""} ${row.lastName || ""}`,
  },
];

const rows = [
  { id: 1, lastName: "Snow", firstName: "Jon", age: 14 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 31 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 31 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 11 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
  { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
  { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
];

export default function DashboarPage() {
  const router = useRouter();

  return (
    <Stack direction="column" spacing={6}>
      <Stack direction="row" spacing={4}>
        <SummaryCard
          title="Total Inventaris Tetap"
          value="0"
          unit="Aset"
          onClick={() => router.push("/inventaris/aset")}
        />
        <SummaryCard
          title="Total Stok Habis Pakai"
          value="0"
          unit="Item"
          onClick={() => router.push("/inventaris-habis-pakai/stok")}
        />
        <SummaryCard
          title="Total Stok Habis Pakai"
          value="0"
          unit="Item"
          onClick={() => router.push("/inventaris-habis-pakai/stok")}
        />
      </Stack>
      <DataGrid
        rows={rows}
        columns={columns}
        // loading={loading}
        slots={{ toolbar: CustomToolbar }}
        showToolbar
        slotProps={{
          loadingOverlay: {
            variant: "skeleton",
            noRowsVariant: "skeleton",
          },
          toolbar: {
            title: "Stok Barang Menipis",
          },
          columnHeaders: {
            title: {},
          },
        }}
        sx={{
          backgroundColor: theme.palette.background.paper,
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 600,
          },
        }}
      />
      <DataGrid
        rows={rows}
        columns={columns}
        // loading={loading}
        slots={{ toolbar: CustomToolbar }}
        showToolbar
        slotProps={{
          loadingOverlay: {
            variant: "skeleton",
            noRowsVariant: "skeleton",
          },
          toolbar: {
            title: "Riwayat Barang Masuk dan Keluar",
          },
          columnHeaders: {
            title: {},
          },
        }}
        sx={{
          backgroundColor: theme.palette.background.paper,
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 600,
          },
        }}
      />
    </Stack>
  );
}
