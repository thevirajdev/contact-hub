import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Mail, Phone, MessageSquare, Trash2, Calendar, Building, MapPin, FileText, ChevronDown, ChevronUp, Pencil, Maximize2, Camera } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useContacts } from "@/hooks/useContacts";
import { CountryCodeSelect } from "./CountryCodeSelect";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRef } from "react";

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

interface ContactCardProps {
  contact: Contact;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export function ContactCard({ contact, onDelete, isDeleting }: ContactCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPreview, setOpenPreview] = useState(false);
  const { updateContact } = useContacts();
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: contact.name || "",
    email: contact.email || "",
    phone: contact.phone || "",
    message: contact.message || "",
    countryCode: contact.country_code || "+91",
    company: contact.company || "",
    address: contact.address || "",
    notes: contact.notes || "",
    photoUrl: contact.photo_url || "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const fullPhone = `${contact.country_code || ""}${contact.phone}`;
  const hasExtraDetails = contact.company || contact.address || contact.notes;

  const onEditChange = (field: keyof typeof editForm, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please select an image under 5MB.", variant: "destructive" });
      return;
    }
    setIsUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `contacts/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("photos").getPublicUrl(filePath);
      setEditForm(prev => ({ ...prev, photoUrl: publicUrl }));
      toast({ title: "Photo uploaded!", description: "Contact photo has been updated." });
    } catch (err) {
      console.error("Upload error", err);
      toast({ title: "Upload failed", description: "Failed to upload photo.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await updateContact({ id: contact.id, updates: {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        message: editForm.message || null,
        country_code: editForm.countryCode,
        company: editForm.company || null,
        address: editForm.address || null,
        notes: editForm.notes || null,
        photo_url: editForm.photoUrl || null,
      }});
      setOpenEdit(false);
    } finally {
      setSaving(false);
    }
  };

  const onRemovePhoto = async () => {
    setSaving(true);
    try {
      await updateContact({ id: contact.id, updates: { photo_url: null } });
      setEditForm(prev => ({ ...prev, photoUrl: "" }));
      toast({ title: "Photo removed", description: "The profile picture has been cleared." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="group animate-slide-up hover:shadow-lg transition-all duration-300 border-border/50">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            {/* Name */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => contact.photo_url && setOpenPreview(true)}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent shrink-0 overflow-hidden hover:opacity-90 focus:outline-none"
                aria-label="View profile picture"
                title={contact.photo_url ? "View photo" : undefined}
              >
                {contact.photo_url ? (
                  <img src={contact.photo_url} alt={contact.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="h-6 w-6" />
                )}
              </button>
              <div className="min-w-0">
                <h3 className="font-display font-semibold text-lg text-foreground truncate">
                  {contact.name}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(contact.created_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-2 pl-[60px]">
              <a 
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group/link"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate group-hover/link:underline">{contact.email}</span>
              </a>
              <a 
                href={`tel:${fullPhone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors group/link"
              >
                <Phone className="h-4 w-4 shrink-0" />
                <span className="group-hover/link:underline">{fullPhone}</span>
              </a>
            </div>

            {/* Message */}
            {contact.message && (
              <div className="pl-[60px] pt-2 border-t border-border/50">
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="h-4 w-4 shrink-0 mt-0.5" />
                  <p className="line-clamp-2">{contact.message}</p>
                </div>
              </div>
            )}

            {/* Extra Details Toggle */}
            {hasExtraDetails && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="ml-[60px] text-muted-foreground"
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Less details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      More details
                    </>
                  )}
                </Button>

                {showDetails && (
                  <div className="pl-[60px] space-y-2 animate-fade-in">
                    {contact.company && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building className="h-4 w-4 shrink-0" />
                        <span>{contact.company}</span>
                      </div>
                    )}
                    {contact.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="whitespace-pre-wrap">{contact.address}</span>
                      </div>
                    )}
                    {contact.notes && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="whitespace-pre-wrap">{contact.notes}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpenEdit(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              aria-label="Edit contact"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive-ghost"
              size="icon"
              onClick={() => onDelete(contact.id)}
              disabled={isDeleting}
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              aria-label="Delete contact"
            >
              {isDeleting ? (
                <span className="h-4 w-4 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-h-[85vh] overflow-y-auto w-[95vw] sm:w-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Photo Upload */}
            <div className="flex justify-center">
              <div className="relative">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors overflow-hidden"
                >
                  {editForm.photoUrl ? (
                    <img src={editForm.photoUrl} alt="Contact" className="h-full w-full object-cover" />
                  ) : (
                    <Camera className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                    <span className="h-5 w-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </div>
            </div>
            <div className="text-center">
              <Button type="button" variant="ghost" size="sm" onClick={onRemovePhoto} disabled={saving || isUploading || !editForm.photoUrl}>
                Remove photo
              </Button>
            </div>

            <div className="space-y-1">
              <Label htmlFor={`name-${contact.id}`}>Name</Label>
              <Input id={`name-${contact.id}`} value={editForm.name} onChange={(e) => onEditChange("name", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`email-${contact.id}`}>Email</Label>
              <Input id={`email-${contact.id}`} type="email" value={editForm.email} onChange={(e) => onEditChange("email", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`phone-${contact.id}`}>Phone</Label>
              <div className="flex gap-2">
                <CountryCodeSelect value={editForm.countryCode} onChange={(code) => onEditChange("countryCode", code)} />
                <Input id={`phone-${contact.id}`} value={editForm.phone} onChange={(e) => onEditChange("phone", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`message-${contact.id}`}>Message</Label>
              <Textarea id={`message-${contact.id}`} value={editForm.message} onChange={(e) => onEditChange("message", e.target.value)} rows={3} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`company-${contact.id}`}>Company</Label>
              <Input id={`company-${contact.id}`} value={editForm.company} onChange={(e) => onEditChange("company", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`address-${contact.id}`}>Address</Label>
              <Textarea id={`address-${contact.id}`} value={editForm.address || ""} onChange={(e) => onEditChange("address", e.target.value)} rows={2} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`notes-${contact.id}`}>Notes</Label>
              <Textarea id={`notes-${contact.id}`} value={editForm.notes || ""} onChange={(e) => onEditChange("notes", e.target.value)} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenEdit(false)}>Cancel</Button>
            <Button variant="accent" onClick={onSave} disabled={saving || isUploading}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Maximize2 className="h-4 w-4" /> Profile Photo</DialogTitle>
          </DialogHeader>
          {contact.photo_url ? (
            <img src={contact.photo_url} alt={contact.name} className="w-full h-auto rounded-md" />
          ) : (
            <div className="p-6 text-center text-muted-foreground">No photo available</div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
