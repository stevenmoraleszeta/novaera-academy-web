// Google Analytics 4 configuration for enhanced tracking
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Enhanced ecommerce and educational tracking
export const gtag = (...args) => {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag(...args);
    }
};

// Page view tracking
export const pageview = (url) => {
    gtag('config', GA_MEASUREMENT_ID, {
        page_location: url,
        custom_map: {
            custom_definition_1: 'page_type',
            custom_definition_2: 'user_type'
        }
    });
};

// Event tracking for educational content
export const trackEvent = (eventName, parameters = {}) => {
    gtag('event', eventName, {
        ...parameters,
        send_to: GA_MEASUREMENT_ID
    });
};

// Course interaction tracking
export const trackCourseView = (courseId, courseName, courseType) => {
    trackEvent('view_item', {
        item_id: courseId,
        item_name: courseName,
        item_category: 'Curso',
        item_variant: courseType,
        value: 0
    });
};

export const trackCourseEnrollment = (courseId, courseName, courseType) => {
    trackEvent('purchase', {
        transaction_id: `enrollment_${courseId}_${Date.now()}`,
        value: 0,
        currency: 'COP',
        items: [{
            item_id: courseId,
            item_name: courseName,
            item_category: 'Curso',
            item_variant: courseType,
            quantity: 1
        }]
    });
};

// User engagement tracking
export const trackVideoProgress = (videoId, progress) => {
    trackEvent('video_progress', {
        video_id: videoId,
        progress_percentage: progress
    });
};

export const trackSearchQuery = (searchTerm, resultsCount) => {
    trackEvent('search', {
        search_term: searchTerm,
        results_count: resultsCount
    });
};

// WhatsApp contact tracking
export const trackWhatsAppContact = (source) => {
    trackEvent('contact_whatsapp', {
        source: source,
        method: 'whatsapp'
    });
};
