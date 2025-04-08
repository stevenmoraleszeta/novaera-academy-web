import "./globals.css";
import Navbar from "../components/navbar/Navbar";
import FooterZ from "@/components/footer/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { Montserrat } from "next/font/google";
import FixedBtn from "@/components/fixedBtn/fixedBtn";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";

const montserrat = Montserrat({
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: "ZETA Academia",
  description: "ZETA Plataforma Educativa",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />

        <meta property="og:title" content="ZETA Academia" />
        <meta property="og:description" content="ZETA Plataforma Educativa" />
        <meta property="og:url" content="https://zetaacademia.com" />
        <meta property="og:type" content="website" />

        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZETA%201200.png?alt=media&token=3adb303b-a52f-4f7f-8266-b2bbba867083" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZ%201200.png?alt=media&token=1dfe7287-6ea0-4ca2-aa3b-25dc9af60b98" />
        <meta property="og:image:width" content="500" />
        <meta property="og:image:height" content="500" />

        <meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZ%201200.png?alt=media&token=1dfe7287-6ea0-4ca2-aa3b-25dc9af60b98" />
        <meta property="og:image:width" content="200" />
        <meta property="og:image:height" content="200" />
        <meta name="google-site-verification" content="8bxJkE6LORDcTXliwjxeBFGTCSfMn5EaFvm7tLLUVd4" />
      </head>
      <body className={`app ${montserrat.className}`}>
        <AuthProvider>
          <SpeedInsights />
          <div className="page-container">
            <Navbar />
            <FixedBtn />
            <main className="content">{children}</main>
            <FooterZ />
          </div>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
