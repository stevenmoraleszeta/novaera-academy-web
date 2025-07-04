export default function robots() {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/userProfile/'],
        },
        sitemap: 'https://zetaacademia.com/sitemap.xml',
    };
}
