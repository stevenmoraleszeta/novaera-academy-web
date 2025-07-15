import { useEffect } from 'react';

/**
 * Hook para precargar recursos críticos
 */
const useResourcePreloader = () => {
    useEffect(() => {
        const preloadResources = async () => {
            // Precargar API endpoints críticos
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    // Precargar datos de cursos en vivo
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/category-name/live`, {
                        headers: { 'Cache-Control': 'max-age=300' }
                    }).catch(() => { });

                    // Precargar datos de cursos en línea
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/category-name/online`, {
                        headers: { 'Cache-Control': 'max-age=300' }
                    }).catch(() => { });
                });
            }

            // Precargar fuentes críticas
            const fontLinks = [
                'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap'
            ];

            fontLinks.forEach(href => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'style';
                link.href = href;
                document.head.appendChild(link);
            });

            // Precargar imágenes críticas
            const criticalImages = [
                'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZETA%201200.png?alt=media&token=3adb303b-a52f-4f7f-8266-b2bbba867083'
            ];

            criticalImages.forEach(src => {
                const img = new Image();
                img.src = src;
            });
        };

        // Ejecutar preload cuando el componente se monte
        preloadResources();
    }, []);
};

export default useResourcePreloader;
