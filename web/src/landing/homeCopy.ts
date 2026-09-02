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

export type HomeCopy = {
  organize: { title: string; body: string; imageAlt: string };
  product: {
    kicker: string;
    title: string;
    body: string;
    cta: string;
    imageAlt: string;
    chips: { title: string; value: string }[];
  };
  how: { kicker: string; title: string; steps: { title: string; body: string }[] };
  features: { kicker: string; title: string; body: string; items: { title: string; body: string }[] };
  bento: {
    properties: { title: string; body: string; imageAlt: string };
    tenants: { title: string; body: string };
    rent: { title: string; body: string; late: string };
    documents: { title: string; body: string };
    expenses: { title: string; body: string };
    maintenance: { title: string; body: string };
  };
  documents: {
    kicker: string;
    title: string;
    body: string;
    cta: string;
    imageAlt: string;
    checks: string[];
  };
  control: { title: string; body: string };
  trust: { title: string; body: string; items: string[] };
  finalCta: { title: string; body: string; primary: string; secondary: string; note: string };
  faqHome: { title: string; items: { q: string; a: string }[]; cta: string };
  security: { title: string; lede: string; items: string[]; cta: string };
};

export const homeEs: HomeCopy = {
  organize: {
    title: 'La gestión de tus alquileres, por fin organizada',
    body: 'Inmuebles libres o alquilados, contratos, pagos, gastos y mantenimiento: toda la información importante en un panel claro.',
    imageAlt: 'Panel de Rentelyo con inmuebles, rentas cobradas y tareas pendientes',
  },
  product: {
    kicker: 'Toda tu gestión en un solo lugar',
    title: 'Gestiona tus alquileres con facilidad',
    body: 'Inmuebles libres o alquilados, contratos, pagos, gastos y mantenimiento: toda la información importante en un panel claro.',
    cta: 'Descubrir Rentelyo',
    imageAlt: 'Panel de Rentelyo con inmuebles, rentas cobradas y tareas',
    chips: [
      { title: 'Rentas cobradas', value: '3.130 €' },
      { title: 'Pagos atrasados', value: '1' },
      { title: 'Mantenimiento pendiente', value: '3' },
    ],
  },
  how: {
    kicker: 'Empieza enseguida',
    title: 'Tu gestión de alquileres en tres pasos',
    steps: [
      { title: 'Añade tu inmueble', body: 'Indica la dirección, el estado, la renta, los gastos y la disponibilidad.' },
      { title: 'Añade el inquilino y el contrato', body: 'Crea la ficha del inquilino y guarda el contrato con sus anexos.' },
      { title: 'Sigue todo el alquiler', body: 'Gestiona pagos, gastos, mantenimiento y próximas vencimientos.' },
    ],
  },
  features: {
    kicker: 'Lo esencial, sin complicaciones',
    title: 'Todo lo que necesitas para gestionar tus inmuebles',
    body: 'Rentelyo reúne cada etapa de la gestión de alquileres en una interfaz sencilla y ordenada.',
    items: [
      { title: 'Inmuebles', body: 'Gestiona viviendas libres o alquiladas.' },
      { title: 'Inquilinos', body: 'Guarda sus datos y contratos en un solo lugar.' },
      { title: 'Rentas', body: 'Sigue los pagos y los retrasos.' },
      { title: 'Gastos', body: 'Registra cargos y reparaciones.' },
      { title: 'Mantenimiento', body: 'Planifica y sigue las intervenciones.' },
      { title: 'Documentos', body: 'Conserva todos tus archivos juntos.' },
    ],
  },
  bento: {
    properties: {
      title: 'Todos tus inmuebles en un solo lugar',
      body: 'Añade pisos, casas, oficinas o locales y sigue su estado: libre, alquilado, en preaviso o en obras.',
      imageAlt: 'Lista de inmuebles en Rentelyo',
    },
    tenants: {
      title: 'Inquilinos y contratos',
      body: 'Reúne datos de contacto, fechas del contrato, importes y documentos asociados.',
    },
    rent: {
      title: 'Seguimiento de rentas',
      body: 'Consulta vencimientos, pagos recibidos, pagos parciales y atrasos.',
      late: 'Atrasado',
    },
    documents: {
      title: 'Documentos listos en unos clics',
      body: 'Genera recibos, justificantes, recordatorios y avisos de subida con los datos ya guardados.',
    },
    expenses: {
      title: 'Ingresos y gastos',
      body: 'Sigue ingresos, cargos y el resultado real de cada inmueble.',
    },
    maintenance: {
      title: 'Mantenimiento y reparaciones',
      body: 'Planifica trabajos y guarda presupuestos, facturas y fotos.',
    },
  },
  documents: {
    kicker: 'Tus documentos de alquiler',
    title: 'Genera justificantes sin volver a escribir los datos',
    body: 'Los datos de inmuebles, inquilinos y pagos se reutilizan para crear documentos claros y fáciles de encontrar.',
    cta: 'Ver los documentos',
    imageAlt: 'Un propietario trabajando en Rentelyo en un portátil',
    checks: [
      'Recibos de pago',
      'Justificantes de renta',
      'Recordatorios de pago',
      'Avisos de subida',
      'Extractos de rentas',
      'Resúmenes de gastos',
    ],
  },
  control: {
    title: 'No vuelvas a perder un vencimiento',
    body: 'Rentelyo te ayuda a detectar rentas atrasadas, contratos que vencen, mantenimientos pendientes y subidas de renta programadas.',
  },
  trust: {
    title: 'Tus alquileres siguen organizados y confidenciales',
    body: 'Rentelyo te ayuda a encontrar la información rápido y protege los datos de tus inmuebles, contratos e inquilinos.',
    items: [
      'Inicio de sesión seguro',
      'Documentos protegidos',
      'Datos separados entre cuentas',
      'Accesible en todos los dispositivos',
    ],
  },
  finalCta: {
    title: '¿Listo para simplificar tus alquileres?',
    body: 'Añade tu primer inmueble, centraliza tus contratos y empieza a seguir las rentas desde un solo espacio.',
    primary: 'Crear mi cuenta',
    secondary: 'Ver funciones',
    note: '1 inmueble gratis · Sin tarjeta bancaria',
  },
  faqHome: {
    title: 'Preguntas frecuentes',
    items: [
      {
        q: '¿Puedo usar Rentelyo con un solo inmueble?',
        a: 'Sí. Rentelyo sirve tanto a propietarios de una vivienda como a inversores con varios inmuebles.',
      },
      {
        q: '¿Puedo gestionar varios inmuebles?',
        a: 'Sí. Puedes centralizar tus inmuebles y seguir ingresos, gastos, documentos y operaciones de cada uno.',
      },
      {
        q: '¿Puedo guardar documentos en la aplicación?',
        a: 'Sí. Puedes reunir contratos, facturas, inventarios y otros justificantes en una biblioteca.',
      },
      {
        q: '¿Mis datos están protegidos?',
        a: 'Rentelyo aplica medidas de seguridad pensadas para proteger tu información personal, contractual y financiera.',
      },
      {
        q: '¿Puedo usar Rentelyo en el móvil?',
        a: 'Sí. La interfaz funciona en ordenador, tableta o teléfono.',
      },
    ],
    cta: 'Ver todas las preguntas',
  },
  security: {
    title: 'Los datos de tus inmuebles siguen siendo confidenciales',
    lede: 'Tu información financiera, contractual y personal está protegida con medidas de seguridad adecuadas.',
    items: [
      'Inicio de sesión seguro',
      'Tráfico cifrado (HTTPS)',
      'Datos aislados entre cuentas',
      'Control de accesos',
      'Sin cesión comercial de tus datos',
    ],
    cta: 'Más información sobre seguridad',
  },
};

