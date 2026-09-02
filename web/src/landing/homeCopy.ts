/** Home landing copy. Extra keys serve /features, /help and /security. */
export const homeEn = {
  organize: {
    title: 'Your rental management, finally organised',
    body: 'Vacant or rented properties, contracts, payments, expenses and maintenance: all the important information on one clear dashboard.',
    imageAlt: 'Rentelyo dashboard with properties, rent collected and actions to handle',
  },
  product: {
    kicker: 'All your management in one place',
    title: 'Run your rentals with ease',
    body: 'Vacant or rented properties, contracts, payments, expenses and maintenance: all the important information on one clear dashboard.',
    cta: 'Discover Rentelyo',
    imageAlt: 'Rentelyo dashboard showing properties, collected rent and tasks',
    chips: [
      { title: 'Rent collected', value: '€3,130' },
      { title: 'Late payments', value: '1' },
      { title: 'Maintenance to handle', value: '3' },
    ],
  },
  how: {
    kicker: 'Get started quickly',
    title: 'Your rental management in three steps',
    steps: [
      {
        title: 'Add your property',
        body: 'Enter its address, status, rent, charges and availability.',
      },
      {
        title: 'Add the tenant and the lease',
        body: 'Create the tenant record and upload the contract with its annexes.',
      },
      {
        title: 'Follow the whole rental',
        body: 'Manage payments, expenses, maintenance and upcoming due dates.',
      },
    ],
  },
  features: {
    kicker: 'The essentials, without the clutter',
    title: 'Everything you need to manage your properties',
    body: 'Rentelyo brings every step of rental management into a simple, organised interface.',
    items: [
      { title: 'Properties', body: 'Manage homes that are vacant or rented.' },
      { title: 'Tenants', body: 'Keep their details and leases in one place.' },
      { title: 'Rent', body: 'Track payments and overdue amounts.' },
      { title: 'Expenses', body: 'Record charges and repairs.' },
      { title: 'Maintenance', body: 'Plan and follow up on jobs.' },
      { title: 'Documents', body: 'Store all your files together.' },
    ],
  },
  bento: {
    properties: {
      title: 'All your properties in one place',
      body: 'Add apartments, houses, offices or commercial units and track their status: vacant, rented, in notice or under works.',
      imageAlt: 'Property list in Rentelyo',
    },
    tenants: {
      title: 'Tenants and leases',
      body: 'Keep contact details, lease dates, amounts and related documents together.',
    },
    rent: {
      title: 'Rent tracking',
      body: 'See due dates, payments received, partial settlements and arrears.',
      late: 'Overdue',
    },
    documents: {
      title: 'Documents ready in a few clicks',
      body: 'Generate receipts, certificates, reminders and increase notices from information you already saved.',
    },
    expenses: {
      title: 'Income and expenses',
      body: 'Track income, charges and the real result of each property.',
    },
    maintenance: {
      title: 'Maintenance and repairs',
      body: 'Plan jobs and keep quotes, invoices and photos.',
    },
  },
  documents: {
    kicker: 'Your rental documents',
    title: 'Generate certificates without retyping information',
    body: 'Property, tenant and payment data is reused to create clean documents that are easy to find again.',
    cta: 'Discover documents',
    imageAlt: 'A landlord working in Rentelyo on a laptop',
    checks: [
      'Payment receipts',
      'Rent certificates',
      'Payment reminders',
      'Increase notices',
      'Rent statements',
      'Expense summaries',
    ],
  },
  control: {
    title: 'Never miss a due date',
    body: 'Rentelyo helps you spot overdue rent, leases coming to an end, maintenance to carry out and scheduled rent increases.',
  },
  trust: {
    title: 'Your rentals stay organised and confidential',
    body: 'Rentelyo helps you find information quickly while protecting the data of your properties, contracts and tenants.',
    items: [
      'Secure sign-in',
      'Protected documents',
      'Data isolated between accounts',
      'Works on every device',
    ],
  },
  finalCta: {
    title: 'Ready to simplify your rentals?',
    body: 'Add your first property, centralise your contracts and start tracking rent from a single workspace.',
    primary: 'Create my account',
    secondary: 'See features',
    note: '1 property free · No credit card required',
  },
  faqHome: {
    title: 'Frequently asked questions',
    items: [
      {
        q: 'Can I use Rentelyo with a single property?',
        a: 'Yes. Rentelyo suits landlords with one unit as well as investors managing several properties.',
      },
      {
        q: 'Can I manage several properties?',
        a: 'Yes. You can centralise your properties and follow income, expenses, documents and operations for each one.',
      },
      {
        q: 'Can I keep documents in the app?',
        a: 'Yes. You can store leases, invoices, contracts, inventories and other proofs in one library.',
      },
      {
        q: 'Is my data secure?',
        a: 'Rentelyo applies security measures designed to protect your personal, contractual and financial information.',
      },
      {
        q: 'Can I use Rentelyo on mobile?',
        a: 'Yes. The interface works on a computer, tablet or phone.',
      },
    ],
    cta: 'See all questions',
  },
  security: {
    title: 'Your property data stays confidential',
    lede: 'Your financial, contractual and personal information is protected with appropriate security measures.',
    items: [
      'Secure sign-in',
      'Encrypted traffic (HTTPS)',
      'Data isolated between accounts',
      'Access control',
      'No commercial sharing of your data',
    ],
    cta: 'Learn more about security',
  },
} as const;

