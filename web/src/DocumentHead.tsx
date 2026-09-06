import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { jsonLdForPath, LANDLORD_SOFTWARE_PATH, seoForPath } from '@seo';

const OG_KEYS = ['og:title', 'og:description', 'og:url', 'og:type', 'og:site_name', 'og:locale'] as const;

function upsertMeta(attr: 'name' | 'property', key: string, content: string, managed = false) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  if (managed) el.setAttribute('data-seo-og', 'true');
  el.setAttribute('content', content);
}

function clearLandlordHead() {
  document.head.querySelectorAll('meta[data-seo-og="true"]').forEach((el) => el.remove());
  for (const key of OG_KEYS) {
    document.head.querySelector(`meta[property="${key}"]`)?.remove();
  }
  document.getElementById('rentelyo-jsonld')?.remove();
}

function upsertJsonLd(data: unknown | null) {
  let el = document.getElementById('rentelyo-jsonld') as HTMLScriptElement | null;
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'rentelyo-jsonld';
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function DocumentHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = seoForPath(pathname);
    document.title = seo.title;

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seo.canonical);

    upsertMeta('name', 'robots', seo.robots);
    upsertMeta('name', 'description', seo.description);

    if (seo.canonical.endsWith(LANDLORD_SOFTWARE_PATH)) {
      upsertMeta('property', 'og:title', seo.title, true);
      upsertMeta('property', 'og:description', seo.description, true);
      upsertMeta('property', 'og:url', seo.canonical, true);
      upsertMeta('property', 'og:type', 'website', true);
      upsertMeta('property', 'og:site_name', 'Rentelyo', true);
      upsertMeta('property', 'og:locale', 'en_US', true);
      upsertJsonLd(jsonLdForPath(pathname));
    } else {
      clearLandlordHead();
    }
  }, [pathname]);

  return null;
}
