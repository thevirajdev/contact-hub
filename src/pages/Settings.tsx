import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ArrowLeft, LogOut, Moon, Sun, User, Shield } from "lucide-react";
import { useEffect, useState } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle("dark", newIsDark);
    localStorage.setItem("theme", newIsDark ? "dark" : "light");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <>
      <Helmet>
        <title>Settings - Contact Manager</title>
        <meta name="description" content="Manage your app settings." />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 sm:py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">Settings</h1>
                <p className="text-xs text-muted-foreground">App preferences</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
          <div className="space-y-4">
            {/* Account Section */}
            <div className="bg-card rounded-xl border border-border/50 p-4 sm:p-6 shadow-lg animate-slide-up">
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-accent" />
                Account
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Email</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate("/profile")}
                >
                  <User className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Appearance Section */}
            <div className="bg-card rounded-xl border border-border/50 p-4 sm:p-6 shadow-lg animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                {isDark ? <Moon className="h-5 w-5 text-accent" /> : <Sun className="h-5 w-5 text-accent" />}
                Appearance
              </h2>
              <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div>
                  <p className="font-medium text-foreground">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    {isDark ? "Dark mode" : "Light mode"}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTheme}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-card rounded-xl border border-border/50 p-4 sm:p-6 shadow-lg animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-accent" />
                Security
              </h2>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Settings;
