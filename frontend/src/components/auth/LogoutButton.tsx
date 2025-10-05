"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { toast } from "sonner";
import React from "react";

interface LogoutButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  children?: React.ReactNode;
}

export function LogoutButton({ 
  className = "", 
  variant = "outline",
  children = "Sign Out" 
}: LogoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      const { error } = await signOut();
      
      if (error) {
        toast.error(error);
        return;
      }
      
      toast.success("Successfully signed out");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant={variant}
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {loading ? "Signing out..." : children}
    </Button>
  );
}
