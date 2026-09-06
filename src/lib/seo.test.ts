import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  applySeoToHtml,
  CANONICAL_ORIGIN,
  INDEXABLE_PATHS,
  isKnownDocumentPath,
  jsonLdForPath,
  LANDLORD_SOFTWARE_DESCRIPTION,
  LANDLORD_SOFTWARE_FAQ,
  LANDLORD_SOFTWARE_PATH,
  robotsTxt,
  seoForPath,
  sitemapXml,
} from './seo';

assert.equal(CANONICAL_ORIGIN, 'https://rentelyo.com');

const home = seoForPath('/');
assert.equal(home.canonical, 'https://rentelyo.com/');
assert.equal(home.robots, 'index, follow');
assert.equal(home.indexable, true);

assert.equal(seoForPath('/pricing/').canonical, 'https://rentelyo.com/pricing');
assert.equal(seoForPath('/tarifs').canonical, 'https://rentelyo.com/pricing');
assert.equal(seoForPath('/tarifs').indexable, true);
assert.equal(seoForPath('/features').robots, 'index, follow');

const landlord = seoForPath(LANDLORD_SOFTWARE_PATH);
assert.equal(landlord.canonical, 'https://rentelyo.com/property-management-software-for-landlords');
assert.equal(landlord.robots, 'index, follow');
assert.equal(landlord.indexable, true);
assert.equal(landlord.title, 'Property Management Software for Landlords | Rentelyo');
assert.equal(landlord.description, LANDLORD_SOFTWARE_DESCRIPTION);
assert.equal(isKnownDocumentPath(LANDLORD_SOFTWARE_PATH), true);
assert.equal(seoForPath('/').description, 'Vos locations, simplement. Biens, locataires, loyers et documents dans un seul espace.');

assert.equal(seoForPath('/login').robots, 'noindex, nofollow');
assert.equal(seoForPath('/signup').indexable, false);
assert.equal(seoForPath('/app').robots, 'noindex, nofollow');
assert.equal(seoForPath('/app/properties').robots, 'noindex, nofollow');
assert.equal(seoForPath('/superadmin').robots, 'noindex, nofollow');
assert.equal(seoForPath('/checkout?plan=smart').robots, 'noindex, nofollow');
assert.equal(seoForPath('/unknown-page').robots, 'noindex, follow');
assert.equal(seoForPath('/unknown-page').canonical, 'https://rentelyo.com/unknown-page');
assert.equal(isKnownDocumentPath('/'), true);
assert.equal(isKnownDocumentPath('/pricing'), true);
assert.equal(isKnownDocumentPath('/app/settings'), true);
assert.equal(isKnownDocumentPath('/not-a-page'), false);

const robots = robotsTxt();
assert.match(robots, /^User-agent: \*\nAllow: \/\n/m);
assert.match(robots, /^Sitemap: https:\/\/rentelyo\.com\/sitemap\.xml$/m);
assert.equal(
  robots.split(/\r?\n/).some((line) => /^disallow:\s*\/\s*$/i.test(line)),
  false,
  'robots.txt must not contain Disallow: /',
);
assert.equal(robots.includes('Disallow: /app\n'), false);
assert.match(robots, /^Disallow: \/api\/$/m);
assert.match(robots, /^Disallow: \/app\/$/m);
assert.doesNotMatch(robots, /Disallow: \/apple/i);

const sitemap = sitemapXml();
assert.match(sitemap, /<loc>https:\/\/rentelyo\.com\/<\/loc>/);
for (const page of INDEXABLE_PATHS) {
  const loc = page === '/' ? 'https://rentelyo.com/' : `https://rentelyo.com${page}`;
  assert.ok(sitemap.includes(`<loc>${loc}</loc>`), `sitemap missing ${loc}`);
}
assert.doesNotMatch(sitemap, /<loc>http:\/\//);
assert.doesNotMatch(sitemap, /www\.rentelyo\.com/);
assert.doesNotMatch(sitemap, /\/login/);
assert.doesNotMatch(sitemap, /\/app/);
assert.doesNotMatch(sitemap, /\/tarifs/);
assert.doesNotMatch(sitemap, /\/api\//);

const publicDir = path.resolve(__dirname, '../../web/public');
assert.equal(fs.readFileSync(path.join(publicDir, 'robots.txt'), 'utf8'), robots);
assert.equal(fs.readFileSync(path.join(publicDir, 'sitemap.xml'), 'utf8'), sitemap);

const html = `<!doctype html>
<html lang="fr">
  <head>
    <title>Rentelyo — Vos locations, simplement.</title>
    <link rel="canonical" href="https://rentelyo.com/" />
    <meta name="robots" content="index, follow" />
  </head>
  <body></body>
</html>`;
const priced = applySeoToHtml(html, '/pricing');
assert.match(priced, /<link rel="canonical" href="https:\/\/rentelyo.com\/pricing" \/>/);
assert.match(priced, /<meta name="robots" content="index, follow" \/>/);
assert.match(priced, /<title>Tarifs — Rentelyo<\/title>/);

const appHtml = applySeoToHtml(html, '/app/settings');
assert.match(appHtml, /<meta name="robots" content="noindex, nofollow" \/>/);
assert.match(appHtml, /<link rel="canonical" href="https:\/\/rentelyo.com\/app\/settings" \/>/);

assert.doesNotMatch(priced, /og:title/);
assert.doesNotMatch(priced, /rentelyo-jsonld/);

const landingHtml = applySeoToHtml(html, LANDLORD_SOFTWARE_PATH);
assert.match(
  landingHtml,
  /<title>Property Management Software for Landlords \| Rentelyo<\/title>/,
);
assert.match(
  landingHtml,
  /<link rel="canonical" href="https:\/\/rentelyo.com\/property-management-software-for-landlords" \/>/,
);
assert.match(landingHtml, /<meta name="robots" content="index, follow" \/>/);
assert.match(landingHtml, /<meta name="description" content="Simple property management software for landlords. Manage properties, tenants, leases, rent, expenses, maintenance and documents with Rentelyo." \/>/);
assert.match(landingHtml, /<meta property="og:title" content="Property Management Software for Landlords \| Rentelyo" \/>/);
assert.match(landingHtml, /<meta property="og:type" content="website" \/>/);
assert.match(landingHtml, /<meta property="og:locale" content="en_US" \/>/);
assert.match(landingHtml, /<script type="application\/ld\+json" id="rentelyo-jsonld">/);

const jsonLd = jsonLdForPath(LANDLORD_SOFTWARE_PATH);
assert.ok(jsonLd && typeof jsonLd === 'object');
const graph = (jsonLd as { '@graph': Array<Record<string, unknown>> })['@graph'];
assert.equal(graph[0]?.['@type'], 'SoftwareApplication');
assert.equal(graph[1]?.['@type'], 'FAQPage');
assert.equal((graph[1]?.mainEntity as unknown[]).length, LANDLORD_SOFTWARE_FAQ.length);
const landingBlob = JSON.stringify(jsonLd);
assert.match(landingBlob, /Does Rentelyo collect rent online\?/);
assert.match(landingBlob, /does not process tenant rent payments/);
assert.match(landingBlob, /not a property listing or real estate marketplace/);
assert.doesNotMatch(landingBlob, /AggregateRating/);
assert.doesNotMatch(landingBlob, /"@type":"Review"/);
assert.doesNotMatch(robots, /property-management-software-for-landlords/);

console.log('seo tests ok');