export const homeFr = {
  organize: {
    title: 'Votre gestion locative, enfin organisée',
    body: 'Biens disponibles ou loués, contrats, paiements, dépenses et entretiens : retrouvez toutes les informations importantes sur un tableau de bord clair.',
    imageAlt: 'Tableau de bord Rentelyo avec biens, loyers encaissés et actions à traiter',
  },
  product: {
    kicker: 'Toute votre gestion au même endroit',
    title: 'Pilotez vos locations en toute simplicité',
    body: 'Biens disponibles ou loués, contrats, paiements, dépenses et entretiens : retrouvez toutes les informations importantes sur un tableau de bord clair.',
    cta: 'Découvrir Rentelyo',
    imageAlt: 'Tableau de bord Rentelyo avec biens, loyers encaissés et actions à traiter',
    chips: [
      { title: 'Loyers encaissés', value: '3 130 €' },
      { title: 'Paiements en retard', value: '1' },
      { title: 'Entretiens à traiter', value: '3' },
    ],
  },
  how: {
    kicker: 'Commencez rapidement',
    title: 'Votre gestion locative en trois étapes',
    steps: [
      {
        title: 'Ajoutez votre bien',
        body: 'Renseignez son adresse, son statut, son loyer, ses charges et sa disponibilité.',
      },
      {
        title: 'Ajoutez le locataire et le contrat',
        body: 'Créez la fiche du locataire et chargez le contrat avec ses annexes.',
      },
      {
        title: 'Suivez toute la location',
        body: 'Gérez les paiements, les dépenses, les entretiens et les prochaines échéances.',
      },
    ],
  },
  features: {
    kicker: 'L’essentiel, sans complexité',
    title: 'Tout ce qu’il faut pour gérer vos biens',
    body: 'Rentelyo centralise chaque étape de votre gestion locative dans une interface simple et organisée.',
    items: [
      { title: 'Biens', body: 'Gérez vos logements disponibles ou loués.' },
      { title: 'Locataires', body: 'Centralisez leurs informations et contrats.' },
      { title: 'Loyers', body: 'Suivez les paiements et les retards.' },
      { title: 'Dépenses', body: 'Enregistrez les charges et réparations.' },
      { title: 'Entretien', body: 'Planifiez et suivez les interventions.' },
      { title: 'Documents', body: 'Conservez tous vos fichiers au même endroit.' },
    ],
  },
  bento: {
    properties: {
      title: 'Tous vos biens au même endroit',
      body: 'Ajoutez vos appartements, maisons, bureaux ou locaux et suivez leur statut : disponible, loué, en préavis ou en travaux.',
      imageAlt: 'Liste des biens dans Rentelyo',
    },
    tenants: {
      title: 'Locataires et contrats',
      body: 'Centralisez les coordonnées, les dates du bail, les montants et les documents associés.',
    },
    rent: {
      title: 'Suivi des loyers',
      body: 'Visualisez les échéances, les paiements reçus, les règlements partiels et les retards.',
      late: 'En retard',
    },
    documents: {
      title: 'Documents prêts en quelques clics',
      body: 'Générez vos reçus, justificatifs, rappels et avis d’augmentation à partir des informations enregistrées.',
    },
    expenses: {
      title: 'Revenus et dépenses',
      body: 'Suivez les revenus, les charges et le résultat réel de chacun de vos biens.',
    },
    maintenance: {
      title: 'Entretien et réparations',
      body: 'Planifiez les interventions et conservez les devis, factures et photos.',
    },
  },
  documents: {
    kicker: 'Vos documents locatifs',
    title: 'Générez vos justificatifs sans ressaisir les informations',
    body: 'Les données de vos biens, locataires et paiements sont automatiquement reprises pour créer des documents propres et faciles à retrouver.',
    cta: 'Découvrir les documents',
    imageAlt: 'Un propriétaire travaille dans Rentelyo sur son ordinateur',
    checks: [
      'Reçus de paiement',
      'Justificatifs de loyer',
      'Rappels de paiement',
      'Avis d’augmentation',
      'Relevés des loyers',
      'Résumés des dépenses',
    ],
  },
  control: {
    title: 'Ne manquez plus aucune échéance',
    body: 'Rentelyo vous aide à repérer les loyers en retard, les contrats qui arrivent à échéance, les entretiens à réaliser et les augmentations de loyer programmées.',
  },
  trust: {
    title: 'Vos locations restent organisées et confidentielles',
    body: 'Rentelyo vous aide à retrouver rapidement vos informations tout en protégeant les données de vos biens, contrats et locataires.',
    items: [
      'Connexion sécurisée',
      'Documents protégés',
      'Données séparées entre les comptes',
      'Accessible sur tous les appareils',
    ],
  },
  finalCta: {
    title: 'Prêt à simplifier vos locations ?',
    body: 'Ajoutez votre premier bien, centralisez vos contrats et commencez à suivre vos loyers depuis un seul espace.',
    primary: 'Créer mon compte',
    secondary: 'Voir les fonctionnalités',
    note: '1 bien gratuit · Aucune carte bancaire requise',
  },
  faqHome: {
    title: 'Questions fréquentes',
    items: [
      {
        q: 'Puis-je utiliser Rentelyo avec un seul bien ?',
        a: 'Oui. Rentelyo convient aussi bien aux propriétaires d’un seul logement qu’aux investisseurs gérant plusieurs propriétés.',
      },
      {
        q: 'Puis-je gérer plusieurs propriétés ?',
        a: 'Oui. Vous pouvez centraliser vos propriétés et suivre séparément les revenus, les dépenses, les documents et les opérations de chaque bien.',
      },
      {
        q: 'Puis-je conserver mes documents dans l’application ?',
        a: 'Oui. Vous pouvez regrouper vos baux, factures, contrats, états des lieux et autres justificatifs dans l’espace correspondant.',
      },
      {
        q: 'Mes données sont-elles sécurisées ?',
        a: 'Rentelyo applique des mesures de sécurité destinées à protéger vos informations personnelles, contractuelles et financières.',
      },
      {
        q: 'Puis-je utiliser Rentelyo sur mobile ?',
        a: 'Oui. L’interface est accessible depuis un ordinateur, une tablette ou un téléphone mobile.',
      },
    ],
    cta: 'Consulter toutes les questions',
  },
  security: {
    title: 'Vos données immobilières restent confidentielles',
    lede: 'Vos informations financières, contractuelles et personnelles sont protégées par des mesures de sécurité adaptées.',
    items: [
      'Connexion sécurisée',
      'Chiffrement des échanges (HTTPS)',
      'Séparation des données entre les comptes',
      'Contrôle des accès',
      'Aucun partage commercial des données',
    ],
    cta: 'En savoir plus sur la sécurité',
  },
} as const;
