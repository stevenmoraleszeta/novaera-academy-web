/**
 * Configuración de Performance para Novaera
 * Este archivo contiene configuraciones para optimizar el rendimiento
 */

// Configuraciones de cache
export const CACHE_CONFIG = {
    COURSES_CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
    STATIC_CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 horas
    API_CACHE_DURATION: 10 * 60 * 1000, // 10 minutos
};

// Configuraciones de lazy loading
export const LAZY_LOADING_CONFIG = {
    INTERSECTION_THRESHOLD: 0.1,
    ROOT_MARGIN: '50px',
    IMAGE_PLACEHOLDER: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAQIAEQMhkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+JNKpBJXu9/wCxjmD'
};

// Configuraciones de bundle splitting
export const BUNDLE_CONFIG = {
    VENDOR_MODULES: ['react', 'react-dom', 'next'],
    ICON_MODULES: ['react-icons'],
    UTILITY_MODULES: ['axios', 'firebase'],
};

// URLs críticas para prefetch
export const CRITICAL_RESOURCES = {
    FONTS: [
        'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap'
    ],
    IMAGES: [
        'https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZETA%201200.png?alt=media&token=3adb303b-a52f-4f7f-8266-b2bbba867083'
    ],
    API_ENDPOINTS: [
        '/courses/category-name/live',
        '/courses/category-name/online'
    ]
};

// Configuraciones de debounce
export const DEBOUNCE_CONFIG = {
    SEARCH_DELAY: 300,
    FILTER_DELAY: 200,
    SCROLL_DELAY: 16,
};

// Configuraciones de viewport
export const VIEWPORT_CONFIG = {
    DESKTOP_BREAKPOINT: 1200,
    TABLET_BREAKPOINT: 768,
    MOBILE_BREAKPOINT: 480,
};

// Configuraciones de optimización de imágenes
export const IMAGE_CONFIG = {
    QUALITY: 80,
    FORMATS: ['image/webp', 'image/avif'],
    DEVICE_SIZES: [640, 750, 828, 1080, 1200, 1920],
    IMAGE_SIZES: [16, 32, 48, 64, 96, 128, 256, 384],
    PLACEHOLDER_SIZE: { width: 400, height: 250 }
};

export default {
    CACHE_CONFIG,
    LAZY_LOADING_CONFIG,
    BUNDLE_CONFIG,
    CRITICAL_RESOURCES,
    DEBOUNCE_CONFIG,
    VIEWPORT_CONFIG,
    IMAGE_CONFIG,
};
