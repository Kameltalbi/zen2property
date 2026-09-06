export const CANONICAL_ORIGIN = 'https://rentelyo.com';

export const LANDLORD_SOFTWARE_PATH = '/property-management-software-for-landlords';
export const SIMPLE_LANDLORD_PATH = '/landlord-software';
export const SMALL_LANDLORD_PATH = '/property-management-software-for-small-landlords';

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
  SIMPLE_LANDLORD_PATH,
  SMALL_LANDLORD_PATH,
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
  [SIMPLE_LANDLORD_PATH]: 'Landlord Software for Rental Property Management | Rentelyo',
  [SMALL_LANDLORD_PATH]: 'Property Management Software for Small Landlords | Rentelyo',
};

export const DEFAULT_DESCRIPTION =
  'Vos locations, simplement. Biens, locataires, loyers et documents dans un seul espace.';

export const LANDLORD_SOFTWARE_DESCRIPTION =
  'Simple property management software for landlords. Manage properties, tenants, leases, rent, expenses, maintenance and documents with Rentelyo.';

export const SIMPLE_LANDLORD_DESCRIPTION =
  'Simple landlord software to manage properties, tenants, leases, rent, expenses, maintenance and documents in one organized workspace.';

export const SMALL_LANDLORD_DESCRIPTION =
  'Simple property management software for small landlords. Manage rentals, tenants, leases, rent, expenses, maintenance and documents with Rentelyo.';

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

export const SIMPLE_LANDLORD_FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'What is landlord software?',
    a: 'Landlord software is a tool that helps independent landlords organise rental work they already do themselves: properties, tenants, leases, rent tracking, expenses, maintenance and documents — instead of spreading that information across spreadsheets, folders and notes.',
  },
  {
    q: 'Who should use landlord software?',
    a: 'It is a good fit if you already own rental properties, manage them yourself, and want one place to keep records as information grows. It is not a listing site, an estate-agency desk, or a service for finding tenants.',
  },
  {
    q: 'Is Rentelyo suitable for independent landlords?',
    a: 'Yes. Rentelyo is built for self-managing landlords who want a simple workspace rather than an enterprise system. You can start with one property on the free plan and move to a paid plan as the portfolio grows.',
  },
  {
    q: 'Can I use Rentelyo instead of a spreadsheet?',
    a: 'Yes. Spreadsheets work when you have a few notes. Rentelyo replaces that scattered setup with linked property, tenant, lease, rent, expense, maintenance and document records. You can still download CSV reports if you want a spreadsheet snapshot.',
  },
  {
    q: 'Can I manage multiple rental properties?',
    a: 'Yes, within your plan. The free plan includes one property and one tenant. Smart covers up to five properties. Premium covers up to fifteen.',
  },
  {
    q: 'Can I manage tenants and leases?',
    a: 'Yes. You can keep tenant contact details, associate tenants with properties, and record leases with start and end dates, rent, charges, deposits and payment frequency.',
  },
  {
    q: 'Can Rentelyo track rent payments?',
    a: 'Yes. Active leases generate expected rent periods. You record payments and follow Paid, Pending, Late and Partial statuses, with payment history, reminders, and PDF or emailed receipts.',
  },
  {
    q: 'Does Rentelyo collect rent online?',
    a: 'No. Rentelyo currently tracks rent payments but does not process tenant rent payments.',
  },
  {
    q: 'Can I track rental expenses?',
    a: 'Yes. Record amount, date, category, vendor, description and the related property, then follow expense totals in the workspace.',
  },
  {
    q: 'Can I manage maintenance?',
    a: 'Yes. Create a maintenance record for a property with priority, status, vendor and cost, and convert a cost into an expense when you want it in your books. Landlords enter these jobs — tenants do not submit requests in Rentelyo.',
  },
  {
    q: 'Can I store rental documents?',
    a: 'Yes. Upload files securely, categorise them, associate them with a property, and optionally with a tenant or lease, then download or delete them. Rentelyo does not offer e-signature or automatic contract generation.',
  },
  {
    q: 'Can Rentelyo generate rent receipts?',
    a: 'Yes. When rent is marked as paid, you can generate a PDF rent receipt and email it.',
  },
  {
    q: 'Is Rentelyo a property listing website?',
    a: 'No. Rentelyo is software for landlords who already have properties and tenants. It is not a listing website, marketplace or tenant-acquisition service.',
  },
];

