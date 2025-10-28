import Layout from "@/components/Layout";
import { useSession } from "@/contexts/SessionContext";
import { useUserPortfolio } from "@/hooks/use-user-portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, DollarSign } from "lucide-react";

const Profile = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const { balance, isLoadingPortfolio } = useUserPortfolio();

  const isLoading = isSessionLoading || isLoadingPortfolio;

  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    let initials = "";
    if (firstName) initials += firstName[0];
    if (lastName) initials += lastName[0];
    return initials.toUpperCase() || "U";
  };

  const firstName = user?.user_metadata?.first_name;
  const lastName = user?.user_metadata?.last_name;
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">Your Profile</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Manage your personal information and view your trading overview.
        </p>

        <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader className="flex flex-col items-center space-y-4 pb-4 border-b dark:border-gray-700">
            {isLoading ? (
              <Skeleton className="h-24 w-24 rounded-full" />
            ) : (
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl} alt={fullName || "User Avatar"} />
                <AvatarFallback className="bg-blue-600 text-white text-3xl">
                  {getInitials(firstName, lastName)}
                </AvatarFallback>
              </Avatar>
            )}
            {isLoading ? (
              <Skeleton className="h-6 w-3/4" />
            ) : (
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                {fullName || user?.email || "Anonymous User"}
              </CardTitle>
            )}
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-center space-x-2 text-lg text-gray-700 dark:text-gray-300">
              <Mail className="h-5 w-5" />
              {isLoading ? <Skeleton className="h-5 w-1/2" /> : <span>{user?.email}</span>}
            </div>
            <div className="flex items-center justify-center space-x-2 text-2xl font-semibold text-gray-900 dark:text-white">
              <DollarSign className="h-6 w-6" />
              {isLoading ? (
                <Skeleton className="h-7 w-1/3" />
              ) : (
                <span>
                  ₹{balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              This is your current virtual trading balance.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;