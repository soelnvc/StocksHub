import { useSession } from "@/contexts/SessionContext";
import { Navigate } from "react-router-dom";
// Removed: import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">Loading StockSim...</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Preparing your virtual trading experience.
          </p>
        </div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
};

export default Index;