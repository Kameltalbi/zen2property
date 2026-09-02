/** Landing page copy — kept separate to avoid bloating i18n.tsx */
export const homeEn = {
  trust: {
    aria: 'Why landlords choose Rentelyo',
    items: [
      { id: 'fast', title: 'Quick setup', body: 'Add a property and start tracking rent in minutes.' },
      { id: 'secure', title: 'Secure data', body: 'Your account is protected with secure sign-in.' },
      { id: 'devices', title: 'Works on every device', body: 'Use it on computer, tablet or phone.' },
      { id: 'nocard', title: 'No card to start', body: 'Create your free account without a payment method.' },
    ],
  },
  problem: {
    title: 'Rental management should not be complicated',
    lede: 'Between rent to track, expenses to record, documents to find and maintenance to organise, managing several properties quickly becomes time-consuming.',
    cards: [
      {
        title: 'Rent that is hard to follow',
        body: 'Scattered payments and late rents spotted too late.',
      },
      {
        title: 'Documents everywhere',
        body: 'Leases, invoices and proofs stored in different places.',
      },
      {
        title: 'Expenses poorly controlled',
        body: 'Little visibility on true cost and yield per property.',
      },
      {
        title: 'Disorganised maintenance',
        body: 'Requests, contractors and deadlines hard to coordinate.',
      },
    ],
    close: 'Rentelyo brings all your rental management into one place.',
  },
  dashboard: {
    title: 'Your rental portfolio at a glance',
    lede: 'See your properties, rent collected, payments due, expenses and actions to handle from a single dashboard.',
    highlights: ['Rental income', 'Rent to collect', 'Expenses', 'Occupancy rate'],
    cta: 'Discover the dashboard',
    imageAlt: 'Rentelyo dashboard showing portfolio KPIs and charts',
  },
  featureGrid: {
    title: 'Everything you need to manage your properties',
    lede: 'Centralise properties, finances, documents and day-to-day operations in one application.',
    items: [
      {
        title: 'Property management',
        body: 'Centralise information, photos, equipment and financial data for each property.',
      },
      {
        title: 'Rent tracking',
        body: 'Follow rent due, paid or late — property by property.',
      },
      {
        title: 'Income and expenses',
        body: 'Record transactions and measure the financial performance of each unit.',
      },
      {
        title: 'Documents',
        body: 'Keep leases, invoices, contracts, inventories and proofs in one place.',
      },
      {
        title: 'Maintenance',
        body: 'Track incidents, works, contractors, costs and ongoing jobs.',
      },
      {
        title: 'Calendar and reminders',
        body: 'Never miss a due date, renewal, visit or intervention.',
      },
    ],
    cta: 'See all features',
  },
  steps: {
    title: 'Start managing your properties in minutes',
    items: [
      {
        title: 'Add your first property',
        body: 'Enter the essential details of your unit.',
      },
      {
        title: 'Add tenants and rent',
        body: 'Centralise contracts, amounts and due dates.',
      },
      {
        title: 'Follow all your activity',
        body: 'Review income, expenses, documents and maintenance.',
      },
    ],
    cta: 'Create my account',
  },
  audience: {
    title: 'A solution that grows with your portfolio',
    items: [
      {
        title: 'Individual landlord',
        body: 'Simply manage your first rental investment and keep important information at hand.',
      },
      {
        title: 'Real-estate investor',
        body: 'Follow several properties, their income, expenses and performance from one workspace.',
      },
      {
        title: 'Portfolio manager',
        body: 'Organise a larger portfolio, its documents, deadlines and daily operations.',
      },
    ],
  },
  security: {
    title: 'Your rental data stays confidential',
    lede: 'Your financial, contractual and personal information is protected with appropriate security measures.',
    items: [
      'Secure sign-in',
      'Encrypted exchanges (HTTPS)',
      'Data separated between accounts',
      'Access control',
      'No commercial sharing of your data',
    ],
    cta: 'Learn more about security',
  },
  demo: {
    title: 'See Rentelyo in action',
    lede: 'Browse the main features and see how to centralise your rental management.',
    videoSlotNote: 'A product walkthrough video can be added here later.',
    slides: [
      {
        title: 'Dashboard',
        body: 'Portfolio overview, income, expenses and alerts in one view.',
        screen: 'dashboard',
      },
      {
        title: 'My properties',
        body: 'Each rented unit with status, rent and key details.',
        screen: 'properties',
      },
      {
        title: 'Rent tracking',
        body: 'Due, paid and late rents, property by property.',
        screen: 'rent',
      },
      {
        title: 'Income and expenses',
        body: 'Financial activity and cash-flow visibility.',
        screen: 'finances',
      },
      {
        title: 'Documents',
        body: 'Leases, receipts and proofs stored with the property.',
        screen: 'documents',
      },
      {
        title: 'Maintenance',
        body: 'Jobs, priorities and follow-up for works and repairs.',
        screen: 'maintenance',
      },
    ],
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
        a: 'Yes. You can centralise your properties and track income, expenses, documents and operations for each one separately.',
      },
      {
        q: 'Can I keep my documents in the app?',
        a: 'Yes. You can group leases, invoices, contracts, inventories and other proofs in the documents area.',
      },
      {
        q: 'Is my data secure?',
        a: 'Rentelyo applies security measures designed to protect your personal, contractual and financial information.',
      },
      {
        q: 'Can I use Rentelyo on mobile?',
        a: 'Yes. The interface works on computer, tablet and mobile phone.',
      },
    ],
    cta: 'See all questions',
  },
  finalCta: {
    title: 'Take back control of your rental management',
    lede: 'Centralise properties, rent, expenses and documents in a simple, secure workspace.',
    primary: 'Create my free account',
    secondary: 'Discover the features',
    note: 'No credit card required',
  },
} as const;