export const homeDe: HomeCopy = {
  organize: {
    title: 'Ihre Mietverwaltung, endlich geordnet',
    body: 'Freie oder vermietete Objekte, Verträge, Zahlungen, Ausgaben und Instandhaltung: alle wichtigen Infos auf einem klaren Dashboard.',
    imageAlt: 'Rentelyo-Dashboard mit Objekten, eingenommenen Mieten und offenen Aufgaben',
  },
  product: {
    kicker: 'Ihre gesamte Verwaltung an einem Ort',
    title: 'Vermietungen einfach steuern',
    body: 'Freie oder vermietete Objekte, Verträge, Zahlungen, Ausgaben und Instandhaltung: alle wichtigen Infos auf einem klaren Dashboard.',
    cta: 'Rentelyo entdecken',
    imageAlt: 'Rentelyo-Dashboard mit Objekten, eingenommenen Mieten und Aufgaben',
    chips: [
      { title: 'Mieten eingegangen', value: '3.130 €' },
      { title: 'Überfällige Zahlungen', value: '1' },
      { title: 'Instandhaltung offen', value: '3' },
    ],
  },
  how: {
    kicker: 'Schnell starten',
    title: 'Ihre Mietverwaltung in drei Schritten',
    steps: [
      { title: 'Objekt hinzufügen', body: 'Adresse, Status, Miete, Nebenkosten und Verfügbarkeit erfassen.' },
      { title: 'Mieter und Vertrag hinzufügen', body: 'Mieterakte anlegen und den Vertrag mit Anlagen hinterlegen.' },
      { title: 'Die gesamte Vermietung verfolgen', body: 'Zahlungen, Ausgaben, Instandhaltung und nächste Fälligkeiten verwalten.' },
    ],
  },
  features: {
    kicker: 'Das Wesentliche, ohne Ballast',
    title: 'Alles, was Sie zur Verwaltung Ihrer Objekte brauchen',
    body: 'Rentelyo bündelt jeden Schritt der Mietverwaltung in einer einfachen, übersichtlichen Oberfläche.',
    items: [
      { title: 'Objekte', body: 'Verwalten Sie freie oder vermietete Wohnungen.' },
      { title: 'Mieter', body: 'Daten und Verträge an einem Ort.' },
      { title: 'Mieten', body: 'Zahlungen und Rückstände im Blick.' },
      { title: 'Ausgaben', body: 'Nebenkosten und Reparaturen erfassen.' },
      { title: 'Instandhaltung', body: 'Arbeiten planen und nachverfolgen.' },
      { title: 'Dokumente', body: 'Alle Dateien zusammen aufbewahren.' },
    ],
  },
  bento: {
    properties: {
      title: 'Alle Objekte an einem Ort',
      body: 'Wohnungen, Häuser, Büros oder Gewerbeflächen anlegen und den Status verfolgen: frei, vermietet, in Kündigungsfrist oder in Arbeit.',
      imageAlt: 'Objektliste in Rentelyo',
    },
    tenants: {
      title: 'Mieter und Verträge',
      body: 'Kontaktdaten, Vertragsdaten, Beträge und zugehörige Dokumente zusammenhalten.',
    },
    rent: {
      title: 'Mietüberwachung',
      body: 'Fälligkeiten, eingegangene Zahlungen, Teilzahlungen und Rückstände sehen.',
      late: 'Überfällig',
    },
    documents: {
      title: 'Dokumente in wenigen Klicks',
      body: 'Quittungen, Nachweise, Erinnerungen und Erhöhungsschreiben aus gespeicherten Daten erzeugen.',
    },
    expenses: {
      title: 'Einnahmen und Ausgaben',
      body: 'Einnahmen, Kosten und das tatsächliche Ergebnis jedes Objekts verfolgen.',
    },
    maintenance: {
      title: 'Instandhaltung und Reparaturen',
      body: 'Arbeiten planen und Angebote, Rechnungen und Fotos aufbewahren.',
    },
  },
  documents: {
    kicker: 'Ihre Mietdokumente',
    title: 'Nachweise erzeugen, ohne Daten neu einzugeben',
    body: 'Objekt-, Mieter- und Zahlungsdaten werden wiederverwendet, um klare, wiederauffindbare Dokumente zu erstellen.',
    cta: 'Dokumente entdecken',
    imageAlt: 'Ein Vermieter arbeitet in Rentelyo am Laptop',
    checks: [
      'Zahlungsquittungen',
      'Mietbescheinigungen',
      'Zahlungserinnerungen',
      'Erhöhungsschreiben',
      'Mietaufstellungen',
      'Ausgabenzusammenfassungen',
    ],
  },
  control: {
    title: 'Keine Fälligkeit mehr verpassen',
    body: 'Rentelyo hilft, überfällige Mieten, auslaufende Verträge, anstehende Arbeiten und geplante Mieterhöhungen zu erkennen.',
  },
  trust: {
    title: 'Ihre Vermietungen bleiben organisiert und vertraulich',
    body: 'Rentelyo hilft, Informationen schnell zu finden und die Daten Ihrer Objekte, Verträge und Mieter zu schützen.',
    items: [
      'Sichere Anmeldung',
      'Geschützte Dokumente',
      'Getrennte Daten je Konto',
      'Auf jedem Gerät nutzbar',
    ],
  },
  finalCta: {
    title: 'Bereit, Ihre Vermietungen zu vereinfachen?',
    body: 'Legen Sie Ihr erstes Objekt an, bündeln Sie Verträge und verfolgen Sie Mieten an einem Ort.',
    primary: 'Konto erstellen',
    secondary: 'Funktionen ansehen',
    note: '1 Objekt kostenlos · Keine Kreditkarte nötig',
  },
  faqHome: {
    title: 'Häufige Fragen',
    items: [
      {
        q: 'Kann ich Rentelyo mit einem einzelnen Objekt nutzen?',
        a: 'Ja. Rentelyo eignet sich für Vermieter einer Wohnung ebenso wie für Investoren mit mehreren Objekten.',
      },
      {
        q: 'Kann ich mehrere Objekte verwalten?',
        a: 'Ja. Sie können Objekte bündeln und Einnahmen, Ausgaben, Dokumente und Vorgänge je Objekt verfolgen.',
      },
      {
        q: 'Kann ich Dokumente in der App speichern?',
        a: 'Ja. Mietverträge, Rechnungen, Protokolle und andere Nachweise gehören in eine gemeinsame Ablage.',
      },
      {
        q: 'Sind meine Daten sicher?',
        a: 'Rentelyo setzt Sicherheitsmaßnahmen ein, um persönliche, vertragliche und finanzielle Informationen zu schützen.',
      },
      {
        q: 'Kann ich Rentelyo mobil nutzen?',
        a: 'Ja. Die Oberfläche funktioniert auf Computer, Tablet und Smartphone.',
      },
    ],
    cta: 'Alle Fragen ansehen',
  },
  security: {
    title: 'Ihre Immobiliendaten bleiben vertraulich',
    lede: 'Finanzielle, vertragliche und persönliche Informationen sind mit angemessenen Sicherheitsmaßnahmen geschützt.',
    items: [
      'Sichere Anmeldung',
      'Verschlüsselter Verkehr (HTTPS)',
      'Getrennte Daten je Konto',
      'Zugriffskontrolle',
      'Keine kommerzielle Weitergabe Ihrer Daten',
    ],
    cta: 'Mehr zur Sicherheit',
  },
};

