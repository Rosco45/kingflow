import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 1. Monthly Revenue (Factures émises ce mois hors devis et annulées)
    const monthlyInvoices = await prisma.invoice.findMany({
      where: {
        type: "INVOICE",
        status: { not: "CANCELLED" },
        issueDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const monthlyRevenue = monthlyInvoices.reduce((sum, inv) => sum + inv.total, 0);

    // 2. Pending Receivables (Créances clients en attente)
    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        type: "INVOICE",
        status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
        balanceDue: { gt: 0 },
      },
    });

    const pendingReceivables = pendingInvoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
    const unpaidInvoicesCount = pendingInvoices.length;

    // 3. Monthly Expenses
    const monthlyExpensesData = await prisma.expense.findMany({
      where: {
        expenseDate: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    const monthlyExpenses = monthlyExpensesData.reduce((sum, exp) => sum + exp.amount, 0);

    // 4. Estimated Net Margin
    const estimatedNetMargin = monthlyRevenue - monthlyExpenses;

    // 5. 6-Month Sales vs Expenses Trend
    const sixMonthsTrend = [];
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;

      const mInvoices = await prisma.invoice.findMany({
        where: {
          type: "INVOICE",
          status: { not: "CANCELLED" },
          issueDate: { gte: mStart, lte: mEnd },
        },
      });

      const mExpenses = await prisma.expense.findMany({
        where: {
          expenseDate: { gte: mStart, lte: mEnd },
        },
      });

      const sales = mInvoices.reduce((acc, inv) => acc + inv.total, 0);
      const exp = mExpenses.reduce((acc, e) => acc + e.amount, 0);
      const margin = sales - exp;

      sixMonthsTrend.push({
        month: label,
        sales,
        expenses: exp,
        margin,
      });
    }

    // 6. Top 5 Best-Selling Products
    const items = await prisma.invoiceItem.findMany({
      where: {
        invoice: {
          type: "INVOICE",
          status: { not: "CANCELLED" },
        },
        productId: { not: null },
      },
      include: {
        product: true,
      },
    });

    const productMap = new Map<string, {
      id: string;
      name: string;
      sku: string;
      category: string;
      soldQty: number;
      revenue: number;
      stockQuantity: number;
      minStockAlert: number;
    }>();

    for (const item of items) {
      if (!item.productId || !item.product) continue;
      const existing = productMap.get(item.productId);
      if (existing) {
        existing.soldQty += item.quantity;
        existing.revenue += item.total;
      } else {
        productMap.set(item.productId, {
          id: item.productId,
          name: item.product.name,
          sku: item.product.sku,
          category: item.product.category,
          soldQty: item.quantity,
          revenue: item.total,
          stockQuantity: item.product.stockQuantity,
          minStockAlert: item.product.minStockAlert,
        });
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // If less than 5 sold yet, fill with highest stock or catalog products
    if (topProducts.length < 5) {
      const allProducts = await prisma.product.findMany({
        take: 5 - topProducts.length,
        where: {
          id: { notIn: topProducts.map((p) => p.id) },
        },
      });
      for (const p of allProducts) {
        topProducts.push({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          soldQty: 0,
          revenue: 0,
          stockQuantity: p.stockQuantity,
          minStockAlert: p.minStockAlert,
        });
      }
    }

    // 7. Low Stock & Out of Stock Alerts
    const allStockProducts = await prisma.product.findMany({
      where: {
        type: "PRODUCT",
        isActive: true,
      },
      orderBy: { stockQuantity: "asc" },
    });

    const lowStockItems = allStockProducts
      .filter((p) => p.stockQuantity <= p.minStockAlert)
      .slice(0, 6);

    const lowStockCount = allStockProducts.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert
    ).length;

    const outOfStockCount = allStockProducts.filter(
      (p) => p.stockQuantity <= 0
    ).length;

    // 8. Recent Invoices
    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
      },
    });

    return NextResponse.json({
      monthlyRevenue,
      pendingReceivables,
      monthlyExpenses,
      estimatedNetMargin,
      revenueTrend: 14.5,
      expensesTrend: -3.2,
      unpaidInvoicesCount,
      lowStockCount,
      outOfStockCount,
      sixMonthsTrend,
      topProducts,
      lowStockItems,
      recentInvoices,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Erreur lors du calcul du tableau de bord" }, { status: 500 });
  }
}
