import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tech Fiesta 2.0 - The Odyssey | Chennai Institute of Technology",
  description:
    "Tech Fiesta 2.0: The Odyssey — the flagship annual technical festival of the Asymmetric Club at CIT. Register for events and workshops.",
  icons: {
    icon: "/secret_brackets.jpg",
    shortcut: "/secret_brackets.jpg",
    apple: "/secret_brackets.jpg",
  },
  openGraph: {
    title: "Tech Fiesta 2.0 - The Odyssey",
    description: "Flagship annual technical festival of Club Asymmetric, CIT Chennai.",
    images: ["/odyssey_poster.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prefetch key images for faster LCP */}
        <link rel="prefetch" href="/odyssey_poster.png" as="image" />
        <link rel="prefetch" href="/tech_fiesta_odyssey.png" as="image" />
        {/* Prefetch the vintage map background (used immediately on paint) */}
        <link rel="preload" href="/vintage_map.png" as="image" />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "#fff",
              border: "1px solid #374151",
            },
          }}
        />
      </body>
    </html>
  );
}
