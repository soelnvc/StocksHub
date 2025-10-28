import Layout from "@/components/Layout";
import { useSession } from "@/contexts/SessionContext";
import { useUserPortfolio } from "@/hooks/use-user-portfolio";
import { useGamification } from "@/hooks/use-gamification"; // Import useGamification
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, DollarSign, Award, Flame, Package } from "lucide-react"; // Import additional icons
import { Badge } from "@/components/ui/badge"; // Import Badge component

const Profile = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const { balance, isLoadingPortfolio } = useUserPortfolio();
  const { xpData, streakData, badges, isLoadingGamification } = useGamification(); // Get gamification data

  const isLoading = isSessionLoading || isLoadingPortfolio || isLoadingGamification;

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

        <div className="w-full max-w-4xl grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {/* User Info Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg md:col-span-1 lg:col-span-1">
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
            </CardContent>
          </Card>

          {/* Balance Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg md:col-span-1 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Virtual Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-3/4" />
              ) : (
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  ₹{balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Your current virtual trading funds.
              </p>
            </CardContent>
          </Card>

          {/* XP & Level Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg md:col-span-1 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                XP & Level
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-3/4" />
              ) : (
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  Level {xpData?.level || 1}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {xpData?.xp || 0} XP earned
              </p>
            </CardContent>
          </Card>

          {/* Trading Streak Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg md:col-span-1 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Trading Streak
              </CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-3/4" />
              ) : (
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {streakData?.current_streak || 0} Days
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Longest: {streakData?.longest_streak || 0} days
              </p>
            </CardContent>
          </Card>

          {/* Badges Card */}
          <Card className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-lg md:col-span-2 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Your Badges</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : badges.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                  No badges earned yet. Keep trading to unlock achievements!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center py-4">
                  {badges.map((badge) => (
                    <Badge key={badge.id} variant="secondary" className="text-lg px-4 py-2">
                      {badge.badge_name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;