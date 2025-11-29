import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  MapPin, 
  Building2, 
  Menu, 
  X,
  Compass,
  User,
  LogOut,
  Coffee,
  Camera,
  Bus,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SettingsDropdown } from "@/components/SettingsDropdown";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TravelLayoutProps {
  children: React.ReactNode;
}

const exploreItems = [
  { name: "Tourist Spots", href: "/spots", icon: MapPin },
  { name: "Accommodations", href: "/accommodations", icon: Building2 },
  { name: "Cafe Shop", href: "/cafe", icon: Coffee },
  { name: "Gallery", href: "/gallery", icon: Camera },
  { name: "Transport Guide", href: "/transport", icon: Bus },
];

export function TravelLayout({ children }: TravelLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [exploreOpen, setExploreOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isGuest, isAdmin, loading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated && !isGuest) {
      navigate('/login');
    }
  }, [isAuthenticated, isGuest, navigate]);

  useEffect(() => {
    if (user && isAuthenticated && !isGuest) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        
        if (data?.full_name) {
          setProfileName(data.full_name);
        }
      };

      fetchProfile();

      const channel = supabase
        .channel('profile-changes')
        .on('postgres_changes', 
          { 
            event: 'UPDATE', 
            schema: 'public', 
            table: 'profiles',
            filter: `user_id=eq.${user.id}`
          }, 
          (payload) => {
            if (payload.new && 'full_name' in payload.new) {
              setProfileName(payload.new.full_name as string);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, isAuthenticated, isGuest]);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "See you next time!",
    });
    navigate('/login');
  };

  // Get user role display text
  const getUserRole = () => {
    if (isGuest) return 'Guest';
    if (isAdmin) return 'Admin';
    return 'Tourist';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay with Animation */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-in-out",
        sidebarOpen 
          ? "opacity-100 visible" 
          : "opacity-0 invisible"
      )}>
        {/* Backdrop with fade animation */}
        <div 
          className={cn(
            "fixed inset-0 bg-black/20 transition-all duration-300 ease-in-out",
            sidebarOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setSidebarOpen(false)}
        />
        
        {/* Sidebar with slide animation */}
        <div className={cn(
          "fixed left-0 top-0 h-full w-64 bg-gradient-to-b from-green-50 to-emerald-50 border-r border-green-200 shadow-xl flex flex-col transform transition-all duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Header */}
          <div className="flex h-20 items-center justify-between px-4 bg-gradient-to-r from-green-600 to-emerald-600">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Compass className="h-8 w-8 text-white" />
                <span className="font-bold text-xl text-white">
                  Tourist Finder
                </span>
              </div>
              <div className="text-xs text-green-100 mt-1">
                Discover Amazing Destinations
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-green-700 hover:text-white transition-all duration-200 hover:scale-110"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info Section with fade animation */}
          <div className={cn(
            "px-4 py-4 bg-white border-b border-green-200 transition-all duration-300 delay-100",
            sidebarOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          )}>
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105">
                  <User className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="font-bold text-green-900 text-lg transition-all duration-300">
                {isGuest ? 'Guest User' : profileName || user?.email?.split('@')[0]}
              </div>
              <div className={cn(
                "transition-all duration-300 font-medium",
                isAdmin ? "text-blue-600" : isGuest ? "text-yellow-600" : "text-green-600"
              )}>
                {getUserRole()}
              </div>
            </div>
          </div>

          <nav className="px-3 space-y-1 flex-1 py-4">
            {/* Dashboard with staggered animation */}
            <div className={cn(
              "transition-all duration-300 delay-150",
              sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            )}>
              <NavLink
                to="/"
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 border hover:scale-105",
                  isActive("/")
                    ? "bg-green-600 text-white shadow-md border-green-500"
                    : "text-green-800 hover:bg-green-100 hover:text-green-900 border-transparent"
                )}
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </NavLink>
            </div>

            {/* Explore Destinations with staggered animation */}
            <div className={cn(
              "transition-all duration-300 delay-200",
              sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            )}>
              <Collapsible open={exploreOpen} onOpenChange={setExploreOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105",
                      "text-green-800 hover:bg-green-100 hover:text-green-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Compass className="h-5 w-5" />
                      Explore Destinations
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      exploreOpen && "rotate-180"
                    )} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-11 pt-2 space-y-1">
                  {exploreItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.name}
                        className={cn(
                          "transition-all duration-300",
                          sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                        )}
                        style={{ transitionDelay: `${250 + index * 50}ms` }}
                      >
                        <NavLink
                          to={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200 hover:scale-105",
                            isActive(item.href)
                              ? "text-green-700 font-medium bg-green-50"
                              : "text-green-600 hover:text-green-800 hover:bg-green-50"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </NavLink>
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            </div>

            {isAuthenticated && !isGuest && (
              <div className={cn(
                "px-3 py-2 mt-4 transition-all duration-300 delay-300",
                sidebarOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              )}>
                <SettingsDropdown />
              </div>
            )}
          </nav>
          
          {/* Footer with staggered animation */}
          <div className={cn(
            "px-4 pb-4 mt-auto transition-all duration-300 delay-400",
            sidebarOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="border-t border-green-200 pt-4">
              <div className="text-center text-green-600 text-sm mb-3 transition-all duration-300">
                <div className="font-medium truncate">
                  {user?.email}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={isGuest ? () => navigate('/login') : handleLogout}
                className="w-full text-green-700 border-green-300 hover:bg-green-600 hover:text-white transition-all duration-200 hover:scale-105"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-green-50 to-emerald-50 border-r border-green-200 shadow-lg transition-all duration-300">
          {/* Header */}
          <div className="flex h-20 items-center px-6 bg-gradient-to-r from-green-600 to-emerald-600 transition-all duration-300">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Compass className="h-8 w-8 text-white transition-all duration-300 hover:scale-110" />
                <span className="font-bold text-xl text-white">
                  Tourist Finder
                </span>
              </div>
              <div className="text-xs text-green-100 mt-1">
                Discover Amazing Destinations
              </div>
            </div>
          </div>

          {/* User Info Section */}
          <div className="px-4 py-4 bg-white border-b border-green-200 transition-all duration-300">
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105">
                  <User className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="font-bold text-green-900 text-lg transition-all duration-300">
                {isGuest ? 'Guest User' : profileName || user?.email?.split('@')[0]}
              </div>
              <div className={cn(
                "transition-all duration-300 font-medium",
                isAdmin ? "text-blue-600" : isGuest ? "text-yellow-600" : "text-green-600"
              )}>
                {getUserRole()}
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1 py-4">
            {/* Dashboard */}
            <NavLink
              to="/"
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 border hover:scale-105",
                isActive("/")
                  ? "bg-green-600 text-white shadow-md border-green-500"
                  : "text-green-800 hover:bg-green-100 hover:text-green-900 border-transparent"
              )}
            >
              <LayoutDashboard className="h-5 w-5 transition-all duration-200" />
              Dashboard
            </NavLink>

            {/* Explore Destinations */}
            <Collapsible open={exploreOpen} onOpenChange={setExploreOpen}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "w-full flex items-center justify-between gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105",
                    "text-green-800 hover:bg-green-100 hover:text-green-900"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Compass className="h-5 w-5 transition-all duration-200" />
                    Explore Destinations
                  </div>
                  <ChevronDown className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    exploreOpen && "rotate-180"
                  )} />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-11 pt-2 space-y-1 transition-all duration-300">
                {exploreItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all duration-200 hover:scale-105",
                        isActive(item.href)
                          ? "text-green-700 font-medium bg-green-50"
                          : "text-green-600 hover:text-green-800 hover:bg-green-50"
                      )}
                    >
                      <Icon className="h-4 w-4 transition-all duration-200" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>

            {isAuthenticated && !isGuest && (
              <div className="px-3 py-2 mt-4 transition-all duration-300">
                <SettingsDropdown />
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-green-200 transition-all duration-300">
            <div className="text-center text-green-600 text-sm mb-3">
              <div className="font-medium truncate transition-all duration-300">
                {user?.email}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={isGuest ? () => navigate('/login') : handleLogout}
              className="w-full text-green-700 border-green-300 hover:bg-green-600 hover:text-white transition-all duration-200 hover:scale-105"
            >
              <LogOut className="h-4 w-4 mr-2 transition-all duration-200" />
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <div className="lg:hidden flex h-16 items-center gap-4 px-4 border-b bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border-green-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-green-700 hover:text-green-800 hover:bg-green-100 transition-all duration-200 hover:scale-110"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Compass className="h-6 w-6 text-green-600 transition-all duration-300 hover:scale-110" />
            <span className="font-bold text-green-800 transition-all duration-300">
              Tourist Finder
            </span>
          </div>
        </div>

        <main className="min-h-screen bg-background scroll-smooth transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
