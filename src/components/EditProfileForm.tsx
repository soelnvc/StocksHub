import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useProfileData } from "@/hooks/use-profile-data";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const profileFormSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required." }).max(50, { message: "First name must not be longer than 50 characters." }).optional().or(z.literal("")),
  last_name: z.string().min(1, { message: "Last name is required." }).max(50, { message: "Last name must not be longer than 50 characters." }).optional().or(z.literal("")),
  avatar_url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  onClose: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onClose }) => {
  const { profile, updateProfile, isLoadingProfileData } = useProfileData();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      avatar_url: profile?.avatar_url || "",
    },
    values: { // Use `values` to ensure form is updated when `profile` changes
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      avatar_url: profile?.avatar_url || "",
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    const success = await updateProfile(data);
    if (success) {
      onClose();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" {...field} disabled={isLoadingProfileData} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Doe" {...field} disabled={isLoadingProfileData} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/avatar.jpg" {...field} disabled={isLoadingProfileData} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="submit" disabled={isLoadingProfileData}>
            {isLoadingProfileData && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default EditProfileForm;