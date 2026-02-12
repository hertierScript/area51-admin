"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Promotion } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Plus,
  Pencil,
  Trash2,
  Search,
  Tag,
  Loader2,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null,
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: 0,
    minimum_order: 0,
    is_active: true,
    valid_from: "",
    valid_until: "",
  });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchPromotions();
  }, []);

  async function fetchPromotions() {
    const { data, error } = await supabase
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setPromotions(data);
    setLoading(false);
  }

  function openModal(promotion?: Promotion) {
    if (promotion) {
      setEditingPromotion(promotion);
      setFormData({
        title: promotion.title,
        description: promotion.description || "",
        discount_type: promotion.discount_type,
        discount_value: promotion.discount_value,
        minimum_order: promotion.minimum_order || 0,
        is_active: promotion.is_active,
        valid_from: promotion.valid_from
          ? new Date(promotion.valid_from).toISOString().split("T")[0]
          : "",
        valid_until: promotion.valid_until
          ? new Date(promotion.valid_until).toISOString().split("T")[0]
          : "",
      });
    } else {
      setEditingPromotion(null);
      setFormData({
        title: "",
        description: "",
        discount_type: "percentage",
        discount_value: 0,
        minimum_order: 0,
        is_active: true,
        valid_from: "",
        valid_until: "",
      });
    }
    setIsModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const promotionData = {
        ...formData,
        valid_from: formData.valid_from
          ? new Date(formData.valid_from).toISOString()
          : null,
        valid_until: formData.valid_until
          ? new Date(formData.valid_until).toISOString()
          : null,
      };

      if (editingPromotion) {
        const { error } = await supabase
          .from("promotions")
          .update({
            ...promotionData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPromotion.id);

        if (error) throw error;
        toast.success("Promotion updated successfully");
      } else {
        const { error } = await supabase
          .from("promotions")
          .insert(promotionData);

        if (error) throw error;
        toast.success("Promotion created successfully");
      }

      setIsModalOpen(false);
      fetchPromotions();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    const { error } = await supabase.from("promotions").delete().eq("id", id);

    if (!error) {
      toast.success("Promotion deleted successfully");
      fetchPromotions();
    } else {
      toast.error("Failed to delete promotion");
    }
  }

  async function togglePromotionStatus(promotion: Promotion) {
    const { error } = await supabase
      .from("promotions")
      .update({ is_active: !promotion.is_active })
      .eq("id", promotion.id);

    if (!error) {
      toast.success(
        `Promotion ${promotion.is_active ? "deactivated" : "activated"}`,
      );
      fetchPromotions();
    }
  }

  const filteredPromotions = promotions.filter(
    (promotion) =>
      promotion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promotion.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Promotions</h1>
          <p className="text-muted-foreground mt-1">
            Manage special offers and discounts
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openModal()} className="glow-green">
              <Plus className="h-4 w-4 mr-2" />
              Add Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPromotion ? "Edit Promotion" : "Add New Promotion"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_type">Discount Type</Label>
                  <Select
                    value={formData.discount_type}
                    onValueChange={(value: "percentage" | "fixed") =>
                      setFormData({ ...formData, discount_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_value">
                    Discount Value{" "}
                    {formData.discount_type === "percentage" ? "(%)" : "($)"}
                  </Label>
                  <Input
                    id="discount_value"
                    type="number"
                    step={
                      formData.discount_type === "percentage" ? "1" : "0.01"
                    }
                    value={formData.discount_value || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_value: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum_order">Minimum Order ($)</Label>
                <Input
                  id="minimum_order"
                  type="number"
                  step="0.01"
                  value={formData.minimum_order || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimum_order: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="valid_from">Valid From</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) =>
                      setFormData({ ...formData, valid_from: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valid_until">Valid Until</Label>
                  <Input
                    id="valid_until"
                    type="date"
                    value={formData.valid_until}
                    onChange={(e) =>
                      setFormData({ ...formData, valid_until: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingPromotion ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search promotions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Promotions Table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            All Promotions ({filteredPromotions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No promotions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min Order</TableHead>
                    <TableHead>Valid Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPromotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell className="font-medium">
                        {promotion.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Percent className="h-4 w-4 text-primary" />
                          <span>
                            {promotion.discount_type === "percentage"
                              ? `${promotion.discount_value}%`
                              : `$${promotion.discount_value.toFixed(2)}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {promotion.minimum_order
                          ? `$${promotion.minimum_order.toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {promotion.valid_from && (
                            <div>
                              From:{" "}
                              {new Date(
                                promotion.valid_from,
                              ).toLocaleDateString()}
                            </div>
                          )}
                          {promotion.valid_until && (
                            <div>
                              To:{" "}
                              {new Date(
                                promotion.valid_until,
                              ).toLocaleDateString()}
                            </div>
                          )}
                          {!promotion.valid_from &&
                            !promotion.valid_until &&
                            "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={promotion.is_active}
                            onCheckedChange={() =>
                              togglePromotionStatus(promotion)
                            }
                          />
                          {isExpired(promotion.valid_until) && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openModal(promotion)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(promotion.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
