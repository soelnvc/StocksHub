import React from "react";
import Navbar from "./Navbar";
import { MadeWithDyad } from "./made-with-dyad";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-950">
      <Navbar />
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default Layout;