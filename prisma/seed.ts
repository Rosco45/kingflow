import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Début du seed KingFlow...");

  // 1. Settings
  await prisma.companySettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "KingFlow Commerce & Tech SARL",
      tagline: "Solutions de Gestion Commerciale, Import & Services",
      email: "contact@kingflow-business.com",
      phone: "+221 77 450 89 20",
      whatsapp: "+221774508920",
      address: "14 Boulevard de la République, Immeuble Almadies",
      city: "Dakar",
      country: "Sénégal",
      taxId: "SN-DKR-2024-B-9942 / NINEA: 008741258 2V2",
      currency: "XOF",
      defaultVatRate: 18.0,
      invoiceTerms: "Modalités de règlement : 50% d'acompte à la commande, solde à 30 jours. Tout retard de paiement entraîne une indemnité forfaitaire de 10%.",
      receiptFooter: "KingFlow vous remercie de votre visite ! Facturette non remboursable après 48h.",
    },
  });

  // 2. Customers
  const clientsData = [
    {
      name: "Amadou Diallo",
      companyName: "Diallo & Frères Trading",
      email: "amadou.diallo@trading-sn.com",
      phone: "+221 77 890 12 34",
      whatsapp: "+221778901234",
      address: "Marché Sandaga, Allée B",
      city: "Dakar",
      country: "Sénégal",
      notes: "Client fidèle gros volume, paiement régulier sous 15 jours.",
    },
    {
      name: "Fatou Bamba",
      companyName: "Bamba Tech Innovations",
      email: "f.bamba@bambatech.ci",
      phone: "+225 07 48 99 10 20",
      whatsapp: "+2250748991020",
      address: "Cocody Riviera Golf, Villa 42",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      notes: "Paiements réguliers par Wave et Virement BICICI.",
    },
    {
      name: "Moussa Konaté",
      companyName: "Superette Express Ouest",
      email: "konate@express-ouest.com",
      phone: "+221 78 333 44 55",
      whatsapp: "+221783334455",
      address: "Mermoz Pyrotechnie, Lot 18",
      city: "Dakar",
      country: "Sénégal",
      notes: "Boutique de proximité, commandes bimensuelles.",
    },
    {
      name: "Dr. Aïssatou Sow",
      companyName: "Clinique Médicale Yoff",
      email: "direction@cliniqueyoff.sn",
      phone: "+221 77 654 32 10",
      whatsapp: "+221776543210",
      address: "Route de l'Aéroport, Yoff",
      city: "Dakar",
      country: "Sénégal",
      notes: "Contrat de maintenance informatique annuel.",
    },
    {
      name: "Jean-Pierre Kouamé",
      companyName: "Kouamé Bâtiments & Travaux",
      email: "jp.kouame@kbt-ci.org",
      phone: "+225 05 12 34 56 78",
      whatsapp: "+2250512345678",
      address: "Zone Industrielle Yopougon",
      city: "Abidjan",
      country: "Côte d'Ivoire",
      notes: "Achats d'équipements de chantier et fournitures.",
    },
    {
      name: "Mariam Diop",
      companyName: "Studio Mariam Couture & Déco",
      email: "mariam@studiomariam.com",
      phone: "+221 76 112 23 34",
      whatsapp: "+221761122334",
      address: "Sacré-Cœur 3, Immeuble Rose",
      city: "Dakar",
      country: "Sénégal",
      notes: "Paiements rapides par Orange Money.",
    },
    {
      name: "Koffi Mensah",
      companyName: "Mensah Agro-Business",
      email: "contact@mensah-agro.com",
      phone: "+228 90 22 44 66",
      whatsapp: "+22890224466",
      address: "Boulevard Circulaire",
      city: "Lomé",
      country: "Togo",
      notes: "Client export.",
    },
  ];

  const customers: any[] = [];
  for (const c of clientsData) {
    const customer = await prisma.customer.create({ data: c });
    customers.push(customer);
  }

  // 3. Suppliers
  const suppliersData = [
    {
      name: "Global Hardware Imports",
      companyName: "Global Hardware SARL",
      email: "sales@globalhardware.com",
      phone: "+221 33 821 00 11",
      address: "Port Autonome de Dakar, Hangar 4",
      category: "Électronique & Informatique",
    },
    {
      name: "Papeterie & Consommables du Sahel",
      companyName: "PCS Sénégal",
      email: "commandes@pcs-sahel.sn",
      phone: "+221 33 832 45 45",
      address: "Zone Franche Industrielle, km 14",
      category: "Fournitures de Bureau & Papier",
    },
    {
      name: "Sonatel / Orange Business",
      companyName: "Sonatel SA",
      email: "pro@orange-business.sn",
      phone: "+221 33 839 12 00",
      address: "Avenue Cheikh Anta Diop",
      category: "Télécom & Internet Fibre",
    },
    {
      name: "Transport & Logistique Express Ouest",
      companyName: "TLEO Transit",
      email: "dispatch@tleo-transit.com",
      phone: "+221 77 300 20 10",
      address: "Bel-Air, Dakar",
      category: "Transport & Dédouanement",
    },
  ];

  const suppliers: any[] = [];
  for (const s of suppliersData) {
    const supplier = await prisma.supplier.create({ data: s });
    suppliers.push(supplier);
  }

  // 4. Products & Services
  const productsData = [
    {
      sku: "PRD-LAP-001",
      name: "PC Portable Dell Vostro 15 (i5, 16GB, 512GB SSD)",
      description: "Ordinateur professionnel ultra-performant pour bureautique avancée.",
      category: "Informatique",
      type: "PRODUCT",
      purchasePrice: 380000,
      sellingPrice: 495000,
      stockQuantity: 12,
      minStockAlert: 4,
      unit: "unité",
    },
    {
      sku: "PRD-PRN-002",
      name: "Imprimante Multifonction Laser HP LaserJet Pro",
      description: "Impression recto-verso automatique, WiFi, scanner haute vitesse.",
      category: "Bureautique",
      type: "PRODUCT",
      purchasePrice: 165000,
      sellingPrice: 235000,
      stockQuantity: 6,
      minStockAlert: 3,
      unit: "unité",
    },
    {
      sku: "PRD-ROU-003",
      name: "Routeur WiFi 6 Dual-Band AX3000 TP-Link",
      description: "Haute couverture réseau pour PME et bureaux jusqu'à 30 utilisateurs.",
      category: "Réseau",
      type: "PRODUCT",
      purchasePrice: 42000,
      sellingPrice: 65000,
      stockQuantity: 3,
      minStockAlert: 5, // Alerte stock faible
      unit: "unité",
    },
    {
      sku: "PRD-TON-004",
      name: "Toner HP Noir Haute Capacité 83A",
      description: "Cartouche originale HP 1500 pages pour LaserJet.",
      category: "Consommables",
      type: "PRODUCT",
      purchasePrice: 22000,
      sellingPrice: 35000,
      stockQuantity: 18,
      minStockAlert: 5,
      unit: "pièce",
    },
    {
      sku: "PRD-OND-005",
      name: "Onduleur APC Back-UPS 800VA Régulateur",
      description: "Protection contre les coupures et variations de tension secteur.",
      category: "Énergie",
      type: "PRODUCT",
      purchasePrice: 58000,
      sellingPrice: 85000,
      stockQuantity: 0, // Rupture de stock
      minStockAlert: 4,
      unit: "unité",
    },
    {
      sku: "PRD-DIS-006",
      name: "Disque Dur Externe 2To Antichoc Rugged",
      description: "Sauvegarde sécurisée USB 3.0 avec chiffrement matériel.",
      category: "Stockage",
      type: "PRODUCT",
      purchasePrice: 48000,
      sellingPrice: 72000,
      stockQuantity: 2, // Alerte stock faible
      minStockAlert: 5,
      unit: "unité",
    },
    {
      sku: "PRD-PAP-007",
      name: "Carton de Papier Ramettes A4 80g (5 ramettes)",
      description: "Papier blanc extra pour photocopies et impressions laser.",
      category: "Consommables",
      type: "PRODUCT",
      purchasePrice: 14000,
      sellingPrice: 21000,
      stockQuantity: 45,
      minStockAlert: 10,
      unit: "carton",
    },
    {
      sku: "SRV-INS-008",
      name: "Prestation Installation & Configuration Réseau PME",
      description: "Câblage, sécurisation switch/pare-feu et paramétrage bornes WiFi.",
      category: "Services",
      type: "SERVICE",
      purchasePrice: 50000,
      sellingPrice: 180000,
      stockQuantity: 999,
      minStockAlert: 0,
      unit: "forfait",
    },
    {
      sku: "SRV-MAI-009",
      name: "Maintenance Informatique Mensuelle (Pack PME 10 postes)",
      description: "Support hotline 24/7, nettoyage préventif et télémaintenance.",
      category: "Services",
      type: "SERVICE",
      purchasePrice: 40000,
      sellingPrice: 150000,
      stockQuantity: 999,
      minStockAlert: 0,
      unit: "mois",
    },
    {
      sku: "PRD-SCA-010",
      name: "Lecteur Code-barres Laser 2D / QR Code USB",
      description: "Douchette filaire ultra-rapide pour point de vente et caisse.",
      category: "Boutique & Caisse",
      type: "PRODUCT",
      purchasePrice: 28000,
      sellingPrice: 45000,
      stockQuantity: 8,
      minStockAlert: 3,
      unit: "unité",
    },
    {
      sku: "PRD-BOB-011",
      name: "Lot de 50 Bobines Papier Thermique 80x80mm",
      description: "Rouleaux sans BPA pour imprimante ticket de caisse thermique.",
      category: "Consommables",
      type: "PRODUCT",
      purchasePrice: 18500,
      sellingPrice: 28000,
      stockQuantity: 15,
      minStockAlert: 4,
      unit: "lot",
    },
  ];

  const products: any[] = [];
  for (const p of productsData) {
    const product = await prisma.product.create({ data: p });
    products.push(product);

    // Initial stock movement
    if (product.type === "PRODUCT" && product.stockQuantity > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          type: "IN",
          quantity: product.stockQuantity,
          previousStock: 0,
          newStock: product.stockQuantity,
          reason: "RECEPTION_FOURNISSEUR",
          referenceDoc: "BL-INIT-2024",
          notes: "Inventaire de départ et stock initial.",
        },
      });
    }
  }

  // Stock movement adjustment example (Casse / Perte)
  await prisma.stockMovement.create({
    data: {
      productId: products[2].id, // Routeur WiFi
      type: "ADJUSTMENT",
      quantity: -1,
      previousStock: 4,
      newStock: 3,
      reason: "CASSE",
      referenceDoc: "AJUST-OCT-01",
      notes: "Boîtier endommagé lors de la manutention en réserve.",
    },
  });

  // 5. Invoices & Quotes
  const now = new Date();
  const subDays = (d: Date, days: number) => new Date(d.getTime() - days * 86400000);
  const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86400000);

  // Invoice 1: Paid invoice
  const inv1Items = [
    { productId: products[0].id, description: products[0].name, quantity: 2, unitPrice: 495000, total: 990000 },
    { productId: products[1].id, description: products[1].name, quantity: 1, unitPrice: 235000, total: 235000 },
  ];
  const inv1Sub = 990000 + 235000; // 1225000
  const inv1Tax = Math.round(inv1Sub * 0.18); // 220500
  const inv1Total = inv1Sub + inv1Tax; // 1445500

  const invoice1 = await prisma.invoice.create({
    data: {
      number: "FACT-2024-001",
      type: "INVOICE",
      customerId: customers[0].id,
      status: "PAID",
      issueDate: subDays(now, 45),
      dueDate: subDays(now, 15),
      subtotal: inv1Sub,
      discountType: "FIXED",
      discountValue: 0,
      discountAmount: 0,
      taxRate: 18.0,
      taxAmount: inv1Tax,
      total: inv1Total,
      paidAmount: inv1Total,
      balanceDue: 0,
      notes: "Matériel livré au siège de Diallo & Frères Trading.",
      items: { create: inv1Items },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice1.id,
      customerId: customers[0].id,
      amount: inv1Total,
      paymentDate: subDays(now, 40),
      paymentMethod: "BANK_TRANSFER",
      reference: "VIR-BOA-89412",
      notes: "Règlement complet par virement bancaire BOA.",
    },
  });

  // Invoice 2: Partially Paid invoice (Créance restante)
  const inv2Items = [
    { productId: products[0].id, description: products[0].name, quantity: 3, unitPrice: 495000, total: 1485000 },
    { productId: products[7].id, description: products[7].name, quantity: 1, unitPrice: 180000, total: 180000 },
  ];
  const inv2Sub = 1485000 + 180000; // 1665000
  const inv2Discount = 65000; // 65 000 FCFA geste commercial
  const inv2AfterDisc = inv2Sub - inv2Discount; // 1600000
  const inv2Tax = Math.round(inv2AfterDisc * 0.18); // 288000
  const inv2Total = inv2AfterDisc + inv2Tax; // 1888000
  const inv2Paid = 1000000; // 1 000 000 acompte versé
  const inv2Due = inv2Total - inv2Paid; // 888 000 restant

  const invoice2 = await prisma.invoice.create({
    data: {
      number: "FACT-2024-002",
      type: "INVOICE",
      customerId: customers[1].id, // Bamba Tech Innovations
      status: "PARTIALLY_PAID",
      issueDate: subDays(now, 20),
      dueDate: addDays(now, 10),
      subtotal: inv2Sub,
      discountType: "FIXED",
      discountValue: inv2Discount,
      discountAmount: inv2Discount,
      taxRate: 18.0,
      taxAmount: inv2Tax,
      total: inv2Total,
      paidAmount: inv2Paid,
      balanceDue: inv2Due,
      notes: "Acompte de 1.000.000 FCFA reçu par Wave. Solde à la livraison finale.",
      items: { create: inv2Items },
    },
  });

  await prisma.payment.create({
    data: {
      invoiceId: invoice2.id,
      customerId: customers[1].id,
      amount: inv2Paid,
      paymentDate: subDays(now, 18),
      paymentMethod: "WAVE",
      reference: "WAVE-TX-99812401",
      notes: "Acompte validé par Wave Côte d'Ivoire.",
    },
  });

  // Invoice 3: OVERDUE invoice (En retard - Créance client active)
  const inv3Items = [
    { productId: products[9].id, description: products[9].name, quantity: 2, unitPrice: 45000, total: 90000 },
    { productId: products[10].id, description: products[10].name, quantity: 3, unitPrice: 28000, total: 84000 },
    { productId: products[6].id, description: products[6].name, quantity: 5, unitPrice: 21000, total: 105000 },
  ];
  const inv3Sub = 90000 + 84000 + 105000; // 279000
  const inv3Tax = Math.round(inv3Sub * 0.18); // 50220
  const inv3Total = inv3Sub + inv3Tax; // 329220

  await prisma.invoice.create({
    data: {
      number: "FACT-2024-003",
      type: "INVOICE",
      customerId: customers[2].id, // Moussa Konaté (Superette Express)
      status: "OVERDUE",
      issueDate: subDays(now, 38),
      dueDate: subDays(now, 8), // En retard de 8 jours
      subtotal: inv3Sub,
      discountType: "PERCENT",
      discountValue: 0,
      discountAmount: 0,
      taxRate: 18.0,
      taxAmount: inv3Tax,
      total: inv3Total,
      paidAmount: 0,
      balanceDue: inv3Total,
      notes: "Rappel de relance envoyé par WhatsApp. En attente de règlement.",
      items: { create: inv3Items },
    },
  });

  // Invoice 4: SENT invoice (En attente d'échéance)
  const inv4Items = [
    { productId: products[8].id, description: products[8].name, quantity: 3, unitPrice: 150000, total: 450000 },
  ];
  const inv4Sub = 450000;
  const inv4Tax = Math.round(inv4Sub * 0.18); // 81000
  const inv4Total = inv4Sub + inv4Tax; // 531000

  await prisma.invoice.create({
    data: {
      number: "FACT-2024-004",
      type: "INVOICE",
      customerId: customers[3].id, // Dr Aïssatou Sow
      status: "SENT",
      issueDate: subDays(now, 5),
      dueDate: addDays(now, 25),
      subtotal: inv4Sub,
      discountType: "PERCENT",
      discountValue: 0,
      discountAmount: 0,
      taxRate: 18.0,
      taxAmount: inv4Tax,
      total: inv4Total,
      paidAmount: 0,
      balanceDue: inv4Total,
      notes: "Contrat de maintenance informatique T4.",
      items: { create: inv4Items },
    },
  });

  // Quote 1 (Devis en attente convertible en facture)
  const dev1Items = [
    { productId: products[0].id, description: products[0].name, quantity: 5, unitPrice: 495000, total: 2475000 },
    { productId: products[1].id, description: products[1].name, quantity: 2, unitPrice: 235000, total: 470000 },
    { productId: products[7].id, description: products[7].name, quantity: 1, unitPrice: 180000, total: 180000 },
  ];
  const dev1Sub = 2475000 + 470000 + 180000; // 3125000
  const dev1Tax = Math.round(dev1Sub * 0.18); // 562500
  const dev1Total = dev1Sub + dev1Tax; // 3687500

  await prisma.invoice.create({
    data: {
      number: "DEV-2024-001",
      type: "QUOTE",
      customerId: customers[4].id, // Jean-Pierre Kouamé
      status: "SENT",
      issueDate: subDays(now, 4),
      dueDate: addDays(now, 26),
      subtotal: dev1Sub,
      discountType: "PERCENT",
      discountValue: 0,
      discountAmount: 0,
      taxRate: 18.0,
      taxAmount: dev1Tax,
      total: dev1Total,
      paidAmount: 0,
      balanceDue: dev1Total,
      notes: "Proposition d'équipement bureautique et réseau complet.",
      items: { create: dev1Items },
    },
  });

  // Quote 2 (Devis brouillon)
  const dev2Items = [
    { productId: products[3].id, description: products[3].name, quantity: 10, unitPrice: 35000, total: 350000 },
    { productId: products[6].id, description: products[6].name, quantity: 20, unitPrice: 21000, total: 420000 },
  ];
  const dev2Sub = 350000 + 420000; // 770000
  const dev2Tax = Math.round(dev2Sub * 0.18); // 138600
  const dev2Total = dev2Sub + dev2Tax; // 908600

  await prisma.invoice.create({
    data: {
      number: "DEV-2024-002",
      type: "QUOTE",
      customerId: customers[5].id, // Mariam Diop
      status: "DRAFT",
      issueDate: subDays(now, 1),
      dueDate: addDays(now, 14),
      subtotal: dev2Sub,
      discountType: "PERCENT",
      discountValue: 5,
      discountAmount: dev2Sub * 0.05,
      taxRate: 18.0,
      taxAmount: dev2Tax,
      total: dev2Total - dev2Sub * 0.05,
      paidAmount: 0,
      balanceDue: dev2Total - dev2Sub * 0.05,
      notes: "Devis pour fournitures atelier et consommables.",
      items: { create: dev2Items },
    },
  });

  // 6. Operating Expenses & Supplier Debts
  const expensesData = [
    {
      title: "Loyer bureaux siège Plateau Dakar",
      category: "LOYER",
      amount: 450000,
      expenseDate: subDays(now, 8),
      paymentMethod: "BANK_TRANSFER",
      isPaid: true,
      supplierId: null,
      notes: "Loyer mensuel réglé par virement bancaire.",
    },
    {
      title: "Facture Électricité Senelec Octobre",
      category: "ELECTRICITE_EAU",
      amount: 78500,
      expenseDate: subDays(now, 12),
      paymentMethod: "WAVE",
      isPaid: true,
      supplierId: null,
      notes: "Paiement en ligne facture Senelec.",
    },
    {
      title: "Abonnement Internet Fibre Optique Pro",
      category: "AUTRES",
      amount: 55000,
      expenseDate: subDays(now, 6),
      paymentMethod: "ORANGE_MONEY",
      isPaid: true,
      supplierId: suppliers[2].id, // Sonatel
      notes: "Fibre Pro 200 Mbps.",
    },
    {
      title: "Salaires techniciens & assistance",
      category: "SALAIRES",
      amount: 850000,
      expenseDate: subDays(now, 9),
      paymentMethod: "BANK_TRANSFER",
      isPaid: true,
      supplierId: null,
      notes: "Paiement salaires équipe technique.",
    },
    {
      title: "Commande réapprovisionnement ramettes papier",
      category: "ACHAT_FOURNISSEUR",
      amount: 420000,
      expenseDate: subDays(now, 14),
      paymentMethod: "BANK_TRANSFER",
      isPaid: true,
      supplierId: suppliers[1].id, // PCS
      notes: "Facture PCS-2024-998 réglée.",
    },
    {
      title: "Achat lot de 5 PC Portables Dell Vostro",
      category: "ACHAT_FOURNISSEUR",
      amount: 1900000,
      expenseDate: subDays(now, 16),
      paymentMethod: "BANK_TRANSFER",
      isPaid: false, // Dette fournisseur impayée
      supplierId: suppliers[0].id, // Global Hardware
      notes: "Facture d'importation GH-2024-093. Échéance dans 15 jours. DETTE FOURNISSEUR ACTIVE.",
    },
    {
      title: "Frais de dédouanement et fret maritime",
      category: "TRANSPORT",
      amount: 280000,
      expenseDate: subDays(now, 19),
      paymentMethod: "CASH",
      isPaid: true,
      supplierId: suppliers[3].id, // TLEO Transit
      notes: "Transit et dédouanement conteneur matériel.",
    },
    {
      title: "Campagne sponsorisée Facebook & LinkedIn",
      category: "MARKETING",
      amount: 65000,
      expenseDate: subDays(now, 3),
      paymentMethod: "BANK_TRANSFER",
      isPaid: true,
      supplierId: null,
      notes: "Promotion services IT pour entreprises.",
    },
  ];

  for (const exp of expensesData) {
    await prisma.expense.create({ data: exp });
  }

  console.log("✅ Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("Erreur durant le seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
