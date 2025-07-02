'use client';
import { createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

const inter = Inter({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Tema ini dirancang agar terlihat bersih dan profesional di dalam lingkungan Toolpad.
// AppBar dan Sidebar dibuat menyatu untuk memberikan fokus pada konten halaman.
const theme = createTheme({
  cssVarPrefix: 'toolpad',
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#7E136D', // Ungu gelap utama
          light: '#A94E9D', // Versi lebih terang dari ungu
          dark: '#540C4A', // Versi lebih gelap dari ungu
          contrastText: '#fff',
        },
        secondary: {
          main: '#FECE1F', // Kuning utama
          light: '#FFDA52',
          dark: '#E5B91C',
          contrastText: '#1E1E1E',
        },
        error: { main: '#FF1744' },
        success: { main: '#00C853' },
        info: { main: '#2979FF' },
        warning: { main: '#FF9100' },
        text: {
          primary: '#1E1E1E',
          secondary: '#616161',
        },
        background: {
          default: '#F5F5F7', // Latar belakang utama halaman, sedikit abu-abu
          paper: '#FFFFFF', // Latar belakang untuk AppBar, Sidebar, dan Card
        },
        divider: 'rgba(0, 0, 0, 0.12)',
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 600,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: inter.style.fontFamily,
    h4: {
      fontWeight: 700,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    // Override untuk AppBar agar terlihat menyatu dengan layout Toolpad
    MuiAppBar: {
      styleOverrides: {
        root: {
            backgroundColor: '#7E136D', // Latar belakang ungu (primary.main)
            '& .MuiButtonBase-root': { // Mengubah warna ikon menjadi putih juga
              color: '#F8F8F8',
            },
            '& .MuiTypography-root': { // Mengubah warna teks menjadi putih
              color: '#F8F8F8',
            },
        }
      },
    },
  },
});

export default theme;
