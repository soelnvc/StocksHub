import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
// Removed: import { LayoutDashboard, Trophy, Bot, User, TrendingUp, History } from "lucide-react";

interface MobileNavProps {
  navItems: Array<{ name: string; path: string; icon: React.ReactNode }>;
  onLinkClick?: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ navItems, onLinkClick }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
    if (onLinkClick) {
      onLinkClick();
    }
  };

  // Close sheet if route changes (e.g., after login redirect)
  React.useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden text-white">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[250px] sm:w-[300px] bg-sidebar-background text-sidebar-foreground flex flex-col">
        <SheetHeader className="border-b pb-4 mb-4">
          <SheetTitle className="text-2xl font-bold text-sidebar-primary">StockSim</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "secondary" : "ghost"}
              asChild
              className={`justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                location.pathname === item.path ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
              }`}
              onClick={handleLinkClick}
            >
              <Link to={item.path} className="flex items-center space-x-3">
                {item.icon}
                <span>{item.name}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;