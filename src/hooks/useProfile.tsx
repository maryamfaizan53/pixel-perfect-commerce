import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  date_of_birth: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  street_address: string;
  apartment: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAddresses();
    } else {
      setProfile(null);
      setAddresses([]);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      toast.success("Profile updated successfully");
      return { error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
      return { error };
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: new Error("Not authenticated"), url: null };

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if any
      await supabase.storage.from("avatars").remove([fileName]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });
      
      toast.success("Avatar uploaded successfully");
      return { error: null, url: publicUrl };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
      return { error, url: null };
    } finally {
      setUploading(false);
    }
  };

  const addAddress = async (address: Omit<Address, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      // If this is the first address or marked as default, unset other defaults
      if (address.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      const { data, error } = await supabase
        .from("addresses")
        .insert({
          ...address,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      
      setAddresses(prev => [...prev, data]);
      toast.success("Address added successfully");
      return { error: null, data };
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
      return { error };
    }
  };

  const updateAddress = async (id: string, updates: Partial<Address>) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      if (updates.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id);
      }

      const { error } = await supabase
        .from("addresses")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      await fetchAddresses();
      toast.success("Address updated successfully");
      return { error: null };
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("Failed to update address");
      return { error };
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    try {
      const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      
      setAddresses(prev => prev.filter(a => a.id !== id));
      toast.success("Address deleted successfully");
      return { error: null };
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
      return { error };
    }
  };

  return {
    profile,
    addresses,
    loading,
    uploading,
    updateProfile,
    uploadAvatar,
    addAddress,
    updateAddress,
    deleteAddress,
    refetch: fetchProfile,
    refetchAddresses: fetchAddresses,
  };
};