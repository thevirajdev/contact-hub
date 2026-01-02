import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ContactForm } from "@/components/ContactForm";
import { ContactList } from "@/components/ContactList";
import { useContacts } from "@/hooks/useContacts";
import { useAuth } from "@/hooks/useAuth";
import { BookUser, Loader2, Settings, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const { contacts, isLoading, addContact, isAddingContact, deleteContact } = useContacts();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <>
      <Helmet>
        <title>Contact Manager - Organize Your Contacts</title>
        <meta name="description" content="A simple and elegant contact management application. Add, view, and organize your contacts with ease." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-md">
                  <BookUser className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="font-display text-xl font-bold text-foreground">Contact Manager</h1>
                  <p className="text-xs text-muted-foreground">Welcome, {user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => navigate("/privacy-policy")} title="Privacy Policy">
                  <Shield className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <div className="bg-card rounded-xl border border-border/50 p-6 shadow-lg">
                  <h2 className="font-display text-lg font-semibold text-foreground mb-1">Add New Contact</h2>
                  <p className="text-sm text-muted-foreground mb-6">Fill in the details to save a new contact.</p>
                  <ContactForm onSubmit={async (data) => { await addContact(data); }} isSubmitting={isAddingContact} />
                </div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="bg-card rounded-xl border border-border/50 p-6 shadow-lg">
                <h2 className="font-display text-lg font-semibold text-foreground mb-6">Your Contacts</h2>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 text-accent animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading contacts...</p>
                  </div>
                ) : (
                  <ContactList contacts={contacts} onDelete={deleteContact} />
                )}
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-border/50 mt-auto">
          <div className="container mx-auto px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">Contact Manager © {new Date().getFullYear()}. Built with care.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
