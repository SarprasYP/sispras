import Provider from "@/provider/Provider";

export const metadata = {
  title: "Sispras",
  description: "Sistem Informasi Pengelolaan Barang Inventaris SMA YP Unila",
  icons: {
    icon: "/Logo.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
