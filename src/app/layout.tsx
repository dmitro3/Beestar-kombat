import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import LoadingScreenProvider from "@/providers/LoadingScreenProvider";
import BottomMenus from "@/components/layouts/BottomMenus";
 import { ToastContainer } from 'react-toastify'
import "react-toastify/ReactToastify.css"
import AuthProviderWithSuspense from "@/providers/AuthProvider";

const montserrat = Montserrat({ subsets: ["latin"], variable: '--montserat' });

export const metadata: Metadata = {
  title: "Beestar - Telegram Kombat",
  description: "Beestar - Telegram Kombat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} min-h-screen  h-screen bg-[#1d2025] `}>
      <AuthProviderWithSuspense>
          <LoadingScreenProvider>
            <main className="pb-[80px] min-h-screen backdrop-blur-[3px]  text-white/80">
              {children}
            </main>
            <BottomMenus />
          </LoadingScreenProvider>
      </AuthProviderWithSuspense>
        <ToastContainer />
      </body>
    </html>
  );
}
