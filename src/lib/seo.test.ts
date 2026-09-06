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
  SIMPLE_LANDLORD_DESCRIPTION,
  SIMPLE_LANDLORD_FAQ,
  SIMPLE_LANDLORD_PATH,
  SMALL_LANDLORD_DESCRIPTION,
  SMALL_LANDLORD_FAQ,
  SMALL_LANDLORD_PATH,
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

const simpleLandlord = seoForPath(SIMPLE_LANDLORD_PATH);
assert.equal(simpleLandlord.canonical, 'https://rentelyo.com/landlord-software');
assert.equal(simpleLandlord.robots, 'index, follow');
assert.equal(simpleLandlord.indexable, true);
assert.equal(simpleLandlord.title, 'Landlord Software for Rental Property Management | Rentelyo');
assert.equal(simpleLandlord.description, SIMPLE_LANDLORD_DESCRIPTION);
assert.equal(isKnownDocumentPath(SIMPLE_LANDLORD_PATH), true);
assert.notEqual(simpleLandlord.title, landlord.title);
assert.notEqual(simpleLandlord.description, landlord.description);
assert.notEqual(SIMPLE_LANDLORD_FAQ[0]?.q, LANDLORD_SOFTWARE_FAQ[0]?.q);
assert.notEqual(SIMPLE_LANDLORD_FAQ.map((item) => item.q).join('|'), LANDLORD_SOFTWARE_FAQ.map((item) => item.q).join('|'));

const smallLandlord = seoForPath(SMALL_LANDLORD_PATH);
assert.equal(smallLandlord.canonical, 'https://rentelyo.com/property-management-software-for-small-landlords');
assert.equal(smallLandlord.robots, 'index, follow');
assert.equal(smallLandlord.indexable, true);
assert.equal(smallLandlord.title, 'Property Management Software for Small Landlords | Rentelyo');
assert.equal(smallLandlord.description, SMALL_LANDLORD_DESCRIPTION);
assert.equal(isKnownDocumentPath(SMALL_LANDLORD_PATH), true);
assert.notEqual(smallLandlord.title, landlord.title);
assert.notEqual(smallLandlord.title, simpleLandlord.title);
assert.notEqual(smallLandlord.description, landlord.description);
assert.notEqual(smallLandlord.description, simpleLandlord.description);
assert.notEqual(SMALL_LANDLORD_FAQ[0]?.q, LANDLORD_SOFTWARE_FAQ[0]?.q);
assert.notEqual(SMALL_LANDLORD_FAQ[0]?.q, SIMPLE_LANDLORD_FAQ[0]?.q);

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

const simpleHtml = applySeoToHtml(html, SIMPLE_LANDLORD_PATH);
assert.match(simpleHtml, /<title>Landlord Software for Rental Property Management \| Rentelyo<\/title>/);
assert.match(simpleHtml, /<link rel="canonical" href="https:\/\/rentelyo.com\/landlord-software" \/>/);
assert.match(simpleHtml, /<meta name="robots" content="index, follow" \/>/);
assert.match(
  simpleHtml,
  /<meta name="description" content="Simple landlord software to manage properties, tenants, leases, rent, expenses, maintenance and documents in one organized workspace." \/>/,
);
assert.match(simpleHtml, /<meta property="og:title" content="Landlord Software for Rental Property Management \| Rentelyo" \/>/);
assert.match(simpleHtml, /<meta property="og:url" content="https:\/\/rentelyo.com\/landlord-software" \/>/);
assert.doesNotMatch(simpleHtml, /property-management-software-for-landlords/);
assert.doesNotMatch(landingHtml, /https:\/\/rentelyo\.com\/landlord-software/);

