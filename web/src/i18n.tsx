import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Locale = 'en' | 'fr';

const KEY = 'zen2property.locale';

const messages = {
  en: {
    nav: {
      features: 'Features',
      pricing: 'Pricing',
      faq: 'FAQ',
      login: 'Log in',
      start: 'Start free',
      openApp: 'Open app',
      menu: 'Menu',
      close: 'Close',
    },
    footer: {
      blurb: 'English or French interface. Receipts follow each property’s country rules.',
      product: 'Product',
      account: 'Account',
      legal: 'Legal',
      privacy: 'Privacy',
      terms: 'Terms',
      reset: 'Reset password',
    },
    hero: {
      kicker: 'International property OS',
      title: 'Simplify Your Property Management',
      lede: 'Track units, tenants and rent in one workspace. Generate country-aware PDF receipts. An AI engine may propose local rules — it never applies them silently.',
      cta: 'Start with two units free',
      seePlans: 'See plans',
      panelKicker: 'This month',
      panelTitle: 'Collected vs expected, at a glance.',
      panelBody: 'Occupied and vacant units, late payments, and receipts that freeze the legal rule version used on the day they were issued.',
    },
    features: {
      kicker: 'Features',
      title: 'Management, receipts, and multi-country rules.',
      manageTitle: 'Portfolio management',
      manageBody: 'Properties, tenants and rent tracking in one place. Occupancy, due dates and late payments stay visible.',
      receiptTitle: 'Legal receipts',
      receiptBody: 'Paid rent becomes a clean PDF. Required fields come from the country profile. Missing data fails closed — no invented clauses.',
      countryTitle: 'Multi-country',
      countryBody: 'Each property has its own country. Detailed legal profiles exist for some markets; others start from a generic receipt template you can refine.',
    },
    faq: {
      kicker: 'FAQ',
      title: 'Compliance and AI, in plain terms.',
      q1: 'Does Zen2Property replace a lawyer?',
      a1: 'No. Country profiles encode known receipt and deposit rules so the product can block an incomplete document. You remain responsible for the lease and local advice.',
      q2: 'How do receipts stay legally consistent?',
      a2: 'Generation reads the active legal profile for the property’s country. The PDF stores a snapshot of those rules. A later law change does not rewrite receipts already issued.',
      q3: 'What does the AI actually do?',
      a3: 'It can propose a JSON patch to a country’s rules (for example extra mandatory mentions). Drafts wait for human review. The AI never writes the text of a receipt at generation time.',
      q4: 'Which language is the app in?',
      a4: 'The public site follows this FR/EN toggle. The workspace UI is English-first; receipts use the language of the property’s legal profile (for example French titles for France).',
    },
    pricing: {
      kicker: 'Billing',
      title: 'Simple plans, Stripe-ready.',
      lede: 'Starter is free. Paid tiers unlock more units and the AI legal draft queue. Checkout uses Stripe when keys are present.',
      perMonth: '/ month',
      unlimited: 'Unlimited properties',
      units: 'properties',
      receipts: 'Country-aware PDF receipts',
      aiYes: 'AI legal drafts',
      aiNo: 'No AI legal drafts',
      current: 'Current plan',
      choose: 'Choose',
      start: 'Get started',
    },
    auth: {
      loginTitle: 'Log in',
      email: 'Email',
      password: 'Password',
      continue: 'Continue',
      forgot: 'Forgot password?',
      newHere: 'New here?',
      createAccount: 'Create an account',
      failed: 'Login failed',
      signupTitle: 'Create your workspace',
      signupLede: 'Legal rules follow the country you pick — you can change it later per property.',
      fullName: 'Full name',
      country: 'Primary country',
      startFree: 'Start free',
      already: 'Already registered?',
      signupFailed: 'Sign up failed',
      resetTitle: 'Reset your password',
      sendReset: 'Send reset link',
      resetSent: 'If that email exists, a reset link is on its way.',
      resetDev: 'Development reset link:',
      newPasswordTitle: 'Choose a new password',
      newPassword: 'New password',
      updatePassword: 'Update password',
      passwordUpdated: 'Password updated. You can log in now.',
      resetFailed: 'Reset failed',
    },
    legal: {
      kicker: 'Legal',
      privacyTitle: 'Privacy',
      privacy1: 'Zen2Property stores the account you create (name, email, password hash) and the property, tenant, and payment data you enter. Receipt PDFs are generated on the server and kept for your workspace.',
      privacy2: 'Legal-country rules are product configuration, not personal data. We do not sell owner or tenant records. Stripe, when connected, processes card details off our servers.',
      privacyNote: 'This page will be expanded before public launch to match the live processors and hosting region.',
      termsTitle: 'Terms',
      terms1: 'Zen2Property is a workspace for property owners. You are responsible for the accuracy of rents, tenant details, and documents you generate. Country legal profiles are helpers: they do not replace a lawyer.',
      terms2: 'The Starter plan is limited to two properties. Paid plans are defined on the pricing page. We may suspend an account that abuses the API or stores unlawful content.',
      termsNote: 'Full commercial terms will be published before paid checkout goes live.',
    },
  },
  fr: {
    nav: {
      features: 'Fonctionnalités',
      pricing: 'Tarifs',
      faq: 'FAQ',
      login: 'Connexion',
      start: 'Essai gratuit',
      openApp: 'Ouvrir l’app',
      menu: 'Menu',
      close: 'Fermer',
    },
    footer: {
      blurb: 'Interface FR ou EN. Les quittances suivent les règles du pays de chaque bien.',
      product: 'Produit',
      account: 'Compte',
      legal: 'Mentions',
      privacy: 'Confidentialité',
      terms: 'CGU',
      reset: 'Mot de passe oublié',
    },
    hero: {
      kicker: 'OS locatif international',
      title: 'Simplifiez la gestion de vos biens',
      lede: 'Biens, locataires et loyers dans un seul espace. Quittances PDF selon le pays. L’IA peut proposer des règles locales — elle ne les applique jamais toute seule.',
      cta: 'Deux biens offerts',
      seePlans: 'Voir les tarifs',
      panelKicker: 'Ce mois-ci',
      panelTitle: 'Encaissé vs attendu, d’un coup d’œil.',
      panelBody: 'Occupation, retards, et quittances qui figent la version des règles utilisées le jour de l’émission.',
    },
    features: {
      kicker: 'Fonctionnalités',
      title: 'Gestion, quittances, multi-pays.',
      manageTitle: 'Gestion locative',
      manageBody: 'Biens, locataires et suivi des loyers au même endroit. Occupation, échéances et retards restent visibles.',
      receiptTitle: 'Quittances',
      receiptBody: 'Un loyer payé devient un PDF. Les champs obligatoires viennent du profil pays. Donnée manquante = refus, pas de clause inventée.',
      countryTitle: 'Multi-pays',
      countryBody: 'Chaque bien a son pays. Des profils légaux détaillés existent pour certains marchés ; les autres partent d’un modèle de quittance générique, à affiner ensuite.',
    },
    faq: {
      kicker: 'FAQ',
      title: 'Conformité et IA, sans jargon.',
      q1: 'Zen2Property remplace-t-il un avocat ?',
      a1: 'Non. Les profils pays encodent des règles de quittance et de dépôt pour bloquer un document incomplet. Le bail et le conseil local restent de votre responsabilité.',
      q2: 'Comment les quittances restent-elles cohérentes ?',
      a2: 'La génération lit le profil légal actif du pays du bien. Le PDF stocke un instantané de ces règles. Un changement de loi ultérieur ne réécrit pas les quittances déjà émises.',
      q3: 'Que fait vraiment l’IA ?',
      a3: 'Elle peut proposer un correctif JSON aux règles d’un pays (mentions obligatoires, etc.). Les brouillons attendent une revue humaine. L’IA n’écrit jamais le texte d’une quittance au moment de l’émission.',
      q4: 'Dans quelle langue est l’outil ?',
      a4: 'Le site public (accueil, tarifs, FAQ, connexion) suit le basculeur FR/EN. Les quittances PDF suivent la langue du profil légal du bien.',
    },
    pricing: {
      kicker: 'Tarifs',
      title: 'Des plans simples, prêts pour Stripe.',
      lede: 'Starter est gratuit. Les offres payantes débloquent plus de biens et la file de brouillons IA. Le paiement passe par Stripe dès que les clés sont branchées.',
      perMonth: '/ mois',
      unlimited: 'Biens illimités',
      units: 'biens',
      receipts: 'Quittances PDF selon le pays',
      aiYes: 'Brouillons légaux IA',
      aiNo: 'Pas de brouillons IA',
      current: 'Offre actuelle',
      choose: 'Choisir',
      start: 'Commencer',
    },
    auth: {
      loginTitle: 'Connexion',
      email: 'E-mail',
      password: 'Mot de passe',
      continue: 'Continuer',
      forgot: 'Mot de passe oublié ?',
      newHere: 'Nouveau ?',
      createAccount: 'Créer un compte',
      failed: 'Connexion impossible',
      signupTitle: 'Créer votre espace',
      signupLede: 'Les règles légales suivent le pays choisi — vous pourrez le changer plus tard par bien.',
      fullName: 'Nom complet',
      country: 'Pays principal',
      startFree: 'Essai gratuit',
      already: 'Déjà inscrit ?',
      signupFailed: 'Inscription impossible',
      resetTitle: 'Réinitialiser le mot de passe',
      sendReset: 'Envoyer le lien',
      resetSent: 'Si cet e-mail existe, un lien de réinitialisation a été envoyé.',
      resetDev: 'Lien de dev :',
      newPasswordTitle: 'Nouveau mot de passe',
      newPassword: 'Nouveau mot de passe',
      updatePassword: 'Enregistrer',
      passwordUpdated: 'Mot de passe mis à jour. Vous pouvez vous connecter.',
      resetFailed: 'Réinitialisation impossible',
    },
    legal: {
      kicker: 'Mentions',
      privacyTitle: 'Confidentialité',
      privacy1: 'Zen2Property conserve le compte que vous créez (nom, e-mail, hash du mot de passe) et les données de biens, locataires et paiements que vous saisissez. Les PDF de quittance sont générés côté serveur et restent dans votre espace.',
      privacy2: 'Les règles par pays sont de la configuration produit, pas des données personnelles. Nous ne vendons pas les fiches propriétaires ou locataires. Stripe, une fois branché, traite les cartes hors de nos serveurs.',
      privacyNote: 'Cette page sera complétée avant le lancement public (hébergeur et sous-traitants).',
      termsTitle: 'Conditions',
      terms1: 'Zen2Property est un espace pour propriétaires. Vous êtes responsable de l’exactitude des loyers, des locataires et des documents générés. Les profils légaux aident : ils ne remplacent pas un avocat.',
      terms2: 'L’offre Starter est limitée à deux biens. Les offres payantes sont décrites sur la page tarifs. Un compte qui abuse de l’API ou stocke un contenu illicite peut être suspendu.',
      termsNote: 'Les conditions commerciales complètes seront publiées avant l’ouverture du paiement Stripe.',
    },
  },
} as const;

type Messages = (typeof messages)[Locale];

type I18n = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Messages;
};

const Ctx = createContext<I18n | null>(null);

function readLocale(): Locale {
  const stored = localStorage.getItem(KEY);
  if (stored === 'fr' || stored === 'en') return stored;
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readLocale());

  useEffect(() => {
    localStorage.setItem(KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18n>(
    () => ({
      locale,
      setLocale: setLocaleState,
      t: messages[locale],
    }),
    [locale],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useI18n must be used within LocaleProvider');
  return ctx;
}
