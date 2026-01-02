import { useState, useMemo } from "react";
import { ContactCard } from "./ContactCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Users, Search, X } from "lucide-react";

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

interface ContactListProps {
  contacts: Contact[];
  onDelete: (id: string) => Promise<void>;
}

type SortOption = "name-asc" | "name-desc" | "date-asc" | "date-desc";

export function ContactList({ contacts, onDelete }: ContactListProps) {
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredAndSortedContacts = useMemo(() => {
    let result = [...contacts];

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.email.toLowerCase().includes(term) ||
          c.phone.includes(term) ||
          c.company?.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "date-asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "date-desc":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [contacts, sortBy, searchTerm]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    await onDelete(id);
    setDeletingId(null);
  };

  const cycleSortOption = () => {
    const options: SortOption[] = ["name-asc", "name-desc", "date-desc", "date-asc"];
    const currentIndex = options.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % options.length;
    setSortBy(options[nextIndex]);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "name-asc":
        return "A → Z";
      case "name-desc":
        return "Z → A";
      case "date-asc":
        return "Oldest";
      case "date-desc":
        return "Newest";
    }
  };

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">
          No contacts yet
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Add your first contact using the form. All contacts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="default"
          onClick={cycleSortOption}
          className="shrink-0"
        >
          <ArrowUpDown className="h-4 w-4 mr-2" />
          {getSortLabel()}
        </Button>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredAndSortedContacts.length} of {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
        {searchTerm && ` matching "${searchTerm}"`}
      </p>

      {/* Contact cards */}
      {filteredAndSortedContacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            No results found
          </h3>
          <p className="text-muted-foreground">
            Try a different search term
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedContacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onDelete={handleDelete}
              isDeleting={deletingId === contact.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