export const homeFr = {
  trust: {
    aria: 'Pourquoi choisir Rentelyo',
    items: [
      { id: 'fast', title: 'Configuration rapide', body: 'Ajoutez un bien et suivez les loyers en quelques minutes.' },
      { id: 'secure', title: 'Données sécurisées', body: 'Votre compte est protégé par une connexion sécurisée.' },
      { id: 'devices', title: 'Accessible sur tous les appareils', body: 'Utilisez-le sur ordinateur, tablette ou téléphone.' },
      { id: 'nocard', title: 'Sans carte bancaire pour commencer', body: 'Créez votre compte gratuit sans moyen de paiement.' },
    ],
  },
  problem: {
    title: 'La gestion locative ne devrait pas être compliquée',
    lede: 'Entre les loyers à suivre, les dépenses à enregistrer, les documents à retrouver et les interventions à organiser, la gestion de plusieurs biens devient rapidement chronophage.',
    cards: [
      {
        title: 'Loyers difficiles à suivre',
        body: 'Paiements dispersés et retards repérés trop tard.',
      },
      {
        title: 'Documents éparpillés',
        body: 'Baux, factures et justificatifs stockés à différents endroits.',
      },
      {
        title: 'Dépenses mal maîtrisées',
        body: 'Peu de visibilité sur le coût réel et la rentabilité de chaque propriété.',
      },
      {
        title: 'Maintenance désorganisée',
        body: 'Demandes, prestataires et échéances difficiles à coordonner.',
      },
    ],
    close: 'Rentelyo réunit toute votre gestion immobilière dans un seul espace.',
  },
  dashboard: {
    title: 'Votre portefeuille immobilier en un coup d’œil',
    lede: 'Visualisez vos propriétés, les loyers encaissés, les paiements attendus, les dépenses et les actions à traiter depuis un tableau de bord unique.',
    highlights: ['Revenus locatifs', 'Loyers à recevoir', 'Dépenses', 'Taux d’occupation'],
    cta: 'Découvrir le tableau de bord',
    imageAlt: 'Tableau de bord Rentelyo avec indicateurs et graphiques',
  },
  featureGrid: {
    title: 'Tout ce qu’il faut pour gérer vos propriétés',
    lede: 'Centralisez vos biens, vos finances, vos documents et vos opérations quotidiennes dans une seule application.',
    items: [
      {
        title: 'Gestion des biens',
        body: 'Centralisez les informations, photos, équipements et données financières de chaque propriété.',
      },
      {
        title: 'Suivi des loyers',
        body: 'Suivez les loyers attendus, encaissés ou en retard, propriété par propriété.',
      },
      {
        title: 'Revenus et dépenses',
        body: 'Enregistrez vos transactions et mesurez la performance financière de chaque bien.',
      },
      {
        title: 'Documents',
        body: 'Conservez vos baux, factures, contrats, états des lieux et justificatifs au même endroit.',
      },
      {
        title: 'Maintenance',
        body: 'Suivez les incidents, les travaux, les prestataires, les coûts et les interventions en cours.',
      },
      {
        title: 'Calendrier et rappels',
        body: 'Ne manquez plus une échéance, un renouvellement, une visite ou une intervention.',
      },
    ],
    cta: 'Voir toutes les fonctionnalités',
  },
  steps: {
    title: 'Commencez à gérer vos biens en quelques minutes',
    items: [
      {
        title: 'Ajoutez votre première propriété',
        body: 'Renseignez les informations essentielles de votre bien.',
      },
      {
        title: 'Ajoutez vos locataires et vos loyers',
        body: 'Centralisez les contrats, les montants et les échéances.',
      },
      {
        title: 'Suivez toute votre activité',
        body: 'Consultez vos revenus, vos dépenses, vos documents et vos interventions.',
      },
    ],
    cta: 'Créer mon compte',
  },
  audience: {
    title: 'Une solution qui évolue avec votre portefeuille',
    items: [
      {
        title: 'Propriétaire particulier',
        body: 'Gérez simplement votre premier investissement locatif et gardez toutes les informations importantes à portée de main.',
      },
      {
        title: 'Investisseur immobilier',
        body: 'Suivez plusieurs propriétés, leurs revenus, leurs dépenses et leur performance depuis un espace centralisé.',
      },
      {
        title: 'Gestionnaire de portefeuille',
        body: 'Organisez un portefeuille plus important, ses documents, ses échéances et ses opérations quotidiennes.',
      },
    ],
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
  demo: {
    title: 'Découvrez Rentelyo en action',
    lede: 'Parcourez les principales fonctionnalités et découvrez comment centraliser votre gestion locative.',
    videoSlotNote: 'Une vidéo de démonstration pourra être ajoutée ici plus tard.',
    slides: [
      {
        title: 'Tableau de bord',
        body: 'Vue d’ensemble du portefeuille, revenus, dépenses et alertes.',
        screen: 'dashboard',
      },
      {
        title: 'Mes biens',
        body: 'Chaque bien loué avec statut, loyer et informations clés.',
        screen: 'properties',
      },
      {
        title: 'Suivi des loyers',
        body: 'Loyers dus, payés ou en retard, bien par bien.',
        screen: 'rent',
      },
      {
        title: 'Revenus et dépenses',
        body: 'Activité financière et visibilité sur le cash-flow.',
        screen: 'finances',
      },
      {
        title: 'Documents',
        body: 'Baux, quittances et justificatifs liés au bien.',
        screen: 'documents',
      },
      {
        title: 'Maintenance',
        body: 'Interventions, priorités et suivi des travaux.',
        screen: 'maintenance',
      },
    ],
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
  finalCta: {
    title: 'Reprenez le contrôle de votre gestion locative',
    lede: 'Centralisez vos propriétés, vos loyers, vos dépenses et vos documents dans un espace simple et sécurisé.',
    primary: 'Créer mon compte gratuitement',
    secondary: 'Découvrir les fonctionnalités',
    note: 'Aucune carte bancaire requise',
  },
} as const;
