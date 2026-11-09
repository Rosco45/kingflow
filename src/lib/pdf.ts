import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Exports an HTML element to a high-resolution A4 PDF document
 */
export async function exportElementToPdf(
  elementId: string,
  filename: string = "Facture_KingFlow.pdf"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Élément #${elementId} introuvable pour la génération PDF.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for crisp print quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
  } catch (err) {
    console.error("Erreur lors de la génération PDF :", err);
    throw err;
  }
}

/**
 * Triggers clean print view for 80mm thermal receipt
 */
export function printThermalReceipt(receiptElementId: string) {
  const receiptElement = document.getElementById(receiptElementId);
  if (!receiptElement) {
    window.print();
    return;
  }

  // Create an iframe to print strictly the receipt without UI chrome
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ticket de Caisse 80mm - KingFlow</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace, monospace;
            width: 80mm;
            margin: 0;
            padding: 10px;
            font-size: 11px;
            color: #000;
            background: #fff;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-top: 1px dashed #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .table { width: 100%; border-collapse: collapse; margin: 6px 0; }
          .table th { text-align: left; border-bottom: 1px solid #000; padding: 2px 0; }
          .table td { padding: 3px 0; font-size: 10.5px; }
          .text-right { text-align: right; }
          .total-box { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin-top: 6px; }
        </style>
      </head>
      <body>
        ${receiptElement.innerHTML}
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 300);
}

/**
 * Prepares and opens WhatsApp message with pre-formatted invoice breakdown
 */
export function shareInvoiceViaWhatsApp(options: {
  phone?: string | null;
  customerName: string;
  invoiceNumber: string;
  total: string;
  balanceDue: string;
  dueDate: string;
  companyName: string;
}) {
  const cleanPhone = (options.phone || "").replace(/[^0-9]/g, "");

  const message = `*Bonjour ${options.customerName}*,\n\nVoici le point concernant votre facture *${options.invoiceNumber}* émise par *${options.companyName}* :\n\n📌 *Montant Total :* ${options.total}\n💳 *Reste à régler :* ${options.balanceDue}\n📅 *Date d'échéance :* ${options.dueDate}\n\nMerci de procéder au règlement par Wave, Orange Money ou Virement bancaire.\nPour toute question, nous restons à votre entière disposition.\n\n_Cordialement,_ \n*${options.companyName}*`;

  const encoded = encodeURIComponent(message);
  const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;

  window.open(url, "_blank");
}
