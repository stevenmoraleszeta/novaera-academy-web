import { NextResponse } from 'next/server';

export function middleware(request) {
    const response = NextResponse.next();

    // Agregar headers de seguridad y SEO
    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Headers de performance y cache
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    response.headers.set('X-Robots-Tag', 'index, follow');

    // Preload critical resources para páginas de cursos
    const pathname = request.nextUrl.pathname;
    if (pathname.startsWith('/cursos-en-')) {
        response.headers.set('Link',
            `<${process.env.NEXT_PUBLIC_API_URL}/courses>; rel=preload; as=fetch; crossorigin=anonymous`
        );
    }

    console.log('Middleware ejecutándose para:', pathname);

    // Redireccionar URLs antiguas o variaciones comunes
    if (pathname === '/courses' || pathname === '/cursos') {
        console.log('Redirigiendo courses/cursos a cursos-en-linea');
        return NextResponse.redirect(new URL('/cursos-en-linea', request.url));
    }

    if (pathname === '/services' || pathname === '/service') {
        console.log('Redirigiendo services/service a servicios');
        return NextResponse.redirect(new URL('/servicios', request.url));
    }

    if (pathname === '/contact' || pathname === '/contacto') {
        console.log('Redirigiendo contact/contacto a servicios');
        return NextResponse.redirect(new URL('/servicios', request.url));
    }

    // Forzar HTTPS en producción
    if (request.nextUrl.protocol === 'http:' && process.env.NODE_ENV === 'production') {
        return NextResponse.redirect(`https://${request.nextUrl.host}${request.nextUrl.pathname}`);
    }

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
        // Rutas específicas para asegurar que funcionen
        '/contact',
        '/contacto',
        '/courses',
        '/cursos',
        '/services',
        '/service'
    ],
};
