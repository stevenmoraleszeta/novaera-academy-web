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
  title: "ZETA Academia | Cursos de Programación, Excel y SQL",
  description: "Desbloquea tu potencial con ZETA Academia. Aprende programación Python, Excel, SQL y más con cursos en línea y en vivo. Tutores expertos y apoyo personalizado.",
  keywords: "cursos programación, Python, Excel, SQL, educación online, academia virtual, cursos en vivo, desarrollo web",
  authors: [{ name: "ZETA Academia" }],
  creator: "ZETA Academia",
  publisher: "ZETA Academia",
  robots: "index, follow",
  openGraph: {
    title: "ZETA Academia | Cursos de Programación, Excel y SQL",
    description: "Desbloquea tu potencial con ZETA Academia. Aprende programación Python, Excel, SQL y más con cursos en línea y en vivo.",
    url: "https://zetaacademia.com",
    siteName: "ZETA Academia",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZETA%201200.png?alt=media&token=3adb303b-a52f-4f7f-8266-b2bbba867083",
        width: 1200,
        height: 630,
        alt: "ZETA Academia - Plataforma Educativa"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "ZETA Academia | Cursos de Programación",
    description: "Aprende programación, Excel y SQL con ZETA Academia",
    images: ["https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZETA%201200.png?alt=media&token=3adb303b-a52f-4f7f-8266-b2bbba867083"]
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://zetaacademia.com" />

        {/* Geo-targeting meta tags */}
        <meta name="geo.region" content="CO" />
        <meta name="geo.placename" content="Colombia" />
        <meta name="geo.position" content="4.570868;-74.297333" />
        <meta name="ICBM" content="4.570868, -74.297333" />

        {/* Additional SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="es" />
        <meta name="format-detection" content="telephone=no" />

        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "ZETA Academia",
              "description": "Plataforma educativa especializada en cursos de programación, Excel y SQL",
              "url": "https://zetaacademia.com",
              "logo": "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZETA%201200.png?alt=media&token=3adb303b-a52f-4f7f-8266-b2bbba867083",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "CO",
                "addressRegion": "Colombia"
              },
              "offers": {
                "@type": "Offer",
                "category": "Educación Online"
              }
            })
          }}
        />

        {/* Open Graph tags (preserved existing ones) */}
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
