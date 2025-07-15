import "./globals.css";
import { Montserrat } from "next/font/google";
import { Suspense, lazy } from "react";

// Lazy load componentes no críticos
const Navbar = lazy(() => import("../components/navbar/Navbar"));
const FooterZ = lazy(() => import("@/components/footer/Footer"));
const FixedBtn = lazy(() => import("@/components/fixedBtn/fixedBtn"));

// Lazy load proveedores de contexto
const AuthProvider = lazy(() => import("@/context/AuthContext").then(module => ({ default: module.AuthProvider })));
const ModalProvider = lazy(() => import("@/context/ModalContext").then(module => ({ default: module.ModalProvider })));

// Lazy load analytics (solo en producción)
const SpeedInsights = lazy(() => import("@vercel/speed-insights/next").then(module => ({ default: module.SpeedInsights })));
const Analytics = lazy(() => import("@vercel/analytics/react").then(module => ({ default: module.Analytics })));

const montserrat = Montserrat({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: 'swap', // Optimización para fuentes
  preload: true,
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
        {/* Critical CSS preload */}
        <link rel="preload" href="/globals.css" as="style" />

        {/* DNS prefetch para recursos externos */}
        <link rel="dns-prefetch" href="//firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="//vercel.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />

        {/* Preconnect para recursos críticos */}
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="" />

        {/* Viewport optimizado */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0" />

        {/* Schema.org structured data - optimizado */}
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
                "addressCountry": "CO"
              }
            })
          }}
        />

        {/* Eliminar Open Graph duplicados - ya están en metadata */}
        <meta name="google-site-verification" content="8bxJkE6LORDcTXliwjxeBFGTCSfMn5EaFvm7tLLUVd4" />
      </head>
      <body className={`app ${montserrat.className}`}>
        <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000' }}></div>}>
          <ModalProvider>
            <AuthProvider>
              {/* Solo cargar analytics en producción */}
              {process.env.NODE_ENV === 'production' && (
                <Suspense fallback={null}>
                  <SpeedInsights />
                  <Analytics />
                </Suspense>
              )}
              <div className="page-container">
                <Suspense fallback={<div style={{ height: '80px', background: '#000' }}></div>}>
                  <Navbar />
                </Suspense>

                <Suspense fallback={null}>
                  <FixedBtn />
                </Suspense>

                <main className="content">{children}</main>

                <Suspense fallback={<div style={{ height: '200px', background: '#000' }}></div>}>
                  <FooterZ />
                </Suspense>
              </div>
            </AuthProvider>
          </ModalProvider>
        </Suspense>
      </body>
    </html>
  );
}
