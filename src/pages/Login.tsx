import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/contexts/SessionContext";
import { Navigate } from "react-router-dom";

const Login = () => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (session) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Welcome to StockSim
        </h2>
        <Auth
          supabaseClient={supabase}
          providers={[]}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "hsl(240 5.9% 10%)", // Primary color for buttons
                  brandAccent: "hsl(224.3 76.3% 48%)", // Accent color
                },
              },
            },
          }}
          theme="light" // Using light theme for Auth UI
          redirectTo={window.location.origin + "/dashboard"}
        />
      </div>
    </div>
  );
};

export default Login;