// Configuración centralizada de performance
export const PERFORMANCE_CONFIG = {
    // Cache durations
    cache: {
        courses: 5 * 60 * 1000, // 5 minutos
        images: 24 * 60 * 60 * 1000, // 24 horas
        user: 10 * 60 * 1000, // 10 minutos
        api: 2 * 60 * 1000, // 2 minutos
    },

    // Lazy loading settings
    lazyLoading: {
        rootMargin: '50px',
        threshold: 0.1,
        imageLoadingStrategy: 'lazy',
        videoLoadingStrategy: 'lazy',
    },

    // Preloading priorities
    preload: {
        criticalImages: [
            '/assets/img/zetaLogoo.webp',
            '/assets/img/DALLE01.webp',
            '/assets/img/defaultProfileImage.jpg',
        ],
        criticalFonts: [
            'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap',
        ],
        criticalAPI: [
            '/api/courses',
            '/api/auth/session',
        ],
    },

    // Bundling and code splitting
    bundling: {
        maxChunkSize: 244 * 1024, // 244KB
        minChunkSize: 20 * 1024, // 20KB
        maxAsyncRequests: 30,
        maxInitialRequests: 25,
    },

    // Image optimization
    images: {
        quality: 85,
        formats: ['webp', 'avif'],
        sizes: {
            thumbnail: 150,
            small: 300,
            medium: 600,
            large: 1200,
            xl: 1920,
        },
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    },

    // Network optimization
    network: {
        retryAttempts: 3,
        retryDelay: 1000,
        timeout: 10000,
        abortSignalTimeout: 8000,
    },

    // Performance metrics targets
    metrics: {
        fcp: 1.8, // First Contentful Paint (seconds)
        lcp: 2.5, // Largest Contentful Paint (seconds)
        fid: 100, // First Input Delay (ms)
        cls: 0.1, // Cumulative Layout Shift
        tbt: 200, // Total Blocking Time (ms)
        lighthouse: 90, // Target Lighthouse score
    },

    // Resource priorities
    priorities: {
        critical: [
            'layout',
            'navigation',
            'hero-section',
            'course-cards',
        ],
        important: [
            'images',
            'videos',
            'user-profile',
        ],
        normal: [
            'footer',
            'analytics',
            'social-media',
        ],
        low: [
            'chat-widgets',
            'third-party-scripts',
            'non-critical-animations',
        ],
    },

    // Feature flags for performance optimizations
    features: {
        enableServiceWorker: true,
        enableImageOptimization: true,
        enableCodeSplitting: true,
        enablePrefetching: true,
        enableIntersectionObserver: true,
        enableWebWorkers: false, // Considerar para tareas pesadas
        enableMemoryOptimization: true,
    },

    // Development vs Production settings
    environment: {
        development: {
            enableAnalytics: false,
            enableErrorReporting: true,
            enablePerformanceMonitoring: true,
            bundleAnalyzer: true,
        },
        production: {
            enableAnalytics: true,
            enableErrorReporting: true,
            enablePerformanceMonitoring: true,
            bundleAnalyzer: false,
            compression: 'gzip',
            minification: true,
        },
    },
};

// Utility functions for performance
export const performanceUtils = {
    // Check if we should preload a resource
    shouldPreload: (resourceType, resourceName) => {
        const { preload } = PERFORMANCE_CONFIG;
        return preload[resourceType]?.includes(resourceName) || false;
    },

    // Get cache duration for a resource type
    getCacheDuration: (resourceType) => {
        return PERFORMANCE_CONFIG.cache[resourceType] || PERFORMANCE_CONFIG.cache.api;
    },

    // Check if a feature is enabled
    isFeatureEnabled: (featureName) => {
        return PERFORMANCE_CONFIG.features[featureName] || false;
    },

    // Get resource priority
    getResourcePriority: (resourceName) => {
        const { priorities } = PERFORMANCE_CONFIG;
        for (const [priority, resources] of Object.entries(priorities)) {
            if (resources.includes(resourceName)) {
                return priority;
            }
        }
        return 'normal';
    },

    // Get optimal image size for viewport
    getOptimalImageSize: (containerWidth) => {
        const { sizes } = PERFORMANCE_CONFIG.images;

        if (containerWidth <= 300) return sizes.small;
        if (containerWidth <= 600) return sizes.medium;
        if (containerWidth <= 1200) return sizes.large;
        return sizes.xl;
    },

    // Create intersection observer with performance config
    createIntersectionObserver: (callback, options = {}) => {
        const config = PERFORMANCE_CONFIG.lazyLoading;
        return new IntersectionObserver(callback, {
            rootMargin: config.rootMargin,
            threshold: config.threshold,
            ...options,
        });
    },

    // Memory optimization helper
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle function for scroll events
    throttle: (func, limit) => {
        let inThrottle;
        return function () {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
};

export default PERFORMANCE_CONFIG;