export const homePt: HomeCopy = {
  organize: {
    title: 'A gestão dos seus arrendamentos, finalmente organizada',
    body: 'Imóveis livres ou arrendados, contratos, pagamentos, despesas e manutenção: toda a informação importante num painel claro.',
    imageAlt: 'Painel Rentelyo com imóveis, rendas cobradas e ações pendentes',
  },
  product: {
    kicker: 'Toda a gestão num só sítio',
    title: 'Gira os seus arrendamentos com simplicidade',
    body: 'Imóveis livres ou arrendados, contratos, pagamentos, despesas e manutenção: toda a informação importante num painel claro.',
    cta: 'Descobrir a Rentelyo',
    imageAlt: 'Painel Rentelyo com imóveis, rendas cobradas e tarefas',
    chips: [
      { title: 'Rendas cobradas', value: '3 130 €' },
      { title: 'Pagamentos em atraso', value: '1' },
      { title: 'Manutenção pendente', value: '3' },
    ],
  },
  how: {
    kicker: 'Comece depressa',
    title: 'A sua gestão de arrendamentos em três passos',
    steps: [
      { title: 'Adicione o imóvel', body: 'Indique a morada, o estado, a renda, os encargos e a disponibilidade.' },
      { title: 'Adicione o inquilino e o contrato', body: 'Crie a ficha do inquilino e guarde o contrato com os anexos.' },
      { title: 'Acompanhe todo o arrendamento', body: 'Gira pagamentos, despesas, manutenção e próximas prestações.' },
    ],
  },
  features: {
    kicker: 'O essencial, sem complexidade',
    title: 'Tudo o que precisa para gerir os seus imóveis',
    body: 'A Rentelyo reúne cada etapa da gestão de arrendamentos numa interface simples e organizada.',
    items: [
      { title: 'Imóveis', body: 'Gira habitações livres ou arrendadas.' },
      { title: 'Inquilinos', body: 'Centralize dados e contratos.' },
      { title: 'Rendas', body: 'Acompanhe pagamentos e atrasos.' },
      { title: 'Despesas', body: 'Registe encargos e reparações.' },
      { title: 'Manutenção', body: 'Planeie e acompanhe as intervenções.' },
      { title: 'Documentos', body: 'Guarde todos os ficheiros no mesmo sítio.' },
    ],
  },
  bento: {
    properties: {
      title: 'Todos os imóveis no mesmo sítio',
      body: 'Adicione apartamentos, casas, escritórios ou lojas e acompanhe o estado: livre, arrendado, em pré-aviso ou em obras.',
      imageAlt: 'Lista de imóveis na Rentelyo',
    },
    tenants: {
      title: 'Inquilinos e contratos',
      body: 'Reúna contactos, datas do contrato, valores e documentos associados.',
    },
    rent: {
      title: 'Acompanhamento das rendas',
      body: 'Veja vencimentos, pagamentos recebidos, pagamentos parciais e atrasos.',
      late: 'Em atraso',
    },
    documents: {
      title: 'Documentos prontos em poucos cliques',
      body: 'Gere recibos, comprovativos, lembretes e avisos de aumento a partir dos dados já guardados.',
    },
    expenses: {
      title: 'Receitas e despesas',
      body: 'Acompanhe receitas, encargos e o resultado real de cada imóvel.',
    },
    maintenance: {
      title: 'Manutenção e reparações',
      body: 'Planeie trabalhos e guarde orçamentos, faturas e fotografias.',
    },
  },
  documents: {
    kicker: 'Os seus documentos de arrendamento',
    title: 'Gere comprovativos sem voltar a inserir os dados',
    body: 'Os dados de imóveis, inquilinos e pagamentos são reutilizados para criar documentos claros e fáceis de encontrar.',
    cta: 'Ver os documentos',
    imageAlt: 'Um senhorio a trabalhar na Rentelyo no computador',
    checks: [
      'Recibos de pagamento',
      'Comprovativos de renda',
      'Lembretes de pagamento',
      'Avisos de aumento',
      'Extratos de rendas',
      'Resumos de despesas',
    ],
  },
  control: {
    title: 'Não volte a falhar um vencimento',
    body: 'A Rentelyo ajuda a identificar rendas em atraso, contratos a terminar, manutenções a realizar e aumentos de renda programados.',
  },
  trust: {
    title: 'Os seus arrendamentos ficam organizados e confidenciais',
    body: 'A Rentelyo ajuda a encontrar informação depressa e protege os dados dos seus imóveis, contratos e inquilinos.',
    items: [
      'Início de sessão seguro',
      'Documentos protegidos',
      'Dados separados entre contas',
      'Acessível em todos os dispositivos',
    ],
  },
  finalCta: {
    title: 'Pronto para simplificar os arrendamentos?',
    body: 'Adicione o primeiro imóvel, centralize os contratos e comece a acompanhar as rendas num único espaço.',
    primary: 'Criar a minha conta',
    secondary: 'Ver funcionalidades',
    note: '1 imóvel grátis · Sem cartão bancário',
  },
  faqHome: {
    title: 'Perguntas frequentes',
    items: [
      {
        q: 'Posso usar a Rentelyo com um só imóvel?',
        a: 'Sim. A Rentelyo serve tanto senhorios de um fogo como investidores com vários imóveis.',
      },
      {
        q: 'Posso gerir vários imóveis?',
        a: 'Sim. Pode centralizar os imóveis e acompanhar receitas, despesas, documentos e operações de cada um.',
      },
      {
        q: 'Posso guardar documentos na aplicação?',
        a: 'Sim. Pode reunir contratos, faturas, autos de vistoria e outros comprovativos numa biblioteca.',
      },
      {
        q: 'Os meus dados estão seguros?',
        a: 'A Rentelyo aplica medidas de segurança para proteger a sua informação pessoal, contratual e financeira.',
      },
      {
        q: 'Posso usar a Rentelyo no telemóvel?',
        a: 'Sim. A interface funciona num computador, tablet ou telemóvel.',
      },
    ],
    cta: 'Ver todas as perguntas',
  },
  security: {
    title: 'Os dados dos seus imóveis permanecem confidenciais',
    lede: 'A informação financeira, contratual e pessoal está protegida com medidas de segurança adequadas.',
    items: [
      'Início de sessão seguro',
      'Tráfego cifrado (HTTPS)',
      'Dados isolados entre contas',
      'Controlo de acessos',
      'Sem partilha comercial dos seus dados',
    ],
    cta: 'Saber mais sobre segurança',
  },
};

