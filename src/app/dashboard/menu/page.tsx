"use client";

import { useEffect, useState } from "react";
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
  UtensilsCrossed,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

// Helper function to get auth token
function getAuthToken() {
  const stored = localStorage.getItem("admin_session");
  if (!stored) return null;
  return `Bearer ${btoa(stored)}`;
}

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  is_available: boolean;
  image_url: string | null;
  created_at: string;
  category?: Category;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    category_id: "",
    is_available: true,
    image_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch("/api/categories", {
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const result = await response.json();
      if (result.data) setCategories(result.data);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      toast.error(error.message || "Failed to fetch categories");
    }
  }

  async function fetchMenuItems() {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Not authenticated");
        setLoading(false);
        return;
      }

      const response = await fetch("/api/menu-items", {
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch menu items");
      }

      const result = await response.json();
      if (result.data) setMenuItems(result.data);
    } catch (error: any) {
      console.error("Error fetching menu items:", error);
      toast.error(error.message || "Failed to fetch menu items");
    } finally {
      setLoading(false);
    }
  }

  function openModal(item?: MenuItem) {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description || "",
        price: item.price,
        category_id: item.category_id,
        is_available: item.is_available,
        image_url: item.image_url || "",
      });
      setImagePreview(item.image_url || "");
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        description: "",
        price: 0,
        category_id: "",
        is_available: true,
        image_url: "",
      });
      setImagePreview("");
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  }

  async function handleImageUpload(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to upload image");
    }

    return result.url;
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleRemoveImage() {
    setSelectedFile(null);
    setImagePreview("");
    setFormData({ ...formData, image_url: "" });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setUploading(true);

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      let imageUrl = formData.image_url;

      // Upload new image if a file is selected
      if (selectedFile) {
        imageUrl = await handleImageUpload(selectedFile);
      }

      const itemData = {
        ...formData,
        image_url: imageUrl,
        price: parseFloat(formData.price.toString()),
      };

      if (editingItem) {
        const response = await fetch("/api/menu-items", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify({
            id: editingItem.id,
            ...itemData,
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Failed to update menu item");
        }

        toast.success("Menu item updated successfully");
      } else {
        const response = await fetch("/api/menu-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          body: JSON.stringify(itemData),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || "Failed to create menu item");
        }

        toast.success("Menu item created successfully");
      }

      setIsModalOpen(false);
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch(`/api/menu-items?id=${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to delete menu item");
      }

      toast.success("Menu item deleted successfully");
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete menu item");
    }
  }

  async function toggleAvailability(item: MenuItem) {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Not authenticated");
        return;
      }

      const response = await fetch("/api/menu-items", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          id: item.id,
          is_available: !item.is_available,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to update menu item");
      }

      toast.success(
        `Menu item ${item.is_available ? "marked unavailable" : "marked available"}`,
      );
      fetchMenuItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to update menu item");
    }
  }

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold gradient-text">
            Menu Items
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage your restaurant menu
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => openModal()}
              className="glow-green w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90dvh] flex flex-col p-0 w-[95vw] h-[85dvh] sm:h-auto">
            <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 flex-shrink-0 border-b">
              <DialogTitle className="text-lg sm:text-xl">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                <div className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={2}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price" className="text-sm">
                        Price ($)
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        required
                        className="h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm">
                        Category
                      </Label>
                      <Select
                        value={formData.category_id}
                        onValueChange={(value) =>
                          setFormData({ ...formData, category_id: value })
                        }
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-sm">
                      Image
                    </Label>
                    <div className="space-y-3">
                      {imagePreview ? (
                        <div className="relative group w-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-32 sm:h-48 object-cover rounded-lg border border-border"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            onClick={handleRemoveImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center hover:border-primary/50 transition-colors">
                          <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                            Drag and drop an image, or click to select
                          </p>
                          <Input
                            id="image"
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              document.getElementById("image")?.click()
                            }
                            className="h-8 sm:h-9 text-xs sm:text-sm"
                          >
                            <Upload className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            Select Image
                          </Button>
                        </div>
                      )}
                      {!imagePreview && (
                        <Input
                          id="image"
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={handleFileSelect}
                          className="h-10"
                        />
                      )}
                      <p className="text-[10px] sm:text-xs text-muted-foreground">
                        Supported formats: JPEG, PNG, WebP, GIF (max 5MB)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <Label
                      htmlFor="is_available"
                      className="cursor-pointer text-sm"
                    >
                      Available
                    </Label>
                    <Switch
                      id="is_available"
                      checked={formData.is_available}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_available: checked })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter className="px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 border-t flex-col-reverse sm:flex-row gap-2 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving || uploading}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full sm:w-auto"
                >
                  {(saving || uploading) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {uploading
                    ? "Uploading..."
                    : editingItem
                      ? "Update"
                      : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-border/50">
        <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Table */}
      <Card className="border-border/50">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <UtensilsCrossed className="h-5 w-5 text-primary" />
            All Menu Items ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No menu items found
            </div>
          ) : (
            <div className="overflow-x-auto -mx-2 sm:mx-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 sm:w-20">Image</TableHead>
                    <TableHead className="min-w-[140px] sm:min-w-[180px]">
                      Name
                    </TableHead>
                    <TableHead className="min-w-[100px] sm:min-w-[120px] hidden sm:table-cell">
                      Category
                    </TableHead>
                    <TableHead className="min-w-[70px] sm:min-w-[80px]">
                      Price
                    </TableHead>
                    <TableHead className="min-w-[100px] sm:min-w-[120px]">
                      Status
                    </TableHead>
                    <TableHead className="w-24 sm:w-28 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="p-2 sm:p-4">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-md flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <div>
                          <div className="font-medium text-sm sm:text-base">
                            {item.name}
                          </div>
                          {item.description && (
                            <div className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                              {item.description}
                            </div>
                          )}
                          {item.category && (
                            <div className="sm:hidden mt-1">
                              <Badge variant="outline" className="text-[10px]">
                                {item.category.name}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="p-2 sm:p-4 hidden sm:table-cell">
                        <Badge variant="outline">
                          {item.category?.name || "Uncategorized"}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2 sm:p-4 font-medium text-sm sm:text-base">
                        {formatPrice(item.price)}
                      </TableCell>
                      <TableCell className="p-2 sm:p-4">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={item.is_available}
                            onCheckedChange={() => toggleAvailability(item)}
                            className="scale-90 sm:scale-100"
                          />
                          <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                            {item.is_available ? "Available" : "Unavailable"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="p-2 sm:p-4 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openModal(item)}
                            className="h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 sm:h-9 sm:w-9"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
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
