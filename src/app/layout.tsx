import { AuthProvider } from "@/app/components/authentication";
import Navbar from "@/app/components/navbar";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "First LEGO League",
  description: "Frontend for the First LEGO League platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{
          __html: `
            const theme = localStorage.getItem('theme');
            if (theme === 'dark') document.documentElement.classList.add('dark');
          `}} />
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
