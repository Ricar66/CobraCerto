export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clients/:path*',
    '/invoices/:path*',
    '/settings/:path*',
    '/api/clients/:path*',
    '/api/invoices/:path*',
    '/api/users/:path*',
  ],
};
