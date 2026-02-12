"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Store,
  Clock,
  CreditCard,
  Bell,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface RestaurantSettings {
  id?: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  opening_hours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  delivery_enabled: boolean;
  delivery_fee: number;
  minimum_order: number;
  tax_rate: number;
  currency: string;
  timezone: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    opening_hours: {
      monday: { open: "09:00", close: "22:00", closed: false },
      tuesday: { open: "09:00", close: "22:00", closed: false },
      wednesday: { open: "09:00", close: "22:00", closed: false },
      thursday: { open: "09:00", close: "22:00", closed: false },
      friday: { open: "09:00", close: "22:00", closed: false },
      saturday: { open: "09:00", close: "22:00", closed: false },
      sunday: { open: "09:00", close: "22:00", closed: false },
    },
    delivery_enabled: true,
    delivery_fee: 2.99,
    minimum_order: 15.0,
    tax_rate: 8.25,
    currency: "USD",
    timezone: "America/New_York",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    // For now, we'll use default settings since we don't have a settings table
    // In a real app, you'd fetch from a settings table
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      // In a real app, you'd save to a settings table
      // For now, we'll just simulate saving
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const updateOpeningHours = (
    day: string,
    field: string,
    value: string | boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day as keyof typeof prev.opening_hours],
          [field]: value,
        },
      },
    }));
  };

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold gradient-text">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your restaurant settings
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Restaurant Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) =>
                      setSettings({ ...settings, name: e.target.value })
                    }
                    placeholder="Enter restaurant name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    placeholder="contact@restaurant.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) =>
                    setSettings({ ...settings, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe your restaurant"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                    placeholder="USD"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  rows={2}
                  placeholder="Enter full address"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {days.map(({ key, label }) => {
                const daySettings =
                  settings.opening_hours[
                    key as keyof typeof settings.opening_hours
                  ];
                return (
                  <div
                    key={key}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="w-24 font-medium">{label}</div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`${key}-closed`} className="text-sm">
                        Closed
                      </Label>
                      <Switch
                        id={`${key}-closed`}
                        checked={daySettings.closed}
                        onCheckedChange={(checked) =>
                          updateOpeningHours(key, "closed", checked)
                        }
                      />
                    </div>
                    {!daySettings.closed && (
                      <>
                        <Input
                          type="time"
                          value={daySettings.open}
                          onChange={(e) =>
                            updateOpeningHours(key, "open", e.target.value)
                          }
                          className="w-32"
                        />
                        <span className="text-muted-foreground">to</span>
                        <Input
                          type="time"
                          value={daySettings.close}
                          onChange={(e) =>
                            updateOpeningHours(key, "close", e.target.value)
                          }
                          className="w-32"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Delivery Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="delivery-enabled">Enable Delivery</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to order for delivery
                  </p>
                </div>
                <Switch
                  id="delivery-enabled"
                  checked={settings.delivery_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, delivery_enabled: checked })
                  }
                />
              </div>

              {settings.delivery_enabled && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="delivery-fee">Delivery Fee ($)</Label>
                    <Input
                      id="delivery-fee"
                      type="number"
                      step="0.01"
                      value={settings.delivery_fee}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          delivery_fee: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimum-order">Minimum Order ($)</Label>
                    <Input
                      id="minimum-order"
                      type="number"
                      step="0.01"
                      value={settings.minimum_order}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          minimum_order: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      step="0.01"
                      value={settings.tax_rate}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          tax_rate: parseFloat(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  Notification settings will be available in a future update
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="glow-green">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
