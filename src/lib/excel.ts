import * as XLSX from "xlsx";
import { InvoiceData, ExpenseData, ProductData, CustomerData } from "@/types";

/**
 * Downloads a generated XLSX workbook
 */
export function downloadWorkbook(workbook: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(workbook, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

/**
 * Export Invoices & Sales to Excel
 */
export function exportInvoicesToExcel(invoices: InvoiceData[], filename = "KingFlow_Factures_Ventes") {
  const data = invoices.map((inv) => ({
    "N° Document": inv.number,
    "Type": inv.type === "INVOICE" ? "Facture" : "Devis",
    "Client": inv.customer?.name || "N/A",
    "Entreprise": inv.customer?.companyName || "",
    "Téléphone": inv.customer?.phone || "",
    "Statut": translateStatus(inv.status),
    "Date Émission": new Date(inv.issueDate).toLocaleDateString("fr-FR"),
    "Date Échéance": new Date(inv.dueDate).toLocaleDateString("fr-FR"),
    "Sous-total (FCFA)": inv.subtotal,
    "Remise (FCFA)": inv.discountAmount,
    "TVA (FCFA)": inv.taxAmount,
    "Total TTC (FCFA)": inv.total,
    "Total Payé (FCFA)": inv.paidAmount,
    "Reste Dû (FCFA)": inv.balanceDue,
    "Conditions": inv.notes || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Factures & Ventes");
  downloadWorkbook(workbook, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

/**
 * Export Expenses to Excel
 */
export function exportExpensesToExcel(expenses: ExpenseData[], filename = "KingFlow_Grand_Livre_Depenses") {
  const data = expenses.map((exp) => ({
    "Description": exp.title,
    "Catégorie": translateExpenseCategory(exp.category),
    "Montant (FCFA)": exp.amount,
    "Date": new Date(exp.expenseDate).toLocaleDateString("fr-FR"),
    "Mode de Paiement": exp.paymentMethod,
    "Statut": exp.isPaid ? "Payé" : "Dette non payée",
    "Fournisseur": exp.supplier?.name || "N/A",
    "Notes": exp.notes || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Grand Livre Dépenses");
  downloadWorkbook(workbook, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

/**
 * Export Stock Inventory to Excel
 */
export function exportInventoryToExcel(products: ProductData[], filename = "KingFlow_Etat_Des_Stocks") {
  const data = products.map((prod) => {
    let status = "En stock";
    if (prod.stockQuantity <= 0) status = "Rupture de stock";
    else if (prod.stockQuantity <= prod.minStockAlert) status = "Stock critique / faible";

    const valorisationAchat = prod.stockQuantity * prod.purchasePrice;
    const valorisationVente = prod.stockQuantity * prod.sellingPrice;
    const margeEstimee = prod.sellingPrice - prod.purchasePrice;

    return {
      "SKU / Réf": prod.sku,
      "Désignation": prod.name,
      "Catégorie": prod.category,
      "Type": prod.type === "PRODUCT" ? "Article de stock" : "Prestation de service",
      "Quantité en Stock": prod.stockQuantity,
      "Unité": prod.unit,
      "Seuil d'Alerte": prod.minStockAlert,
      "Statut Stock": status,
      "Prix Achat (FCFA)": prod.purchasePrice,
      "Prix Vente (FCFA)": prod.sellingPrice,
      "Marge Unitaire (FCFA)": margeEstimee,
      "Valeur Stock Achat (FCFA)": valorisationAchat,
      "Valeur Stock Vente (FCFA)": valorisationVente,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventaire & Valorisation");
  downloadWorkbook(workbook, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

/**
 * Export Customer Receivables (Balance des créances) to Excel
 */
export function exportReceivablesToExcel(customers: CustomerData[], filename = "KingFlow_Balance_Creances_Clients") {
  const debtors = customers.filter((c) => (c.balanceDue || 0) > 0);

  const data = debtors.map((c) => ({
    "Client": c.name,
    "Entreprise": c.companyName || "",
    "Téléphone": c.phone || "",
    "WhatsApp": c.whatsapp || "",
    "Ville / Pays": `${c.city || ""} (${c.country || ""})`,
    "Total Facturé (FCFA)": c.totalBilled || 0,
    "Total Réglé (FCFA)": c.totalPaid || 0,
    "Créance Restante Dûe (FCFA)": c.balanceDue || 0,
    "Factures Impayées": c.invoices?.filter((i) => i.balanceDue > 0).length || 0,
    "Notes": c.notes || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Balance Créances");
  downloadWorkbook(workbook, `${filename}_${new Date().toISOString().split("T")[0]}`);
}

function translateStatus(status: string): string {
  switch (status) {
    case "PAID":
      return "Payé";
    case "PARTIALLY_PAID":
      return "Partiellement payé";
    case "SENT":
      return "Envoyé";
    case "DRAFT":
      return "Brouillon";
    case "OVERDUE":
      return "En retard";
    case "CANCELLED":
      return "Annulé";
    default:
      return status;
  }
}

function translateExpenseCategory(cat: string): string {
  switch (cat) {
    case "LOYER":
      return "Loyer";
    case "ELECTRICITE_EAU":
      return "Électricité & Eau";
    case "TRANSPORT":
      return "Transport & Logistique";
    case "SALAIRES":
      return "Salaires & Rémunérations";
    case "ACHAT_FOURNISSEUR":
      return "Achats & Réapprovisionnement";
    case "MARKETING":
      return "Marketing & Communication";
    default:
      return "Autres charges";
  }
}