const simpleJsonLd = jsonLdForPath(SIMPLE_LANDLORD_PATH);
assert.ok(simpleJsonLd && typeof simpleJsonLd === 'object');
const simpleGraph = (simpleJsonLd as { '@graph': Array<Record<string, unknown>> })['@graph'];
assert.equal(simpleGraph[0]?.['@type'], 'SoftwareApplication');
assert.equal(simpleGraph[0]?.url, 'https://rentelyo.com/landlord-software');
assert.equal(simpleGraph[1]?.['@type'], 'FAQPage');
assert.equal((simpleGraph[1]?.mainEntity as unknown[]).length, SIMPLE_LANDLORD_FAQ.length);
const simpleBlob = JSON.stringify(simpleJsonLd);
assert.match(simpleBlob, /What is landlord software\?/);
assert.match(simpleBlob, /Can I use Rentelyo instead of a spreadsheet\?/);
assert.match(simpleBlob, /currently tracks rent payments but does not process tenant rent payments/);
assert.match(simpleBlob, /not a listing website, marketplace or tenant-acquisition service/);
assert.doesNotMatch(simpleBlob, /What is property management software for landlords\?/);
assert.doesNotMatch(simpleBlob, /AggregateRating/);
assert.doesNotMatch(simpleBlob, /"@type":"Review"/);
assert.doesNotMatch(robots, /property-management-software-for-landlords/);
assert.doesNotMatch(robots, /landlord-software/);
assert.doesNotMatch(robots, /property-management-software-for-small-landlords/);

const smallHtml = applySeoToHtml(html, SMALL_LANDLORD_PATH);
assert.match(smallHtml, /<title>Property Management Software for Small Landlords \| Rentelyo<\/title>/);
assert.match(
  smallHtml,
  /<link rel="canonical" href="https:\/\/rentelyo.com\/property-management-software-for-small-landlords" \/>/,
);
assert.match(smallHtml, /<meta name="robots" content="index, follow" \/>/);
assert.match(
  smallHtml,
  /<meta name="description" content="Simple property management software for small landlords. Manage rentals, tenants, leases, rent, expenses, maintenance and documents with Rentelyo." \/>/,
);
assert.match(smallHtml, /<meta property="og:title" content="Property Management Software for Small Landlords \| Rentelyo" \/>/);
assert.match(
  smallHtml,
  /<meta property="og:url" content="https:\/\/rentelyo.com\/property-management-software-for-small-landlords" \/>/,
);
assert.doesNotMatch(smallHtml, /https:\/\/rentelyo\.com\/landlord-software/);
assert.doesNotMatch(
  smallHtml,
  /https:\/\/rentelyo\.com\/property-management-software-for-landlords/,
);
assert.doesNotMatch(landingHtml, /property-management-software-for-small-landlords/);
assert.doesNotMatch(simpleHtml, /property-management-software-for-small-landlords/);

const smallJsonLd = jsonLdForPath(SMALL_LANDLORD_PATH);
assert.ok(smallJsonLd && typeof smallJsonLd === 'object');
const smallGraph = (smallJsonLd as { '@graph': Array<Record<string, unknown>> })['@graph'];
assert.equal(smallGraph[0]?.['@type'], 'SoftwareApplication');
assert.equal(smallGraph[0]?.url, 'https://rentelyo.com/property-management-software-for-small-landlords');
assert.equal(smallGraph[1]?.['@type'], 'FAQPage');
assert.equal((smallGraph[1]?.mainEntity as unknown[]).length, SMALL_LANDLORD_FAQ.length);
const smallBlob = JSON.stringify(smallJsonLd);
assert.match(smallBlob, /What is property management software for small landlords\?/);
assert.match(smallBlob, /Do I need property management software if I only own a few rentals\?/);
assert.match(smallBlob, /helps landlords track and record rent payments. It does not process tenant rent payments online/);
assert.match(smallBlob, /not a listing website, marketplace or tenant-acquisition service/);
assert.doesNotMatch(smallBlob, /What is landlord software\?/);
assert.doesNotMatch(smallBlob, /What is property management software for landlords\?/);
assert.doesNotMatch(smallBlob, /AggregateRating/);
assert.doesNotMatch(smallBlob, /"@type":"Review"/);

console.log('seo tests ok');
