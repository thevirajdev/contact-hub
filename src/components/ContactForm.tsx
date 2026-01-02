import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CountryCodeSelect } from "./CountryCodeSelect";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User, Mail, Phone, MessageSquare, Send, Building, MapPin, FileText, Camera, ChevronDown, ChevronUp } from "lucide-react";

interface ContactFormData {
  name: string;
  email: string;
  countryCode: string;
  phone: string;
  message: string;
  company: string;
  address: string;
  notes: string;
  photoUrl: string;
}

interface ContactFormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

interface ContactFormProps {
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    message: string;
    country_code: string;
    company: string;
    address: string;
    notes: string;
    photo_url: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s\-()]{6,}$/;

export function ContactForm({ onSubmit, isSubmitting }: ContactFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showOptional, setShowOptional] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    countryCode: "+91",
    phone: "",
    message: "",
    company: "",
    address: "",
    notes: "",
    photoUrl: "",
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors = useMemo<ContactFormErrors>(() => {
    const errs: ContactFormErrors = {};
    
    if (!formData.name.trim()) {
      errs.name = "Name is required";
    } else if (formData.name.trim().length > 100) {
      errs.name = "Name must be less than 100 characters";
    }
    
    if (!formData.email.trim()) {
      errs.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = "Please enter a valid email address";
    } else if (formData.email.trim().length > 255) {
      errs.email = "Email must be less than 255 characters";
    }
    
    if (!formData.phone.trim()) {
      errs.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      errs.phone = "Please enter a valid phone number";
    }
    
    return errs;
  }, [formData]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `contacts/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("photos")
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, photoUrl: publicUrl }));
      toast({
        title: "Photo uploaded!",
        description: "Contact photo has been added.",
      });
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ name: true, email: true, phone: true });
    
    if (!isValid) return;
    
    await onSubmit({
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      message: formData.message.trim(),
      country_code: formData.countryCode,
      company: formData.company.trim(),
      address: formData.address.trim(),
      notes: formData.notes.trim(),
      photo_url: formData.photoUrl,
    });
    
    setFormData({
      name: "",
      email: "",
      countryCode: "+91",
      phone: "",
      message: "",
      company: "",
      address: "",
      notes: "",
      photoUrl: "",
    });
    setTouched({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Photo Upload */}
      <div className="flex justify-center">
        <div className="relative">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-secondary/80 transition-colors overflow-hidden"
          >
            {formData.photoUrl ? (
              <img src={formData.photoUrl} alt="Contact" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          {isUploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
              <span className="h-5 w-5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>
      </div>
      <p className="text-center text-xs text-muted-foreground">Add photo (optional)</p>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <User className="h-4 w-4 text-muted-foreground" />
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          placeholder="John Doe"
          className={touched.name && errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {touched.name && errors.name && (
          <p className="text-sm text-destructive animate-fade-in">{errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Mail className="h-4 w-4 text-muted-foreground" />
          Email <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          placeholder="john@example.com"
          className={touched.email && errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {touched.email && errors.email && (
          <p className="text-sm text-destructive animate-fade-in">{errors.email}</p>
        )}
      </div>

      {/* Phone Field with Country Code */}
      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Phone className="h-4 w-4 text-muted-foreground" />
          Phone <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          <CountryCodeSelect
            value={formData.countryCode}
            onChange={(code) => handleChange("countryCode", code)}
          />
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            onBlur={() => handleBlur("phone")}
            placeholder="9876543210"
            className={`flex-1 ${touched.phone && errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
          />
        </div>
        {touched.phone && errors.phone && (
          <p className="text-sm text-destructive animate-fade-in">{errors.phone}</p>
        )}
      </div>

      {/* Message Field */}
      <div className="space-y-2">
        <Label htmlFor="message" className="flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          Message <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          placeholder="Add a note about this contact..."
          rows={3}
          maxLength={1000}
        />
      </div>

      {/* Optional Fields Toggle */}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowOptional(!showOptional)}
        className="w-full text-muted-foreground"
      >
        {showOptional ? (
          <>
            <ChevronUp className="h-4 w-4 mr-1" />
            Hide additional details
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-1" />
            Add more details
          </>
        )}
      </Button>

      {/* Optional Fields */}
      {showOptional && (
        <div className="space-y-4 animate-fade-in">
          <div className="space-y-2">
            <Label htmlFor="company" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Building className="h-4 w-4 text-muted-foreground" />
              Company
            </Label>
            <Input
              id="company"
              type="text"
              value={formData.company}
              onChange={(e) => handleChange("company", e.target.value)}
              placeholder="Company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Full address"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2 text-sm font-medium text-foreground">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="accent"
        size="lg"
        className="w-full"
        disabled={!isValid || isSubmitting || isUploading}
      >
        {isSubmitting ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
            Saving...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Add Contact
          </span>
        )}
      </Button>
    </form>
  );
}
