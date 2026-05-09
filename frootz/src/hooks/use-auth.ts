import { useQueryClient } from "@tanstack/react-query";
import { useGetMe, getGetMeQueryKey, useAdminLogin, useAdminLogout } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export function useAuth() {
  const { data: user, isLoading, error } = useGetMe({
    query: {
      queryKey: getGetMeQueryKey(),
      retry: false,
    }
  });
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const loginMutation = useAdminLogin({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({
          title: "Login successful",
          description: "Welcome to the admin panel.",
        });
        setLocation("/admin/dashboard");
      },
      onError: (err) => {
        toast({
          title: "Login failed",
          description: err instanceof Error ? err.message : "Invalid credentials",
          variant: "destructive",
        });
      },
    },
  });

  const logoutMutation = useAdminLogout({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        toast({
          title: "Logged out",
          description: "You have been logged out successfully.",
        });
        setLocation("/admin");
      },
    },
  });

  return {
    user,
    isLoading,
    isError: !!error,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}