export const SMALL_LANDLORD_FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: 'What is property management software for small landlords?',
    a: 'It is software that helps self-managing landlords run a small rental portfolio: property records, tenants, leases, rent tracking, expenses, maintenance and documents, without the process layers of an enterprise property-management system.',
  },
  {
    q: 'Who is Rentelyo designed for?',
    a: 'Rentelyo is designed for independent landlords who already have properties and tenants and want to manage operations themselves. It is not built as a platform for large property-management departments, agencies or teams.',
  },
  {
    q: 'Is Rentelyo suitable for landlords with only one property?',
    a: 'Yes. The free plan currently includes one property and one tenant, so you can organise a single rental without paying first. Paid plans increase those limits when the portfolio grows.',
  },
  {
    q: 'Can I manage multiple properties with Rentelyo?',
    a: 'Yes, within your plan. Smart currently covers up to five properties. Premium currently covers up to fifteen. Exact limits are always listed on the pricing page.',
  },
  {
    q: 'Can I manage tenants and leases?',
    a: 'Yes. You can keep tenant contact details, associate tenants with properties, and record leases with start and end dates, rent, charges, deposits and payment frequency.',
  },
  {
    q: 'Does Rentelyo automatically track expected rent?',
    a: 'Yes. Active leases generate expected rent periods. You then record each payment and follow its status in the workspace.',
  },
  {
    q: 'Can Rentelyo identify late rent?',
    a: 'Yes. Each expected period can show as Paid, Pending, Late or Partial, so overdue rent stays visible instead of sitting in a forgotten spreadsheet row.',
  },
  {
    q: 'Does Rentelyo collect tenant rent online?',
    a: 'No. Rentelyo currently helps landlords track and record rent payments. It does not process tenant rent payments online.',
  },
  {
    q: 'Can I track rental property expenses?',
    a: 'Yes. Record amount, date, category, vendor, description and the related property, then follow expense totals.',
  },
  {
    q: 'Can I manage property maintenance?',
    a: 'Yes. Create a maintenance record for a property with priority, status, vendor and cost, and convert a cost into an expense. Landlords enter these jobs — there is no tenant request portal.',
  },
  {
    q: 'Can I store rental documents?',
    a: 'Yes. Upload files securely, categorise them, associate them with a property, and optionally with a tenant or lease, then download or delete them. Rentelyo does not offer e-signature or generated leases.',
  },
  {
    q: 'Can Rentelyo generate PDF rent receipts?',
    a: 'Yes. When rent is marked as paid, you can generate a PDF rent receipt and email it.',
  },
  {
    q: 'Do I need property management software if I only own a few rentals?',
    a: 'You may not need an enterprise system. A few rentals still produce lease dates, expected rent, expenses, repairs and files. Rentelyo is meant to keep that operational work connected without adding department-scale process.',
  },
  {
    q: 'Is Rentelyo a property listing website?',
    a: 'No. Rentelyo is property management software for landlords who already have tenants. It is not a listing website, marketplace or tenant-acquisition service.',
  },
];

const SEO_LANDINGS: Record<string, { description: string; faq: ReadonlyArray<{ q: string; a: string }> }> = {
  [LANDLORD_SOFTWARE_PATH]: { description: LANDLORD_SOFTWARE_DESCRIPTION, faq: LANDLORD_SOFTWARE_FAQ },
  [SIMPLE_LANDLORD_PATH]: { description: SIMPLE_LANDLORD_DESCRIPTION, faq: SIMPLE_LANDLORD_FAQ },
  [SMALL_LANDLORD_PATH]: { description: SMALL_LANDLORD_DESCRIPTION, faq: SMALL_LANDLORD_FAQ },
};

export function isSeoLandingPath(pathname: string): boolean {
  return Boolean(SEO_LANDINGS[canonicalPathFor(pathname)]);
}

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
    description: SEO_LANDINGS[canonicalPath]?.description ?? DEFAULT_DESCRIPTION,
  };
}

export function jsonLdForPath(pathname: string): unknown | null {
  const path = canonicalPathFor(pathname);
  const landing = SEO_LANDINGS[path];
  if (!landing) return null;
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
        description: landing.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: landing.faq.map((item) => ({
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
  if (isSeoLandingPath(path)) {
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
