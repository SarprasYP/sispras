import Image from "next/image";

import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import DoorBackIcon from '@mui/icons-material/DoorBack';
import ViewStreamIcon from '@mui/icons-material/ViewStream';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';


export const NAVIGATION = [
  {
    kind: "header",
    title: "Beranda",
  },
  {
    segment: "dashboard",
    title: "Beranda",
    icon: <DashboardIcon />,
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Inventaris Tetap",
  },
  {
    segment: "inventaris-tetap",
    title: "Aset",
    icon: <InventoryIcon />,
  },
  {
    segment: "inventaris-tetap/barang",
    title: "Barang",
    icon: <ViewStreamIcon />,
  },
  {
    segment: "inventaris-tetap/ruangan",
    title: "Ruangan",
    icon: <DoorBackIcon />,
  },
  {
    segment: "inventaris-tetap/merk",
    title: "Merk",
    icon: <TurnedInIcon />,
  },
  {
    kind: "divider",
  },
  {
    kind: "header",
    title: "Inventaris Sementara",
  },
  {
    segment: "inventaris-sementara",
    title: "Stok",
    icon: <InventoryIcon />,
  },
  {
    segment: "inventaris-sementara/barang-masuk",
    title: "Barang Masuk",
    icon: <FileDownloadIcon />,
  },
  {
    segment: "inventaris-sementara/barang-keluar",
    title: "Barang Keluar",
    icon: <FileUploadIcon />,
  },
];

export const BRAND = {
  logo: <Image src="/Logo.svg" alt="Sispras Logo" width={36} height={36} />,
  title: "Sispras",
  homeUrl: "/",
};
