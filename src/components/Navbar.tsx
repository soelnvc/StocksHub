import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionContext";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, LayoutDashboard, Trophy, Bot, User, TrendingUp } from "lucide-react"; // Import TrendingUp icon
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar: React.FC = () => {
  const { user } = useSession();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const userName = user?.user_metadata?.first_name || user?.email;

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { name: "Trade", path: "/trade", icon: <TrendingUp className="h-4 w-4" /> }, // New Trade link
    { name: "Leaderboard", path: "/leaderboard", icon: <Trophy className="h-4 w-4" /> },
    { name: "AI Mentor", path: "/ai-mentor", icon: <Bot className="h-4 w-4" /> },
    { name: "Profile", path: "/profile", icon: <User className="h-4 w-4" /> },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="text-2xl font-bold">
          StockSim
        </Link>

        {user && (
          <div className="flex items-center space-x-4">
            {!isMobile && (
              <div className="flex space-x-4">
                {navItems.map((item) => (
                  <Button key={item.path} variant="ghost" asChild className="text-white hover:bg-white hover:text-blue-600">
                    <Link to={item.path} className="flex items-center space-x-2">
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                ))}
              </div>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} />
                    <AvatarFallback className="bg-blue-800 text-white">
                      {getInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                {isMobile && (
                  <>
                    {navItems.map((item) => (
                      <DropdownMenuItem key={item.path} onClick={() => navigate(item.path)}>
                        {item.icon}
                        <span className="ml-2">{item.name}</span>
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;