import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Cache for 60 seconds

export async function GET() {
  try {
    const [totalTransactions, successfulTransactions, activeMerchants, totalVolume] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.count({ where: { status: "COMPLETED" } }),
      prisma.merchant.count({ where: { status: "ACTIVE" } }),
      prisma.transaction.aggregate({
        where: { status: "COMPLETED" },
        _sum: { amount: true },
      }),
    ]);

    const successRate = totalTransactions > 0 
      ? ((successfulTransactions / totalTransactions) * 100).toFixed(1)
      : "99.9";

    return NextResponse.json({
      successRate: `${successRate}%`,
      totalTransactions: totalTransactions.toLocaleString(),
      activeMerchants: activeMerchants.toLocaleString(),
      totalVolume: `KES ${(Number(totalVolume._sum.amount || 0) / 1000000).toFixed(1)}M`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
