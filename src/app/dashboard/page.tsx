"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  DollarSign,
  UtensilsCrossed,
  Users,
  Tag,
  TrendingUp,
  Clock,
} from "lucide-react";
import { DashboardStats, Order } from "@/types/database";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatPrice } from "@/lib/utils";

const CHART_COLORS = ["#4ade80", "#7c3aed", "#06b6d4", "#f59e0b", "#ef4444"];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activePromotions: 0,
    totalMenuItems: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<
    { name: string; value: number }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      // Fetch orders data via API
      const ordersResponse = await fetch("/api/orders");
      const ordersResult = await ordersResponse.json();

      if (!ordersResponse.ok) {
        console.error("Error fetching orders:", ordersResult.error);
      }

      const orders = ordersResult.data || [];

      // Calculate stats from orders
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(
        (o: Order) => o.status === "pending",
      ).length;
      const totalRevenue = orders.reduce(
        (sum: number, order: Order) => sum + (order.total || 0),
        0,
      );

      // Calculate orders by status
      const statusCounts: Record<string, number> = {};
      orders.forEach((order: Order) => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      });
      const statusChartData = Object.entries(statusCounts).map(
        ([name, value]) => ({ name, value }),
      );

      // Get recent orders (last 5)
      const recentOrdersData = orders
        .sort(
          (a: Order, b: Order) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, 5);

      // Fetch other stats via API routes
      const menuResponse = await fetch("/api/menu/count");
      const menuCount = await menuResponse.json();

      const customersResponse = await fetch("/api/customers/count");
      const customersCount = await customersResponse.json();

      const promotionsResponse = await fetch("/api/promotions/count");
      const promotionsCount = await promotionsResponse.json();

      setStats({
        totalOrders,
        pendingOrders,
        totalRevenue,
        activePromotions: promotionsCount || 0,
        totalMenuItems: menuCount || 0,
        totalCustomers: customersCount || 0,
      });
      setRecentOrders(recentOrdersData);
      setOrdersByStatus(statusChartData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
    },
    // {
    //   title: 'Pending Orders',
    //   value: stats.pendingOrders,
    //   icon: Clock,
    //   color: 'text-chart-4',
    //   bgColor: 'bg-chart-4/10'
    // },
    // {
    //   title: 'Total Revenue',
    //   value: `$${stats.totalRevenue.toFixed(2)}`,
    //   icon: DollarSign,
    //   color: 'text-chart-1',
    //   bgColor: 'bg-chart-1/10'
    // },
    {
      title: "Menu Items",
      value: stats.totalMenuItems,
      icon: UtensilsCrossed,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Customers",
      value: stats.totalCustomers,
      icon: Users,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    // {
    //   title: 'Active Promotions',
    //   value: stats.activePromotions,
    //   icon: Tag,
    //   color: 'text-chart-5',
    //   bgColor: 'bg-chart-5/10'
    // },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text">Overall Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's your restaurant overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="border-border/50 hover:border-primary/50 transition-colors"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Status */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Orders by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {ordersByStatus.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent || 0) * 100).toFixed(0)}%`
                      }
                    >
                      {ordersByStatus.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#131320",
                        border: "1px solid #2d2d44",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No order data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                  >
                    <div>
                      <p className="font-medium">
                        {(order as any).customer?.name || "Guest"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {formatPrice(order.total || 0)}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-500/20 text-green-400"
                            : order.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : order.status === "cancelled"
                                ? "bg-red-500/20 text-red-400"
                                : "bg-blue-500/20 text-blue-400"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No recent orders
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
