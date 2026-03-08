import "@/styles/globals.css";
import { ReactNode } from "react";
import LayoutClientWrapper from "@/components/LayoutClientWrapper";

export const metadata = {
  title: "skinova",
  description: "Starter Next.js + TypeScript + Tailwind project",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <LayoutClientWrapper>{children}</LayoutClientWrapper>
      </body>
    </html>
  );
}
