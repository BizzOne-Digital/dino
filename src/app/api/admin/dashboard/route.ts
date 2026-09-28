import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { ContactSubmission } from "@/models/ContactSubmission";
import { DiscountCode } from "@/models/DiscountCode";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const { error, session } = await requireAdmin();
  if (error) return error;

  await connectDB();
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalSales,
    ordersToday,
    ordersWeek,
    ordersMonth,
    pendingOrders,
    preparingOrders,
    pickupOrders,
    deliveryOrders,
    recentOrders,
    recentInquiries,
    activeDiscounts,
    lowStockProducts,
    topProducts,
  ] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: { $in: ["paid", "pending"] }, orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: startOfDay } }),
    Order.countDocuments({ createdAt: { $gte: startOfWeek } }),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ orderStatus: "pending" }),
    Order.countDocuments({ orderStatus: "preparing" }),
    Order.countDocuments({ fulfillment: "pickup", orderStatus: { $nin: ["completed", "cancelled"] } }),
    Order.countDocuments({ fulfillment: "delivery", orderStatus: { $nin: ["completed", "cancelled"] } }),
    Order.find().sort({ createdAt: -1 }).limit(10).lean(),
    ContactSubmission.find({ isRead: false }).sort({ createdAt: -1 }).limit(5).lean(),
    DiscountCode.find({ isActive: true }).lean(),
    Product.find({ inStock: true, stock: { $lte: 5, $gt: 0 } }).limit(5).lean(),
    Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", totalSold: { $sum: "$items.quantity" }, revenue: { $sum: "$items.lineTotal" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return NextResponse.json({
    stats: {
      totalSales: totalSales[0]?.total || 0,
      ordersToday,
      ordersWeek,
      ordersMonth,
      pendingOrders,
      preparingOrders,
      pickupOrders,
      deliveryOrders,
    },
    recentOrders: recentOrders.map((o) => ({ ...o, _id: o._id.toString() })),
    recentInquiries: recentInquiries.map((i) => ({ ...i, _id: i._id.toString() })),
    activeDiscounts,
    lowStockProducts: lowStockProducts.map((p) => ({ ...p, _id: p._id.toString() })),
    topProducts,
    admin: session?.user,
  });
}
