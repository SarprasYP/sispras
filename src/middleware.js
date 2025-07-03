export { default } from "next-auth/middleware";

// Konfigurasi ini menentukan halaman mana yang akan dilindungi oleh middleware.
export const config = {
  matcher: [
    '/api/sispras/:path*',
    '/dashboard/:path*',
  ],
};