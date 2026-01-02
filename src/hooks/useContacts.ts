import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./useAuth";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message?: string | null;
  country_code?: string | null;
  photo_url?: string | null;
  company?: string | null;
  address?: string | null;
  notes?: string | null;
  created_at: string;
}

interface NewContact {
  name: string;
  email: string;
  phone: string;
  message: string;
  country_code: string;
  company: string;
  address: string;
  notes: string;
  photo_url: string;
}

export function useContacts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch all contacts for current user
  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ["contacts", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data as Contact[];
    },
    enabled: !!user,
  });

  // Add new contact
  const addContactMutation = useMutation({
    mutationFn: async (newContact: NewContact) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("contacts")
        .insert([{
          user_id: user.id,
          name: newContact.name,
          email: newContact.email,
          phone: newContact.phone,
          message: newContact.message || null,
          country_code: newContact.country_code,
          company: newContact.company || null,
          address: newContact.address || null,
          notes: newContact.notes || null,
          photo_url: newContact.photo_url || null,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", user?.id] });
      toast({
        title: "Contact added!",
        description: "The contact has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error("Error adding contact:", error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete contact
  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", user?.id] });
      toast({
        title: "Contact deleted",
        description: "The contact has been removed.",
      });
    },
    onError: (error) => {
      console.error("Error deleting contact:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update contact
  const updateContactMutation = useMutation({
    mutationFn: async (params: { id: string; updates: Partial<Contact> }) => {
      const { id, updates } = params;
      const { data, error } = await supabase
        .from("contacts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts", user?.id] });
      toast({
        title: "Contact updated",
        description: "Changes have been saved.",
      });
    },
    onError: (error) => {
      console.error("Error updating contact:", error);
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    contacts,
    isLoading,
    error,
    addContact: addContactMutation.mutateAsync,
    isAddingContact: addContactMutation.isPending,
    deleteContact: deleteContactMutation.mutateAsync,
    updateContact: updateContactMutation.mutateAsync,
  };
}
