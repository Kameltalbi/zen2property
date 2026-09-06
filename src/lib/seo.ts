export const CANONICAL_ORIGIN = 'https://rentelyo.com';

export const INDEXABLE_PATHS = [
  '/',
  '/pricing',
  '/features',
  '/security',
  '/help',
  '/about',
  '/contact',
  '/cookies',
  '/privacy',
  '/terms',
] as const;

const PATH_ALIASES: Record<string, string> = {
  '/tarifs': '/pricing',
};

const PAGE_TITLES: Record<string, string> = {
  '/': 'Rentelyo — Vos locations, simplement.',
  '/pricing': 'Tarifs — Rentelyo',
  '/features': 'Fonctionnalités — Rentelyo',
  '/security': 'Sécurité — Rentelyo',
  '/help': 'Centre d’aide — Rentelyo',
  '/about': 'À propos — Rentelyo',
  '/contact': 'Contact — Rentelyo',
  '/cookies': 'Cookies — Rentelyo',
  '/privacy': 'Confidentialité — Rentelyo',
  '/terms': 'Conditions — Rentelyo',
};

export const DEFAULT_DESCRIPTION =
  'Vos locations, simplement. Biens, locataires, loyers et documents dans un seul espace.';

export type PublicSeo = {
  canonical: string;
  robots: string;
  indexable: boolean;
  title: string;
  description: string;
};

export function normalizePath(pathname: string): string {
  const raw = pathname.split('?')[0]?.split('#')[0] ?? '/';
  if (!raw || raw === '/') return '/';
  const withSlash = raw.startsWith('/') ? raw : `/${raw}`;
  return withSlash.length > 1 && withSlash.endsWith('/') ? withSlash.slice(0, -1) : withSlash;
}

export function isKnownDocumentPath(pathname: string): boolean {
  const path = canonicalPathFor(pathname);
  if ((INDEXABLE_PATHS as readonly string[]).includes(path)) return true;
  return isPrivatePath(path);
}

export function isPrivatePath(pathname: string): boolean {
  const path = normalizePath(pathname);
  if (path === '/app' || path.startsWith('/app/')) return true;
  if (path === '/superadmin' || path.startsWith('/superadmin/')) return true;
  if (path === '/login' || path === '/signup') return true;
  if (path === '/forgot-password' || path === '/reset-password') return true;
  if (path === '/checkout' || path.startsWith('/checkout/')) return true;
  return false;
}

export function canonicalPathFor(pathname: string): string {
  const path = normalizePath(pathname);
  return PATH_ALIASES[path] ?? path;
}

export function seoForPath(pathname: string): PublicSeo {
  const canonicalPath = canonicalPathFor(pathname);
  const indexable = (INDEXABLE_PATHS as readonly string[]).includes(canonicalPath) && !isPrivatePath(canonicalPath);
  const loc = canonicalPath === '/' ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${canonicalPath}`;
  return {
    canonical: loc,
    robots: indexable ? 'index, follow' : isPrivatePath(canonicalPath) ? 'noindex, nofollow' : 'noindex, follow',
    indexable,
    title: PAGE_TITLES[canonicalPath] ?? 'Rentelyo — Vos locations, simplement.',
    description: DEFAULT_DESCRIPTION,
  };
}

export function robotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    '',
    'Disallow: /api/',
    'Disallow: /app/',
    'Disallow: /app$',
    'Disallow: /superadmin',
    'Disallow: /superadmin/',
    'Disallow: /health',
    'Disallow: /checkout',
    'Disallow: /checkout/',
    '',
    `Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n');
}

export function sitemapXml(lastmod = '2026-09-06'): string {
  const urls = INDEXABLE_PATHS.map((path) => {
    const loc = path === '/' ? `${CANONICAL_ORIGIN}/` : `${CANONICAL_ORIGIN}${path}`;
    return ['  <url>', `    <loc>${loc}</loc>`, `    <lastmod>${lastmod}</lastmod>`, '  </url>'].join('\n');
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

export function applySeoToHtml(html: string, pathname: string): string {
  const seo = seoForPath(pathname);
  let next = html;
  if (next.includes('rel="canonical"')) {
    next = next.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${seo.canonical}" />`);
  } else {
    next = next.replace('</head>', `    <link rel="canonical" href="${seo.canonical}" />\n  </head>`);
  }
  if (next.includes('name="robots"')) {
    next = next.replace(/<meta name="robots" content="[^"]*"\s*\/?>/, `<meta name="robots" content="${seo.robots}" />`);
  } else {
    next = next.replace('</head>', `    <meta name="robots" content="${seo.robots}" />\n  </head>`);
  }
  if (next.includes('<title>')) {
    next = next.replace(/<title>[^<]*<\/title>/, `<title>${seo.title}</title>`);
  }
  return next;
}