export const homeAr: HomeCopy = {
  organize: {
    title: 'إدارة إيجاراتك، منظمة أخيرًا',
    body: 'عقارات شاغرة أو مؤجرة، عقود، مدفوعات، مصاريف وصيانة: كل المعلومات المهمة في لوحة واضحة.',
    imageAlt: 'لوحة Rentelyo مع العقارات والإيجارات المحصّلة والمهام',
  },
  product: {
    kicker: 'كل إدارتك في مكان واحد',
    title: 'أدِر إيجاراتك بسهولة',
    body: 'عقارات شاغرة أو مؤجرة، عقود، مدفوعات، مصاريف وصيانة: كل المعلومات المهمة في لوحة واضحة.',
    cta: 'اكتشف Rentelyo',
    imageAlt: 'لوحة Rentelyo تعرض العقارات والإيجارات المحصّلة',
    chips: [
      { title: 'إيجار مُحصَّل', value: '٣٬١٣٠ €' },
      { title: 'مدفوعات متأخرة', value: '1' },
      { title: 'صيانة معلّقة', value: '3' },
    ],
  },
  how: {
    kicker: 'ابدأ بسرعة',
    title: 'إدارة الإيجار في ثلاث خطوات',
    steps: [
      { title: 'أضف عقارك', body: 'أدخل العنوان والحالة والإيجار والأعباء وتاريخ التوفر.' },
      { title: 'أضف المستأجر والعقد', body: 'أنشئ ملف المستأجر واحفظ العقد ومرفقاته.' },
      { title: 'تابع الإيجار بالكامل', body: 'أدِر المدفوعات والمصاريف والصيانة والاستحقاقات القادمة.' },
    ],
  },
  features: {
    kicker: 'الأساسيات دون تعقيد',
    title: 'كل ما تحتاجه لإدارة عقاراتك',
    body: 'تجمع Rentelyo كل مرحلة من إدارة الإيجار في واجهة بسيطة ومنظمة.',
    items: [
      { title: 'العقارات', body: 'أدِر المساكن الشاغرة أو المؤجرة.' },
      { title: 'المستأجرون', body: 'اجمع بياناتهم وعقودهم في مكان واحد.' },
      { title: 'الإيجارات', body: 'تابع المدفوعات والمتأخرات.' },
      { title: 'المصاريف', body: 'سجّل الأعباء والإصلاحات.' },
      { title: 'الصيانة', body: 'خطّط للتدخلات وتابعها.' },
      { title: 'المستندات', body: 'احتفظ بملفاتك معًا.' },
    ],
  },
  bento: {
    properties: {
      title: 'كل عقاراتك في مكان واحد',
      body: 'أضف شققًا أو منازل أو مكاتب أو محلات وتابع حالتها: شاغر، مؤجر، في فترة إشعار أو قيد الأشغال.',
      imageAlt: 'قائمة العقارات في Rentelyo',
    },
    tenants: {
      title: 'المستأجرون والعقود',
      body: 'اجمع بيانات الاتصال وتواريخ العقد والمبالغ والمستندات المرتبطة.',
    },
    rent: {
      title: 'متابعة الإيجارات',
      body: 'اطلع على الاستحقاقات والمدفوعات المستلمة والتسديدات الجزئية والمتأخرات.',
      late: 'متأخر',
    },
    documents: {
      title: 'مستندات جاهزة ببضع نقرات',
      body: 'أنشئ وصولات وإثباتات وتذكيرات وإشعارات زيادة من البيانات المحفوظة.',
    },
    expenses: {
      title: 'الإيرادات والمصاريف',
      body: 'تابع الإيرادات والأعباء والنتيجة الفعلية لكل عقار.',
    },
    maintenance: {
      title: 'الصيانة والإصلاحات',
      body: 'خطّط للأعمال واحتفظ بعروض الأسعار والفواتير والصور.',
    },
  },
  documents: {
    kicker: 'مستندات الإيجار',
    title: 'أنشئ الإثباتات دون إعادة إدخال البيانات',
    body: 'تُعاد استخدام بيانات العقارات والمستأجرين والمدفوعات لإنشاء مستندات واضحة وسهلة الاسترجاع.',
    cta: 'اكتشف المستندات',
    imageAlt: 'مالك يعمل في Rentelyo على حاسوبه',
    checks: [
      'وصولات الدفع',
      'إثباتات الإيجار',
      'تذكيرات الدفع',
      'إشعارات الزيادة',
      'كشوف الإيجارات',
      'ملخصات المصاريف',
    ],
  },
  control: {
    title: 'لا تفوّت أي استحقاق',
    body: 'تساعدك Rentelyo على رصد الإيجارات المتأخرة والعقود المنتهية والصيانة المعلقة وزيادات الإيجار المبرمجة.',
  },
  trust: {
    title: 'تبقى إيجاراتك منظمة وسرية',
    body: 'تساعدك Rentelyo على إيجاد المعلومات بسرعة مع حماية بيانات عقاراتك وعقودك ومستأجريك.',
    items: [
      'تسجيل دخول آمن',
      'مستندات محمية',
      'بيانات منفصلة بين الحسابات',
      'متاح على كل الأجهزة',
    ],
  },
  finalCta: {
    title: 'مستعد لتبسيط إيجاراتك؟',
    body: 'أضف عقارك الأول واجمع عقودك وابدأ متابعة الإيجارات من مساحة واحدة.',
    primary: 'إنشاء حسابي',
    secondary: 'عرض الميزات',
    note: 'عقار واحد مجانًا · لا حاجة لبطاقة بنكية',
  },
  faqHome: {
    title: 'أسئلة شائعة',
    items: [
      {
        q: 'هل يمكنني استخدام Rentelyo بعقار واحد؟',
        a: 'نعم. تناسب Rentelyo مالكي مسكن واحد كما تناسب المستثمرين الذين يديرون عدة عقارات.',
      },
      {
        q: 'هل يمكنني إدارة عدة عقارات؟',
        a: 'نعم. يمكنك تجميع عقاراتك ومتابعة الإيرادات والمصاريف والمستندات والعمليات لكل عقار.',
      },
      {
        q: 'هل يمكنني حفظ المستندات في التطبيق؟',
        a: 'نعم. يمكنك جمع العقود والفواتير ومحاضر الجرد وغيرها من الإثباتات في مكتبة واحدة.',
      },
      {
        q: 'هل بياناتي آمنة؟',
        a: 'تطبّق Rentelyo إجراءات أمنية لحماية معلوماتك الشخصية والتعاقدية والمالية.',
      },
      {
        q: 'هل يمكنني استخدام Rentelyo على الهاتف؟',
        a: 'نعم. تعمل الواجهة على الحاسوب واللوحي والهاتف.',
      },
    ],
    cta: 'عرض كل الأسئلة',
  },
  security: {
    title: 'بيانات عقاراتك تبقى سرية',
    lede: 'معلوماتك المالية والتعاقدية والشخصية محمية بإجراءات أمنية مناسبة.',
    items: [
      'تسجيل دخول آمن',
      'تشفير الاتصالات (HTTPS)',
      'فصل البيانات بين الحسابات',
      'التحكم في الوصول',
      'لا مشاركة تجارية لبياناتك',
    ],
    cta: 'معرفة المزيد عن الأمان',
  },
};
