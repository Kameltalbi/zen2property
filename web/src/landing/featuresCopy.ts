export type FeaturesPageCopy = {
  hero: {
    kicker: string;
    title: string;
    body: string;
    primary: string;
    secondary: string;
    note: string;
    imageAlt: string;
    chips: [string, string];
  };
  properties: {
    kicker: string;
    title: string;
    body: string;
    imageAlt: string;
    checks: string[];
    badges: string[];
  };
  tenants: {
    kicker: string;
    title: string;
    body: string;
    imageAlt: string;
    cards: { title: string; body: string }[];
    footnote: string;
  };
  rents: {
    kicker: string;
    title: string;
    body: string;
    cards: { title: string; body: string }[];
    pdfTitle: string;
    pdfItems: string[];
    pdfNote: string;
    receiptAlt: string;
  };
  daily: {
    kicker: string;
    title: string;
    maintenance: { title: string; body: string; statuses: string[] };
    expenses: {
      title: string;
      body: string;
      income: string;
      spend: string;
      net: string;
      disclaimer: string;
    };
    increase: {
      title: string;
      body: string;
      current: string;
      planned: string;
      date: string;
      disclaimer: string;
    };
  };
  cta: {
    title: string;
    body: string;
    primary: string;
    secondary: string;
    note: string;
  };
};

export const featuresEn: FeaturesPageCopy = {
  hero: {
    kicker: 'Features',
    title: 'Manage every step of your rental in one place',
    body: 'From a vacant property to rent tracking, Rentelyo keeps tenants, contracts, payments, expenses and maintenance in a simple interface.',
    primary: 'Create my account',
    secondary: 'See how it works',
    note: '1 property free · No credit card required',
    imageAlt: 'Rentelyo dashboard showing properties and rent tracking',
    chips: ['Rent received', 'Lease to renew'],
  },
  properties: {
    kicker: 'Your properties',
    title: 'Follow each property, whether it is vacant or already rented',
    body: 'Add every property, set its details and see its rental situation at a glance.',
    imageAlt: 'Property record in Rentelyo with address, rent and current lease',
    checks: [
      'Apartments, houses, studios and other properties',
      'Address, surface and main information',
      'Vacant, rented or personal-use status',
      'Rent amount and charges',
      'Security deposit on the lease',
    ],
    badges: ['To let', 'Rented', 'Personal use'],
  },
  tenants: {
    kicker: 'Tenants and leases',
    title: 'Rental information stays connected',
    body: 'Create the tenant record, add the lease and keep the key details in the same place.',
    imageAlt: 'Lease record in Rentelyo with dates, rent and payment day',
    cards: [
      {
        title: 'Tenant record',
        body: 'Name, email, phone, security deposit and move-in date.',
      },
      {
        title: 'Tenancy agreement',
        body: 'Dates, rent, charges, deposit, frequency and payment day.',
      },
      {
        title: 'Related documents',
        body: 'Generate a PDF payment receipt from information already saved.',
      },
      {
        title: 'Linked to the property',
        body: 'Each lease connects one tenant to one property, with a draft, active or ended status.',
      },
    ],
    footnote:
      'The tenant, property and lease stay linked. You then record each rent due date in payment tracking.',
  },
  rents: {
    kicker: 'Rent tracking',
    title: 'See immediately what is paid and what is still due',
    body: 'Each due date is tracked separately so you keep a clear history of every payment.',
    cards: [
      {
        title: 'Recorded due dates',
        body: 'Log each rent with its amount, period and due date from the lease.',
      },
      {
        title: 'Paid or still due',
        body: 'Mark a rent as paid or leave it pending. A receipt is issued only for a fully paid rent.',
      },
      {
        title: 'Overdue rents in view',
        body: 'Spot rents that have reached their due date and are still unpaid.',
      },
      {
        title: 'History kept',
        body: 'Find each payment with its date, amount and status.',
      },
    ],
    pdfTitle: 'Generate documents without re-entering information',
    pdfItems: ['Payment receipt'],
    pdfNote: 'The PDF receipt is available only when the rent is fully paid. A partial payment is never shown as settled.',
    receiptAlt: 'Preview of a Rentelyo payment receipt',
  },
  daily: {
    kicker: 'Day-to-day management',
    title: 'Stay in control beyond the rent',
    maintenance: {
      title: 'Follow each job through to completion',
      body: 'Log the issue, schedule the work and track progress until it is closed.',
      statuses: ['New', 'Planned', 'In progress', 'Done'],
    },
    expenses: {
      title: 'Know the result of each property',
      body: 'Record insurance, taxes, charges, works and repairs to follow income and expenses.',
      income: 'Income',
      spend: 'Expenses',
      net: 'Net result',
      disclaimer: 'This overview is a management aid, not official accounting.',
    },
    increase: {
      title: 'Schedule rent changes',
      body: 'Enter the planned increase and its application date on the lease. Always check the rules in your country first.',
      current: 'Current rent',
      planned: 'Planned increase',
      date: 'Application date',
      disclaimer: 'Rentelyo does not confirm that an increase is legally allowed.',
    },
  },
  cta: {
    title: 'Complete management without complicated software',
    body: 'Add your first property and keep your rentals, leases, rent and documents in Rentelyo.',
    primary: 'Start for free',
    secondary: 'See pricing',
    note: '1 property free · No credit card required',
  },
};

