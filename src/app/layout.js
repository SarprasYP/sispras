import Provider from "@/provider/Provider";
import { Suspense } from "react";

export const metadata = {
  title: "Sispras",
  description: "Sistem Informasi Pengelolaan Barang Inventaris SMA YP Unila",
  icons: {
    icon: "/Logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <Provider>{children}</Provider>
        </Suspense>
        
      </body>
    </html>
  );
}
