export const CANONICAL_ORIGIN = 'https://rentelyo.com';

export const LANDLORD_SOFTWARE_PATH = '/property-management-software-for-landlords';

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
  LANDLORD_SOFTWARE_PATH,
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
  [LANDLORD_SOFTWARE_PATH]: 'Property Management Software for Landlords | Rentelyo',
};

export const DEFAULT_DESCRIPTION =
  'Vos locations, simplement. Biens, locataires, loyers et documents dans un seul espace.';

export const LANDLORD_SOFTWARE_DESCRIPTION =
  'Simple property management software for landlords. Manage properties, tenants, leases, rent, expenses, maintenance and documents with Rentelyo.';

export const LANDLORD_SOFTWARE_FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'What is property management software for landlords?',
    a: 'It is software that helps landlords organise the day-to-day work of running rental properties they already own: property records, tenants, leases, rent tracking, expenses, maintenance and documents, in one workspace.',
  },
  {
    q: 'Who is Rentelyo designed for?',
    a: 'Rentelyo is designed for independent landlords who manage their own rental properties and want a simple operational tool, without the complexity of enterprise property-management systems.',
  },
  {
    q: 'Can I manage multiple rental properties with Rentelyo?',
    a: 'Yes. You can add and manage multiple properties within your plan limits. The free plan includes one property; paid plans increase that limit.',
  },
  {
    q: 'Can I manage tenants and leases?',
    a: 'Yes. You can keep tenant records and contact details, associate tenants with properties, and record leases with start and end dates, rent, charges, deposits and payment frequency.',
  },
  {
    q: 'Can Rentelyo track rent payments?',
    a: 'Yes. Active leases generate expected rent periods. You can record payments, follow Paid, Pending, Late and Partial statuses, keep payment history, and send upcoming or overdue rent reminders.',
  },
  {
    q: 'Does Rentelyo collect rent online?',
    a: 'No. Rentelyo currently helps landlords track and manage rent payments; it does not process tenant rent payments.',
  },
  {
    q: 'Can I manage maintenance and expenses?',
    a: 'Yes. You can record expenses by category, property, vendor, amount and date. Maintenance jobs can include priority, status, vendor and cost, and a completed cost can be converted into an expense.',
  },
  {
    q: 'Can I store rental documents?',
    a: 'Yes. You can upload documents securely, categorise them, associate them with a property, and optionally with a tenant or lease, then download or delete them when needed.',
  },
  {
    q: 'Does Rentelyo generate rent receipts?',
    a: 'Yes. When rent is marked as paid, you can generate a PDF rent receipt and email it. Rentelyo does not create e-signed leases or other generated legal contracts.',
  },
  {
    q: 'Is Rentelyo a property listing website?',
    a: 'No. Rentelyo is property management software for landlords, not a property listing or real estate marketplace.',
  },
];

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
    description:
      canonicalPath === LANDLORD_SOFTWARE_PATH ? LANDLORD_SOFTWARE_DESCRIPTION : DEFAULT_DESCRIPTION,
  };
}

export function jsonLdForPath(pathname: string): unknown | null {
  if (canonicalPathFor(pathname) !== LANDLORD_SOFTWARE_PATH) return null;
  const seo = seoForPath(pathname);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Rentelyo',
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        url: seo.canonical,
        description: LANDLORD_SOFTWARE_DESCRIPTION,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: LANDLORD_SOFTWARE_FAQ.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
    ],
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

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function upsertLink(html: string, rel: string, href: string): string {
  const re = new RegExp(`<link rel="${rel}" href="[^"]*"\\s*/?>`);
  const tag = `<link rel="${rel}" href="${escapeAttr(href)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertMeta(html: string, attr: 'name' | 'property', key: string, content: string): string {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`);
  const tag = `<meta ${attr}="${key}" content="${escapeAttr(content)}" />`;
  if (re.test(html)) return html.replace(re, tag);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

function upsertJsonLd(html: string, data: unknown | null): string {
  const re = /<script type="application\/ld\+json" id="rentelyo-jsonld">[\s\S]*?<\/script>\s*/;
  if (!data) return html.replace(re, '');
  const tag = `<script type="application/ld+json" id="rentelyo-jsonld">${JSON.stringify(data)}</script>`;
  if (re.test(html)) return html.replace(re, `${tag}\n    `);
  return html.replace('</head>', `    ${tag}\n  </head>`);
}

export function applySeoToHtml(html: string, pathname: string): string {
  const seo = seoForPath(pathname);
  const path = canonicalPathFor(pathname);
  let next = html;
  next = upsertLink(next, 'canonical', seo.canonical);
  next = upsertMeta(next, 'name', 'robots', seo.robots);
  if (next.includes('<title>')) {
    next = next.replace(/<title>[^<]*<\/title>/, `<title>${seo.title}</title>`);
  }
  if (path === LANDLORD_SOFTWARE_PATH) {
    next = upsertMeta(next, 'name', 'description', seo.description);
    next = upsertMeta(next, 'property', 'og:title', seo.title);
    next = upsertMeta(next, 'property', 'og:description', seo.description);
    next = upsertMeta(next, 'property', 'og:url', seo.canonical);
    next = upsertMeta(next, 'property', 'og:type', 'website');
    next = upsertMeta(next, 'property', 'og:site_name', 'Rentelyo');
    next = upsertMeta(next, 'property', 'og:locale', 'en_US');
    next = upsertJsonLd(next, jsonLdForPath(pathname));
  }
  return next;
}
