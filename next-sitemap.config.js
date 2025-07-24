/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://htmlweb.dev',
  generateRobotsTxt: true,
  exclude: ['/api/*', '/auth/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/'],
      },
    ],
  },
}