export const featuresFr: FeaturesPageCopy = {
  hero: {
    kicker: 'Fonctionnalités',
    title: 'Gérez chaque étape de votre location dans un seul espace',
    body: 'Du bien disponible au suivi des loyers, Rentelyo centralise vos locataires, contrats, paiements, dépenses et entretiens dans une interface simple.',
    primary: 'Créer mon compte',
    secondary: 'Voir comment ça fonctionne',
    note: '1 bien gratuit · Aucune carte bancaire requise',
    imageAlt: 'Tableau de bord Rentelyo avec les biens et le suivi des loyers',
    chips: ['Loyer reçu', 'Contrat à renouveler'],
  },
  properties: {
    kicker: 'Vos biens',
    title: 'Suivez vos biens, qu’ils soient disponibles ou déjà loués',
    body: 'Ajoutez chaque propriété, définissez ses caractéristiques et retrouvez immédiatement sa situation locative.',
    imageAlt: 'Fiche d’un bien dans Rentelyo avec l’adresse, le loyer et le contrat en cours',
    checks: [
      'Appartements, maisons, studios et autres biens',
      'Adresse, surface et informations principales',
      'Statut à louer, loué ou usage personnel',
      'Prix de location et charges',
      'Dépôt de garantie sur le contrat',
    ],
    badges: ['À louer', 'Loué', 'Usage perso'],
  },
  tenants: {
    kicker: 'Locataires et contrats',
    title: 'Toutes les informations de la location restent liées',
    body: 'Créez la fiche du locataire, ajoutez le contrat et conservez les informations importantes au même endroit.',
    imageAlt: 'Fiche de contrat Rentelyo avec dates, loyer et jour de paiement',
    cards: [
      {
        title: 'Fiche du locataire',
        body: 'Nom, e-mail, téléphone, dépôt de garantie et date d’entrée.',
      },
      {
        title: 'Contrat de location',
        body: 'Dates, loyer, charges, dépôt de garantie, fréquence et jour de paiement.',
      },
      {
        title: 'Documents associés',
        body: 'Générez le reçu de paiement PDF à partir des informations déjà enregistrées.',
      },
      {
        title: 'Lien avec le bien',
        body: 'Chaque contrat relie un locataire à un bien, avec un statut brouillon, actif ou terminé.',
      },
    ],
    footnote:
      'Le locataire, le bien et le contrat restent liés. Vous enregistrez ensuite chaque échéance de loyer dans le suivi des paiements.',
  },
  rents: {
    kicker: 'Suivi des loyers',
    title: 'Voyez immédiatement ce qui est payé et ce qui reste à recevoir',
    body: 'Chaque échéance est suivie séparément afin de conserver un historique clair de tous les paiements.',
    cards: [
      {
        title: 'Échéances enregistrées',
        body: 'Saisissez chaque loyer avec son montant, sa période et sa date d’échéance.',
      },
      {
        title: 'Payé ou en attente',
        body: 'Marquez un loyer comme payé ou laissez-le en attente. Un reçu n’est émis que pour un paiement intégral.',
      },
      {
        title: 'Retards visibles',
        body: 'Identifiez rapidement les loyers arrivés à échéance et non réglés.',
      },
      {
        title: 'Historique conservé',
        body: 'Retrouvez chaque paiement avec sa date, son montant et son statut.',
      },
    ],
    pdfTitle: 'Générez vos documents sans ressaisir les informations',
    pdfItems: ['Reçu de paiement'],
    pdfNote:
      'Le reçu PDF n’est disponible que lorsque le loyer est intégralement payé. Un paiement partiel n’est jamais présenté comme un loyer soldé.',
    receiptAlt: 'Aperçu d’un reçu de paiement Rentelyo',
  },
  daily: {
    kicker: 'Gestion quotidienne',
    title: 'Gardez le contrôle au-delà des loyers',
    maintenance: {
      title: 'Suivez chaque intervention jusqu’à sa réalisation',
      body: 'Enregistrez le problème, planifiez l’intervention et suivez son avancement jusqu’à la clôture.',
      statuses: ['Nouveau', 'Planifié', 'En cours', 'Terminé'],
    },
    expenses: {
      title: 'Connaissez le résultat de chaque bien',
      body: 'Enregistrez les assurances, taxes, charges, travaux et réparations pour suivre vos revenus et dépenses.',
      income: 'Revenus',
      spend: 'Dépenses',
      net: 'Résultat net',
      disclaimer: 'Ce suivi est un aide-mémoire, pas une comptabilité officielle.',
    },
    increase: {
      title: 'Programmez les changements de loyer',
      body: 'Indiquez l’augmentation prévue et sa date d’application sur le contrat. Vérifiez d’abord les règles de votre pays.',
      current: 'Loyer actuel',
      planned: 'Augmentation prévue',
      date: 'Date d’application',
      disclaimer: 'Rentelyo ne confirme pas qu’une augmentation est légalement autorisée.',
    },
  },
  cta: {
    title: 'Une gestion complète sans logiciel compliqué',
    body: 'Ajoutez votre premier bien et centralisez vos locations, contrats, loyers et documents dans Rentelyo.',
    primary: 'Commencer gratuitement',
    secondary: 'Découvrir les tarifs',
    note: '1 bien gratuit · Aucune carte bancaire requise',
  },
};
