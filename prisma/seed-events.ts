import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedEvents() {
  console.log("🌱 Insertion des événements agenda...");
  const now = new Date("2026-11-09T09:00:00Z");

  const events = [
    {
      title: "Livraison 5 Ordinateurs Dell Vostro",
      type: "LIVRAISON",
      date: new Date("2026-11-09T11:30:00Z"),
      time: "11:30",
      location: "Siège Bamba Tech Innovations, Cocody",
      clientName: "Fatou Bamba",
      notes: "Vérifier les bordereaux de livraison et signature du BL.",
      isDone: false,
    },
    {
      title: "Réunion commerciale trimestrielle équipe KingFlow",
      type: "REUNION",
      date: new Date("2026-11-09T15:00:00Z"),
      time: "15:00",
      location: "Salle de réunion Siège Dakar",
      clientName: "Équipe Interne",
      notes: "Point sur les objectifs Q4, recouvrages des créances et stocks.",
      isDone: false,
    },
    {
      title: "Signature contrat annuel de maintenance IT",
      type: "RDV_CLIENT",
      date: new Date("2026-11-09T16:45:00Z"),
      time: "16:45",
      location: "Clinique Médicale Yoff",
      clientName: "Dr. Aïssatou Sow",
      notes: "Contrat annuel 10 postes + télémaintenance 24/7.",
      isDone: false,
    },
    {
      title: "Arrivage conteneur Global Hardware SARL (Routeurs & Onduleurs)",
      type: "LIVRAISON",
      date: new Date("2026-11-10T09:00:00Z"),
      time: "09:00",
      location: "Port Autonome de Dakar, Hangar 4",
      clientName: "Global Hardware Imports",
      notes: "Dédouanement TLEO Transit terminé.",
      isDone: false,
    },
    {
      title: "Relance créance Superette Express Ouest",
      type: "ECHEANCE",
      date: new Date("2026-11-10T14:00:00Z"),
      time: "14:00",
      location: "Marché Mermoz",
      clientName: "Moussa Konaté",
      notes: "Facture FACT-2024-003 en retard de 8 jours (329.220 FCFA).",
      isDone: false,
    },
    {
      title: "Inventaire physique mensuel & réajustement des stocks",
      type: "INVENTAIRE",
      date: new Date("2026-11-12T08:30:00Z"),
      time: "08:30",
      location: "Dépôt Central",
      clientName: "Équipe Logistique",
      notes: "Comptage complet consommables et accessoires.",
      isDone: false,
    },
    {
      title: "Échéance règlement fournisseur Global Hardware (1.900.000 FCFA)",
      type: "ECHEANCE",
      date: new Date("2026-11-15T17:00:00Z"),
      time: "17:00",
      location: "Virement BICIS",
      clientName: "Global Hardware",
      notes: "Facture GH-2024-093 à solder.",
      isDone: false,
    },
    {
      title: "Visite de courtoisie & réapprovisionnement Studio Mariam",
      type: "RDV_CLIENT",
      date: new Date("2026-11-18T10:00:00Z"),
      time: "10:00",
      location: "Sacré-Cœur 3",
      clientName: "Mariam Diop",
      notes: "Présentation de la nouvelle gamme d'accessoires et caisses.",
      isDone: false,
    },
  ];

  for (const ev of events) {
    await prisma.calendarEvent.create({ data: ev });
  }

  console.log(`✅ ${events.length} événements insérés dans l'agenda.`);
}

seedEvents()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
