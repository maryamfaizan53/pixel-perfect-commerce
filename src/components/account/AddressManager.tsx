import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useProfile, Address } from "@/hooks/useProfile";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const addressSchema = z.object({
  label: z.string().min(1, "Label is required").max(50),
  full_name: z.string().min(2, "Name is required").max(100),
  street_address: z.string().min(5, "Street address is required").max(200),
  apartment: z.string().max(100).optional().or(z.literal("")),
  city: z.string().min(2, "City is required").max(100),
  state: z.string().min(2, "State/Province is required").max(100),
  postal_code: z.string().min(4, "Postal code is required").max(20),
  country: z.string().min(2, "Country is required").max(100),
  phone: z.string().max(20).optional().or(z.literal("")),
  is_default: z.boolean(),
});

type AddressFormData = z.infer<typeof addressSchema>;

export const AddressManager = () => {
  const { addresses, loading, addAddress, updateAddress, deleteAddress } = useProfile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "Home",
      full_name: "",
      street_address: "",
      apartment: "",
      city: "",
      state: "",
      postal_code: "",
      country: "Pakistan",
      phone: "",
      is_default: false,
    },
  });

  const isDefault = watch("is_default");

  const openAddDialog = () => {
    setEditingAddress(null);
    reset({
      label: "Home",
      full_name: "",
      street_address: "",
      apartment: "",
      city: "",
      state: "",
      postal_code: "",
      country: "Pakistan",
      phone: "",
      is_default: addresses.length === 0,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    reset({
      label: address.label,
      full_name: address.full_name,
      street_address: address.street_address,
      apartment: address.apartment || "",
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || "",
      is_default: address.is_default,
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: AddressFormData) => {
    setSaving(true);
    
    if (editingAddress) {
      await updateAddress(editingAddress.id, data);
    } else {
      await addAddress({
        label: data.label,
        full_name: data.full_name,
        street_address: data.street_address,
        apartment: data.apartment || null,
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        country: data.country,
        phone: data.phone || null,
        is_default: data.is_default,
      });
    }
    
    setSaving(false);
    setDialogOpen(false);
    reset();
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    await deleteAddress(id);
    setDeleting(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Saved Addresses</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? "Edit Address" : "Add New Address"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="label">Address Label</Label>
                <Input
                  id="label"
                  {...register("label")}
                  placeholder="Home, Work, etc."
                />
                {errors.label && (
                  <p className="text-sm text-destructive">{errors.label.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  {...register("full_name")}
                  placeholder="Recipient's full name"
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="street_address">Street Address</Label>
                <Input
                  id="street_address"
                  {...register("street_address")}
                  placeholder="Street address"
                />
                {errors.street_address && (
                  <p className="text-sm text-destructive">{errors.street_address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartment">Apartment/Suite (Optional)</Label>
                <Input
                  id="apartment"
                  {...register("apartment")}
                  placeholder="Apt, suite, floor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="text-sm text-destructive">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    {...register("state")}
                    placeholder="State"
                  />
                  {errors.state && (
                    <p className="text-sm text-destructive">{errors.state.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    {...register("postal_code")}
                    placeholder="Postal code"
                  />
                  {errors.postal_code && (
                    <p className="text-sm text-destructive">{errors.postal_code.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...register("country")}
                    placeholder="Country"
                  />
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="+92 300 1234567"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_default"
                  checked={isDefault}
                  onCheckedChange={(checked) => setValue("is_default", checked === true)}
                />
                <Label htmlFor="is_default" className="cursor-pointer">
                  Set as default address
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingAddress ? (
                    "Update"
                  ) : (
                    "Add Address"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No saved addresses yet</p>
            <Button variant="outline" onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="p-4 border border-border rounded-lg relative"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{address.label}</p>
                    {address.is_default && (
                      <Badge variant="secondary" className="text-xs">Default</Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm font-medium">{address.full_name}</p>
                <p className="text-sm text-muted-foreground">{address.street_address}</p>
                {address.apartment && (
                  <p className="text-sm text-muted-foreground">{address.apartment}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p className="text-sm text-muted-foreground">{address.country}</p>
                {address.phone && (
                  <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
                )}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(address)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                    disabled={deleting === address.id}
                  >
                    {deleting === address.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Remove
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};