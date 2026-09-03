import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Flashy — Learn deliberately", description: "Personal spaced repetition flashcards" };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ar" dir="rtl"><body>{children}</body></html>; }
