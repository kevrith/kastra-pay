import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/merchant/', '/customer/'],
      },
    ],
    sitemap: 'https://kastrapay.com/sitemap.xml',
  };
}
