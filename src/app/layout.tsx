import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { DealershipProvider } from "@/context/DealershipContext";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Vehisoft Dealership Management System | KSh.",
  description:
    "Manage your vehicles, customers, and sales from enquiry to completed sale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <DealershipProvider>
            <AppShell>{children}</AppShell>
          </DealershipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
