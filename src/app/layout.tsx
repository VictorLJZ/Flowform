import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";
import { StoreHydrator } from "@/components/store-hydrator";

export const metadata: Metadata = {
  title: "FlowForm",
  description: "A form builder application with AI-powered features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fontVariables} antialiased`}
      >
        <StoreHydrator />
        {children}
      </body>
    </html>
  );
}
