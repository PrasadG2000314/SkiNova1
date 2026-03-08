import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Skin Classifier - Teachable Machine",
    description: "AI-powered image classification using Teachable Machine",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-gradient-to-br from-purple-600 to-indigo-700 min-h-screen">
                {children}
            </body>
        </html>
    );
}
