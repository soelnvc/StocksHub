import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useSession } from "@/contexts/SessionContext";
import { useUserPortfolio } from "@/hooks/use-user-portfolio";
import { useGamification } from "@/hooks/use-gamification";
import { useProfileData } from "@/hooks/use-profile-data";
import { useResetAccount } from "@/hooks/use-reset-account";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Award, Flame, Package, Edit, RotateCcw } from "lucide-react"; // Removed DollarSign
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import EditProfileForm from "@/components/EditProfileForm";
import { formatCurrency } from "@/utils/currency";

const Profile = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const { balance, isLoadingPortfolio, fetchPortfolio } = useUserPortfolio();
  const { xpData, streakData, badges, isLoadingGamification, fetchGamificationData } = useGamification();
  const { profile, isLoadingProfileData, fetchProfileData } = useProfileData();
  const { isResetting, resetAccount } = useResetAccount();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const isLoading = isSessionLoading || isLoadingPortfolio || isLoadingGamification || isLoadingProfileData;

  const getInitials = (firstName: string | null | undefined, lastName: string | null | undefined) => {
    let initials = "";
    if (firstName) initials += firstName[0];
    if (lastName) initials && (initials += lastName[0]);
    return initials.toUpperCase() || "U";
  };

  const firstName = profile?.first_name;
  const lastName = profile?.last_name;
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  const avatarUrl = profile?.avatar_url;

  useEffect(() => {
    if (!isSessionLoading && user) {
      fetchProfileData();
      fetchPortfolio();
      fetchGamificationData();
    }
  }, [user, isSessionLoading, fetchProfileData, fetchPortfolio, fetchGamificationData]);

  const handleResetConfirm = async () => {
    const success = await resetAccount();
    if (success) {
      setIsResetDialogOpen(false);
      await fetchProfileData();
      await fetchPortfolio();
      await fetchGamificationData();
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-8">Your Profile</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Manage your personal information and view your trading overview.
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full max-w-5xl">
          {/* User Info Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg md:col-span-1 lg:col-span-1">
            <CardHeader className="flex flex-col items-center space-y-4 pb-4 border-b dark:border-gray-700">
              {isLoading ? (
                <Skeleton className="h-24 w-24 rounded-full" />
              ) : (
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl || undefined} alt={fullName || "User Avatar"} />
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
                {/* Removed DollarSign icon here */}
                {isLoading ? (
                  <Skeleton className="h-7 w-1/3" />
                ) : (
                  <span>
                    {formatCurrency(balance)}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Your current virtual trading balance.
              </p>
              <div className="flex flex-col space-y-2 mt-4">
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Edit className="mr-2 h-4 w-4" /> Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <EditProfileForm onClose={() => setIsEditDialogOpen(false)} />
                  </DialogContent>
                </Dialog>

                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" disabled={isLoading || isResetting}>
                      <RotateCcw className="mr-2 h-4 w-4" /> Reset Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Account Reset</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to reset your account? This will clear your balance, all stock holdings, transaction history, and gamification progress. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsResetDialogOpen(false)} disabled={isResetting}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleResetConfirm} disabled={isResetting}>
                        {isResetting ? "Resetting..." : "Confirm Reset"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Gamification Summary Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg md:col-span-1 lg:col-span-2">
            <CardHeader className="border-b dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Gamification Progress</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">XP & Level:</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-2/3 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      Level {xpData?.level || 1} ({xpData?.xp || 0} XP)
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Trading Streak:</p>
                  {isLoading ? (
                    <Skeleton className="h-6 w-2/3 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center justify-center sm:justify-start space-x-2">
                      <Flame className="h-6 w-6 text-orange-500" />
                      <span>{streakData?.current_streak || 0} Days</span>
                    </p>
                  )}
                  {!isLoading && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Longest: {streakData?.longest_streak || 0} days
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges Card */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg md:col-span-2 lg:col-span-3">
            <CardHeader className="border-b dark:border-gray-700">
              <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Your Badges</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="h-8 w-20" />
                </div>
              ) : badges.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center py-4">
                  No badges earned yet. Keep trading to unlock achievements!
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 justify-center">
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