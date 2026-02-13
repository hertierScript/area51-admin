"use client";

import { useEffect, useState } from "react";
import { Order, OrderItem } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  ShoppingCart,
  Loader2,
  Eye,
  MapPin,
  Phone,
  Clock,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface OrderWithItems extends Order {
  order_items?: (OrderItem & { menu_item?: { name: string } })[];
}

// Play bell.mp3 sound
function playBellSound() {
  const audio = new Audio("/bell.mp3");
  audio.volume = 0.8;
  audio.play().catch((err) => {
    console.error("Failed to play bell sound:", err);
  });
}

// Order notification - plays bell sound
function playOrderNotification() {
  playBellSound();
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  useEffect(() => {
    fetchOrders();

    // Auto-refresh every 10 seconds if enabled
    const interval = setInterval(() => {
      if (isAutoRefreshEnabled) {
        fetchOrdersSilent();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isAutoRefreshEnabled]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const response = await fetch("/api/orders");
      const result = await response.json();

      if (!response.ok) {
        console.error("Error fetching orders:", result.error);
        toast.error(`Failed to fetch orders: ${result.error}`);
        return;
      }

      console.log("Orders fetched successfully:", result.data);
      const newOrders = result.data || [];
      setOrders(newOrders);
      setLastOrderCount(newOrders.length);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }

  async function fetchOrdersSilent() {
    try {
      const response = await fetch("/api/orders");
      const result = await response.json();

      if (!response.ok) {
        return;
      }

      const newOrders = result.data || [];

      // Check if there are new orders
      if (newOrders.length > lastOrderCount && lastOrderCount > 0) {
        const newCount = newOrders.length - lastOrderCount;
        setNewOrdersCount(newCount);
        playOrderNotification();
        toast.success(
          `${newCount} new order${newCount > 1 ? "s" : ""} received!`,
          {
            duration: 5000,
          },
        );
      }

      setOrders(newOrders);
      setLastOrderCount(newOrders.length);
    } catch (err) {
      // Silent fail for auto-refresh
    }
  }

  function testSound() {
    playOrderNotification();
    toast.info("Test sound played!", { duration: 2000 });
  }

  async function updateOrderStatus(orderId: string, status: string) {
    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });

      if (!response.ok) {
        const result = await response.json();
        toast.error(`Failed to update order: ${result.error}`);
        return;
      }

      toast.success("Order status updated");
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("Failed to update order status");
    }
  }

  function viewOrderDetails(order: OrderWithItems) {
    setSelectedOrder(order);
    setIsDialogOpen(true);
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.email
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400";
      case "confirmed":
        return "bg-blue-500/20 text-blue-400";
      case "preparing":
        return "bg-orange-500/20 text-orange-400";
      case "ready":
        return "bg-green-500/20 text-green-400";
      case "delivered":
        return "bg-emerald-500/20 text-emerald-400";
      case "cancelled":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with auto-refresh toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage customer orders and their status
          </p>
        </div>
        <div className="flex items-center gap-4">
          {newOrdersCount > 0 && (
            <Button
              variant="outline"
              onClick={() => {
                setNewOrdersCount(0);
                fetchOrders();
              }}
              className="animate-pulse border-yellow-500/50 text-yellow-500"
            >
              <Bell className="h-4 w-4 mr-2" />
              {newOrdersCount} new order{newOrdersCount > 1 ? "s" : ""}
            </Button>
          )}
          <Button
            variant="outline"
            onClick={testSound}
            size="sm"
            title="Test notification sound"
          >
            <Bell className="h-4 w-4 mr-2" />
            Test Sound
          </Button>
          <Button
            variant={isAutoRefreshEnabled ? "default" : "outline"}
            onClick={() => setIsAutoRefreshEnabled(!isAutoRefreshEnabled)}
            size="sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            {isAutoRefreshEnabled ? "Auto-refresh On" : "Auto-refresh Off"}
          </Button>
          <Button variant="outline" onClick={fetchOrders} size="sm">
            <Loader2 className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders by customer name, email, or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            All Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.slice(-8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.customer?.name || "Guest"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.customer?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">
                          {order.order_items?.length || 0} items
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">
                        {formatPrice(order.total || 0)}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            updateOrderStatus(order.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="ready">Ready</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => viewOrderDetails(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Order Details
            </DialogTitle>
            <DialogDescription>
              Order #{selectedOrder?.id.slice(-8).toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Status */}
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">
                      Estimated: 30-45 mins
                    </p>
                  </div>
                </div>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  {selectedOrder.status}
                </Badge>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-6">
                          {item.quantity}x
                        </span>
                        <span className="font-medium">
                          {item.menu_item?.name || "Unknown Item"}
                        </span>
                      </div>
                      <span className="text-sm">
                        {formatPrice(item.total_price)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal || 0)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-500">
                      -{formatPrice(selectedOrder.discount_amount)}
                    </span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">
                    {formatPrice(selectedOrder.total || 0)}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Customer Info */}
              <div>
                <h4 className="font-medium mb-3">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-medium text-primary">
                        {selectedOrder.customer?.name
                          ?.charAt(0)
                          .toUpperCase() || "C"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedOrder.customer?.name || "Guest"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedOrder.customer?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {selectedOrder.customer?.phone || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </h4>
                <p className="text-muted-foreground">
                  {selectedOrder.delivery_address || "Not specified"}
                </p>
                {selectedOrder.notes && (
                  <div className="mt-3 p-3 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Special Instructions:</span>{" "}
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
