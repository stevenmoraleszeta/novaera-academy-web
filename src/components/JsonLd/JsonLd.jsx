import { useMemo } from 'react';

const JsonLd = ({ data }) => {
    const jsonLdString = useMemo(() => {
        return JSON.stringify(data);
    }, [data]);

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLdString }}
        />
    );
};

// Funciones helper para generar structured data comunes
export const generateCourseJsonLd = (course) => ({
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title,
    "description": course.description,
    "provider": {
        "@type": "EducationalOrganization",
        "name": "ZETA Academia",
        "url": "https://zetaacademia.com"
    },
    "courseMode": course.type === 'online' ? 'online' : 'blended',
    "educationalLevel": "Beginner",
    "teaches": course.skills || [],
    "about": course.category,
    "url": `https://zetaacademia.com/cursos-${course.type}/${course.id}`,
    "image": course.image,
    "offers": {
        "@type": "Offer",
        "category": "Educación",
        "availability": "https://schema.org/InStock"
    }
});

export const generateArticleJsonLd = (article) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "author": {
        "@type": "Organization",
        "name": "ZETA Academia"
    },
    "publisher": {
        "@type": "Organization",
        "name": "ZETA Academia",
        "logo": {
            "@type": "ImageObject",
            "url": "https://firebasestorage.googleapis.com/v0/b/zeta-3a31d.appspot.com/o/images%2Ficons%2FZETA%201200.png?alt=media&token=3adb303b-a52f-4f7f-8266-b2bbba867083"
        }
    },
    "datePublished": article.publishDate,
    "dateModified": article.modifiedDate || article.publishDate,
    "url": article.url,
    "image": article.image
});

export const generateServiceJsonLd = (service) => ({
    "@context": "https://schema.org",
    "@type": "Service",
    "name": service.name,
    "description": service.description,
    "provider": {
        "@type": "EducationalOrganization",
        "name": "ZETA Academia",
        "url": "https://zetaacademia.com"
    },
    "serviceType": service.type,
    "areaServed": "Colombia",
    "url": "https://zetaacademia.com/servicios"
});

export default JsonLd;
